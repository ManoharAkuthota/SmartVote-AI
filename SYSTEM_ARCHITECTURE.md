# SmartVote AI — System Architecture & Design

SmartVote AI is an enterprise-grade cryptographic democratic voting engine built on modern cloud-native principles, browser-native biometrics, and zero-knowledge receipts.

---

## 1. High-Level Architecture Overview

SmartVote AI decouples biometric authentication, cryptographic ballot sealing, and administrative telemetry into resilient modular layers.

```mermaid
graph TD
    subgraph ClientLayer ["Client Presentation Layer (React 18 + Vite + Tailwind)"]
        UI["Futuristic Dark Glassmorphic UI"]
        Webcam["HTML5 MediaDevices Webcam"]
        FaceEngine["In-Browser Neural Engine (Face-api.js)"]
        Liveness["Anti-Spoof Liveness (EAR Blink + Head Pose Yaw)"]
        ReceiptGen["jsPDF & QR Code Receipt Generator"]
    end

    subgraph SecurityGateway ["Security & Gateway Layer"]
        CORS["CORS Preflight & Security Headers"]
        JWTFilter["Spring Security JwtAuthenticationFilter"]
        RateLimit["Rate Limiter & Account Lockout Guard"]
    end

    subgraph CoreBackend ["Spring Boot 3.3 Backend (Java 21)"]
        AuthSvc["AuthService (Multi-Factor Orchestrator)"]
        FaceSvc["FaceService (Cosine Similarity >= 0.85)"]
        OtpSvc["OtpService (SecureRandom 6-Digit Codes)"]
        VoteSvc["VoteService (Atomic Ballot Ledger)"]
        ElectionSvc["ElectionService (Ballot Lifecycle)"]
        AuditSvc["AuditService & Threat Telemetry"]
        CloudinarySvc["CloudinaryService (Biometric Storage)"]
        EmailSvc["EmailService (HTML Gmail SMTP)"]
        WSServer["WebSocket STOMP Broker (/topic/elections)"]
    end

    subgraph DataStorage ["Data Persistence Layer"]
        MySQL[(MySQL 8.0 Relational DB)]
        Cloudinary[(Cloudinary Media CDN)]
    end

    Webcam --> FaceEngine
    FaceEngine --> Liveness
    Liveness --> UI
    UI -->|REST JSON + Bearer JWT| SecurityGateway
    UI <-->|WebSocket Telemetry| WSServer
    SecurityGateway --> CoreBackend
    AuthSvc --> FaceSvc
    AuthSvc --> OtpSvc
    AuthSvc --> EmailSvc
    AuthSvc --> CloudinarySvc
    VoteSvc --> WSServer
    CoreBackend --> MySQL
    CloudinarySvc --> Cloudinary
```

---

## 2. Multi-Stage Biometric Authentication Flow

The following sequence diagram details the 3-stage authentication protocol verifying password credentials, browser-native biometric liveness, and two-factor OTP:

```mermaid
sequenceDiagram
    autonumber
    actor Voter as Registered Voter
    participant Browser as React Client (Face-api.js)
    participant Backend as Spring Boot API
    participant DB as MySQL Database
    participant SMTP as Gmail SMTP Mailer

    Voter->>Browser: Enters Email & Master Password
    Browser->>Backend: POST /api/auth/login-init {email, password, fingerprint}
    Backend->>DB: Query User & Check Lock Status
    Backend->>Backend: Verify BCrypt password hash
    Backend-->>Browser: 200 OK {nextStep: "FACE_VERIFY", sessionToken}

    Browser->>Browser: Opens Webcam & Loads Neural Weights
    Browser->>Voter: Prompts "Please blink naturally"
    Voter->>Browser: Blinks eyes (EAR < 0.22 detected)
    Browser->>Voter: Prompts "Turn head slightly to right"
    Voter->>Browser: Yaw rotation detected (Nose-Eye Ratio < 0.75)
    Browser->>Browser: Extracts 128-D descriptor vector

    Browser->>Backend: POST /api/auth/verify-face {liveEmbedding, livenessPassed: true}
    Backend->>DB: Fetch Stored FaceEmbedding Vector
    Backend->>Backend: Calculate Cosine Similarity
    alt Cosine Similarity >= 0.85
        Backend->>Backend: Generate Secure 6-digit OTP (120s expiry)
        Backend->>SMTP: Dispatch HTML Two-Factor Authorization Email
        Backend-->>Browser: 200 OK {nextStep: "OTP_VERIFY", sessionToken}
    else Similarity < 0.85
        Backend->>DB: Increment failed attempts counter
        Backend-->>Browser: 401 Unauthorized "Biometric mismatch"
    end

    Voter->>Browser: Enters 6-Digit OTP Code
    Browser->>Backend: POST /api/auth/verify-otp {otpCode, sessionToken}
    Backend->>DB: Verify OTP & Mark Used
    Backend->>Backend: Generate Signed JWT Token (24h validity)
    Backend-->>Browser: 200 OK {token, userProfile}
    Browser->>Voter: Redirect to Secure Voter Dashboard
```

---

## 3. Cryptographic Ballot Sealing Protocol

To ensure one-voter-one-vote and zero-knowledge verification, the vote casting protocol executes as follows:

```mermaid
sequenceDiagram
    autonumber
    actor Voter as Authenticated Voter
    participant Client as Voter Dashboard
    participant Backend as VoteService
    participant DB as MySQL Database
    participant WS as WebSocket Broker

    Voter->>Client: Selects Candidate & clicks "Review & Seal Vote"
    Client->>Voter: Displays Immutability Warning Dialog
    Voter->>Client: Confirms Ballot Submission

    Client->>Backend: POST /api/votes/cast {electionId, candidateId} [Bearer JWT]
    Backend->>DB: Check unique constraint (election_id, voter_id)
    alt Already Voted
        Backend-->>Client: 409 Conflict "Duplicate vote rejected"
    else First Vote in Election
        Backend->>Backend: Generate Receipt ID: SMV-2026-XXXXXXXX
        Backend->>Backend: Compute SHA-256 Hash Seal: SHA256(receiptId + election + candidate + voterId + timestamp)
        Backend->>Backend: Generate Base64 Digital Signature
        Backend->>DB: Atomically persist Vote record
        Backend->>DB: Atomically increment Candidate and Election vote counts
        Backend->>WS: Broadcast live update to /topic/elections/{id}/votes
        Backend-->>Client: 201 Created {receiptId, receiptHash, digitalSignature, qrCodeData}
    end

    Client->>Client: Explodes celebratory confetti animation
    Client->>Voter: Displays Holographic Receipt Modal with QR & Download PDF
```

---

## 4. Zero-Knowledge Public Receipt Verification

SmartVote AI enables public verifiability without violating the secret ballot:
1. When a vote is cast, a unique public receipt ID `SMV-2026-XXXXXXXX` is generated.
2. The receipt hash is calculated:
   $$\text{ReceiptHash} = \text{SHA256}(\text{receiptId} \,\|\, \text{electionId} \,\|\, \text{candidateId} \,\|\, \text{voterId} \,\|\, \text{salt})$$
3. Anyone holding the receipt ID can query `GET /api/votes/verify-receipt/{receiptId}`.
4. The system confirms:
   - Receipt exists on the ledger.
   - Associated election title and recorded candidate selection.
   - Timestamp and digital seal.
   - **Crucially: The voter's private personal identity is completely omitted from the public verification response.**
