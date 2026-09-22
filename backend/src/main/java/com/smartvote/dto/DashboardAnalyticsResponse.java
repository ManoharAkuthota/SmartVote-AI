package com.smartvote.dto;

import java.util.ArrayList;
import java.util.List;

public class DashboardAnalyticsResponse {

    private long totalRegisteredVoters;
    private long totalApprovedVoters;
    private long totalPendingVoters;
    private long totalLockedVoters;
    private long totalVotesCast;
    private long activeElectionsCount;
    private double turnoutPercentage;
    private long suspiciousLoginsCount;
    private List<HourlyVoteDto> hourlyVotes = new ArrayList<>();
    private List<CandidateDistributionDto> candidateVoteDistribution = new ArrayList<>();
    private List<AuditLogDto> recentActivities = new ArrayList<>();

    public DashboardAnalyticsResponse() {
    }

    public long getTotalRegisteredVoters() {
        return totalRegisteredVoters;
    }

    public void setTotalRegisteredVoters(long totalRegisteredVoters) {
        this.totalRegisteredVoters = totalRegisteredVoters;
    }

    public long getTotalApprovedVoters() {
        return totalApprovedVoters;
    }

    public void setTotalApprovedVoters(long totalApprovedVoters) {
        this.totalApprovedVoters = totalApprovedVoters;
    }

    public long getTotalPendingVoters() {
        return totalPendingVoters;
    }

    public void setTotalPendingVoters(long totalPendingVoters) {
        this.totalPendingVoters = totalPendingVoters;
    }

    public long getTotalLockedVoters() {
        return totalLockedVoters;
    }

    public void setTotalLockedVoters(long totalLockedVoters) {
        this.totalLockedVoters = totalLockedVoters;
    }

    public long getTotalVotesCast() {
        return totalVotesCast;
    }

    public void setTotalVotesCast(long totalVotesCast) {
        this.totalVotesCast = totalVotesCast;
    }

    public long getActiveElectionsCount() {
        return activeElectionsCount;
    }

    public void setActiveElectionsCount(long activeElectionsCount) {
        this.activeElectionsCount = activeElectionsCount;
    }

    public double getTurnoutPercentage() {
        return turnoutPercentage;
    }

    public void setTurnoutPercentage(double turnoutPercentage) {
        this.turnoutPercentage = turnoutPercentage;
    }

    public long getSuspiciousLoginsCount() {
        return suspiciousLoginsCount;
    }

    public void setSuspiciousLoginsCount(long suspiciousLoginsCount) {
        this.suspiciousLoginsCount = suspiciousLoginsCount;
    }

    public List<HourlyVoteDto> getHourlyVotes() {
        return hourlyVotes;
    }

    public void setHourlyVotes(List<HourlyVoteDto> hourlyVotes) {
        this.hourlyVotes = hourlyVotes;
    }

    public List<CandidateDistributionDto> getCandidateVoteDistribution() {
        return candidateVoteDistribution;
    }

    public void setCandidateVoteDistribution(List<CandidateDistributionDto> candidateVoteDistribution) {
        this.candidateVoteDistribution = candidateVoteDistribution;
    }

    public List<AuditLogDto> getRecentActivities() {
        return recentActivities;
    }

    public void setRecentActivities(List<AuditLogDto> recentActivities) {
        this.recentActivities = recentActivities;
    }
}
