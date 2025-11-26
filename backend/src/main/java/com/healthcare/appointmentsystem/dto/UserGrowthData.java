package com.healthcare.appointmentsystem.dto;

import java.time.LocalDate;

public class UserGrowthData {
    private LocalDate date;
    private long count;
    
    public UserGrowthData() {}
    
    public UserGrowthData(LocalDate date, long count) {
        this.date = date;
        this.count = count;
    }
    
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public long getCount() {
        return count;
    }
    
    public void setCount(long count) {
        this.count = count;
    }
}
