package com.smartvote.dto;

import com.smartvote.entity.Candidate;

public class CandidateDto {

    private Long id;
    private Long electionId;
    private String fullName;
    private String partyName;
    private String partySymbol;
    private String photoUrl;
    private String manifesto;
    private Integer voteCount;

    public CandidateDto() {
    }

    public static CandidateDto fromEntity(Candidate c, boolean includeVoteCount) {
        if (c == null) return null;
        CandidateDto dto = new CandidateDto();
        dto.setId(c.getId());
        if (c.getElection() != null) {
            dto.setElectionId(c.getElection().getId());
        }
        dto.setFullName(c.getFullName());
        dto.setPartyName(c.getPartyName());
        dto.setPartySymbol(c.getPartySymbol());
        dto.setPhotoUrl(c.getPhotoUrl());
        dto.setManifesto(c.getManifesto());
        if (includeVoteCount) {
            dto.setVoteCount(c.getVoteCount());
        }
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getElectionId() {
        return electionId;
    }

    public void setElectionId(Long electionId) {
        this.electionId = electionId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
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

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getManifesto() {
        return manifesto;
    }

    public void setManifesto(String manifesto) {
        this.manifesto = manifesto;
    }

    public Integer getVoteCount() {
        return voteCount;
    }

    public void setVoteCount(Integer voteCount) {
        this.voteCount = voteCount;
    }
}
