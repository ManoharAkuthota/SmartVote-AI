package com.smartvote.dto;

public class CandidateDistributionDto {

    private Long candidateId;
    private String candidateName;
    private String partyName;
    private String partySymbol;
    private Long electionId;
    private String electionTitle;
    private int voteCount;
    private double percentage;

    public CandidateDistributionDto() {
    }

    public CandidateDistributionDto(Long candidateId, String candidateName, String partyName, String partySymbol,
                                   Long electionId, String electionTitle, int voteCount, double percentage) {
        this.candidateId = candidateId;
        this.candidateName = candidateName;
        this.partyName = partyName;
        this.partySymbol = partySymbol;
        this.electionId = electionId;
        this.electionTitle = electionTitle;
        this.voteCount = voteCount;
        this.percentage = percentage;
    }

    public Long getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(Long candidateId) {
        this.candidateId = candidateId;
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

    public Long getElectionId() {
        return electionId;
    }

    public void setElectionId(Long electionId) {
        this.electionId = electionId;
    }

    public String getElectionTitle() {
        return electionTitle;
    }

    public void setElectionTitle(String electionTitle) {
        this.electionTitle = electionTitle;
    }

    public int getVoteCount() {
        return voteCount;
    }

    public void setVoteCount(int voteCount) {
        this.voteCount = voteCount;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }
}
