package com.smartvote.dto;

public class HourlyVoteDto {

    private int hour;
    private long count;

    public HourlyVoteDto() {
    }

    public HourlyVoteDto(int hour, long count) {
        this.hour = hour;
        this.count = count;
    }

    public int getHour() {
        return hour;
    }

    public void setHour(int hour) {
        this.hour = hour;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}
