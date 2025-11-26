package com.healthcare.appointmentsystem.dto;

import java.util.List;
import java.util.Map;

public class ExportRequest {
    private String format; // CSV, EXCEL, PDF
    private List<String> columns;
    private Map<String, Object> filters;
    
    public ExportRequest() {}
    
    public ExportRequest(String format, List<String> columns, Map<String, Object> filters) {
        this.format = format;
        this.columns = columns;
        this.filters = filters;
    }
    
    public String getFormat() {
        return format;
    }
    
    public void setFormat(String format) {
        this.format = format;
    }
    
    public List<String> getColumns() {
        return columns;
    }
    
    public void setColumns(List<String> columns) {
        this.columns = columns;
    }
    
    public Map<String, Object> getFilters() {
        return filters;
    }
    
    public void setFilters(Map<String, Object> filters) {
        this.filters = filters;
    }
}
