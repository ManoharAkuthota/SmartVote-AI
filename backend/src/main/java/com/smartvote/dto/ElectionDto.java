package com.smartvote.dto;

import com.smartvote.entity.Election;
import com.smartvote.entity.enums.ElectionStatus;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class ElectionDto {

    private Long id;
    private String title;
    private String description;
    private String category;
    private String bannerUrl;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private ElectionStatus status;
    private Integer totalVotes;
    private boolean hasVoted;
    private List<CandidateDto> candidates = new ArrayList<>();
    private LocalDateTime createdAt;

    public ElectionDto() {
    }

    public static ElectionDto fromEntity(Election e, boolean includeVoteCounts, boolean hasVoted) {
        if (e == null) return null;
        ElectionDto dto = new ElectionDto();
        dto.setId(e.getId());
        dto.setTitle(e.getTitle());
        dto.setDescription(e.getDescription());
        dto.setCategory(e.getCategory());
        dto.setBannerUrl(e.getBannerUrl());
        dto.setStartDate(e.getStartDate());
        dto.setEndDate(e.getEndDate());
        dto.setStatus(e.getStatus());
        dto.setTotalVotes(e.getTotalVotes());
        dto.setHasVoted(hasVoted);
        dto.setCreatedAt(e.getCreatedAt());

        if (e.getCandidates() != null) {
            dto.setCandidates(e.getCandidates().stream()
                .map(c -> CandidateDto.fromEntity(c, includeVoteCounts))
                .collect(Collectors.toList()));
        }
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getBannerUrl() {
        return bannerUrl;
    }

    public void setBannerUrl(String bannerUrl) {
        this.bannerUrl = bannerUrl;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public ElectionStatus getStatus() {
        return status;
    }

    public void setStatus(ElectionStatus status) {
        this.status = status;
    }

    public Integer getTotalVotes() {
        return totalVotes;
    }

    public void setTotalVotes(Integer totalVotes) {
        this.totalVotes = totalVotes;
    }

    public boolean isHasVoted() {
        return hasVoted;
    }

    public void setHasVoted(boolean hasVoted) {
        this.hasVoted = hasVoted;
    }

    public List<CandidateDto> getCandidates() {
        return candidates;
    }

    public void setCandidates(List<CandidateDto> candidates) {
        this.candidates = candidates;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
