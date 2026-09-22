package com.smartvote.dto;

import java.time.LocalDateTime;

public class ReceiptVerifyResponse {

    private boolean valid;
    private String receiptId;
    private String electionTitle;
    private String candidateName;
    private String partyName;
    private String partySymbol;
    private LocalDateTime votedAt;
    private String receiptHash;
    private String digitalSignature;
    private String statusMessage;

    public ReceiptVerifyResponse() {
    }

    public static ReceiptVerifyResponse valid(String receiptId, String electionTitle, String candidateName,
                                              String partyName, String partySymbol, LocalDateTime votedAt,
                                              String receiptHash, String digitalSignature) {
        ReceiptVerifyResponse r = new ReceiptVerifyResponse();
        r.setValid(true);
        r.setReceiptId(receiptId);
        r.setElectionTitle(electionTitle);
        r.setCandidateName(candidateName);
        r.setPartyName(partyName);
        r.setPartySymbol(partySymbol);
        r.setVotedAt(votedAt);
        r.setReceiptHash(receiptHash);
        r.setDigitalSignature(digitalSignature);
        r.setStatusMessage("Receipt verified successfully on the cryptographic ledger.");
        return r;
    }

    public static ReceiptVerifyResponse invalid(String message) {
        ReceiptVerifyResponse r = new ReceiptVerifyResponse();
        r.setValid(false);
        r.setStatusMessage(message);
        return r;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getReceiptId() {
        return receiptId;
    }

    public void setReceiptId(String receiptId) {
        this.receiptId = receiptId;
    }

    public String getElectionTitle() {
        return electionTitle;
    }

    public void setElectionTitle(String electionTitle) {
        this.electionTitle = electionTitle;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }

    public String getPartyName() {
        return partyName;
    }

    public void setPartyName(String partyName) {
        this.partyName = partyName;
    }

    public String getPartySymbol() {
        return partySymbol;
    }

    public void setPartySymbol(String partySymbol) {
        this.partySymbol = partySymbol;
    }

    public LocalDateTime getVotedAt() {
        return votedAt;
    }

    public void setVotedAt(LocalDateTime votedAt) {
        this.votedAt = votedAt;
    }

    public String getReceiptHash() {
        return receiptHash;
    }

    public void setReceiptHash(String receiptHash) {
        this.receiptHash = receiptHash;
    }

    public String getDigitalSignature() {
        return digitalSignature;
    }

    public void setDigitalSignature(String digitalSignature) {
        this.digitalSignature = digitalSignature;
    }

    public String getStatusMessage() {
        return statusMessage;
    }

    public void setStatusMessage(String statusMessage) {
        this.statusMessage = statusMessage;
    }
}
