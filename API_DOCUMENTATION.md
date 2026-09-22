# SmartVote AI — REST API Documentation

All API responses follow a standardized JSON envelope structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2026-09-22T11:45:00"
}
```

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register Digital Identity
- **Endpoint**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "mobileNumber": "+1-555-0188",
  "password": "Password@123",
  "voterIdNumber": "SMV-7819234",
  "maskedAadhaar": "XXXX-XXXX-9182",
  "faceImageUrl": "data:image/jpeg;base64,...",
  "faceEmbedding": [0.05, 0.08, 0.12, ...],
  "qualityScore": 0.98
}
```
- **Response**: `201 Created` with created `UserDto`.

### 1.2 Login Step 1 — Credentials Check
- **Endpoint**: `POST /api/auth/login-init`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "voter@smartvote.ai",
  "password": "Voter@123",
  "deviceFingerprint": "Chrome-Windows-11"
}
```
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "nextStep": "FACE_VERIFY",
    "sessionToken": "eyJhbGciOiJIUzI1NiIs...",
    "email": "voter@smartvote.ai",
    "fullName": "Alex Reynolds",
    "faceEnrolled": true,
    "maskedMobile": "******0144"
  }
}
```

### 1.3 Login Step 2 — Facial Liveness & Face Verification Match
- **Endpoint**: `POST /api/auth/verify-face`
- **Access**: Public (requires valid `sessionToken`)
- **Request Body**:
```json
{
  "email": "voter@smartvote.ai",
  "sessionToken": "eyJhbGciOiJIUzI1NiIs...",
  "liveEmbedding": [0.05, 0.08, 0.12, ...],
  "livenessPassed": true,
  "blinkDetected": true,
  "headTurnDetected": true
}
```
- **Response**: `200 OK` with `nextStep: "OTP_VERIFY"`.

### 1.4 Login Step 3 — Two-Factor OTP Confirmation
- **Endpoint**: `POST /api/auth/verify-otp`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "voter@smartvote.ai",
  "otpCode": "849201",
  "sessionToken": "eyJhbGciOiJIUzI1NiIs..."
}
```
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "tokenType": "Bearer",
    "user": {
      "id": 2,
      "fullName": "Alex Reynolds",
      "email": "voter@smartvote.ai",
      "role": "ROLE_VOTER",
      "status": "APPROVED",
      "voterIdNumber": "SMV-8941205"
    }
  }
}
```

---

## 2. Elections & Voting Endpoints

### 2.1 Get Public Elections
- **Endpoint**: `GET /api/elections/public`
- **Access**: Public

### 2.2 Get Active Elections (With Voter Status)
- **Endpoint**: `GET /api/elections/active`
- **Access**: Authenticated (`ROLE_VOTER` or `ROLE_ADMIN`)

### 2.3 Cast Ballot
- **Endpoint**: `POST /api/votes/cast`
- **Access**: Authenticated (`ROLE_VOTER`)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "electionId": 1,
  "candidateId": 2
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "receiptId": "SMV-2026-B87A14C2",
    "electionId": 1,
    "electionTitle": "2026 Global AI Governance Council",
    "candidateName": "Marcus Vance",
    "partyName": "Cyber Sovereignty Alliance",
    "partySymbol": "🛡️",
    "votedAt": "2026-09-22T11:45:10",
    "receiptHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "verificationUrl": "http://localhost:5173/verify?receiptId=SMV-2026-B87A14C2"
  }
}
```

### 2.4 Public Verify Receipt
- **Endpoint**: `GET /api/votes/verify-receipt/{receiptId}`
- **Access**: Public
- **Response**: `200 OK` confirming inclusion on the ledger without disclosing personal voter identity.

---

## 3. Administrative Endpoints (`/api/admin`)

- `GET /api/admin/analytics` $\rightarrow$ Dashboard metrics, hourly trend, candidate vote distribution.
- `GET /api/admin/voters` $\rightarrow$ Search voters with keyword and status filter.
- `PATCH /api/admin/voters/{id}/status` $\rightarrow$ Approve, reject, or lock a voter account.
- `POST /api/admin/elections` $\rightarrow$ Create election.
- `PUT /api/admin/elections/{id}` $\rightarrow$ Update election.
- `DELETE /api/admin/elections/{id}` $\rightarrow$ Delete election.
- `POST /api/admin/elections/{id}/candidates` $\rightarrow$ Nominate candidate.
- `DELETE /api/admin/candidates/{candidateId}` $\rightarrow$ Remove candidate.
- `GET /api/admin/audit-logs` $\rightarrow$ Fetch system audit actions.
- `GET /api/admin/login-histories` $\rightarrow$ Fetch login threat telemetry.
- `GET /api/admin/export/audit-csv` $\rightarrow$ Download CSV report.
