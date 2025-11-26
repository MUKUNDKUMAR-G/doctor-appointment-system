package com.healthcare.appointmentsystem.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.lang.reflect.Field;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExportService {
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    public byte[] exportToCSV(List<?> data, List<String> columns) {
        if (data == null || data.isEmpty()) {
            return new byte[0];
        }
        
        StringBuilder csv = new StringBuilder();
        
        // Add header
        csv.append(String.join(",", columns)).append("\n");
        
        // Add data rows
        for (Object item : data) {
            StringBuilder row = new StringBuilder();
            for (int i = 0; i < columns.size(); i++) {
                if (i > 0) row.append(",");
                String value = getFieldValue(item, columns.get(i));
                row.append(escapeCSV(value));
            }
            csv.append(row).append("\n");
        }
        
        return csv.toString().getBytes();
    }
    
    public byte[] exportToExcel(List<?> data, List<String> columns, String sheetName) throws IOException {
        if (data == null || data.isEmpty()) {
            return new byte[0];
        }
        
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            Sheet sheet = workbook.createSheet(sheetName != null ? sheetName : "Data");
            
            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            
            // Create header row
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.size(); i++) {
                org.apache.poi.ss.usermodel.Cell poiCell = headerRow.createCell(i);
                poiCell.setCellValue(columns.get(i));
                poiCell.setCellStyle(headerStyle);
            }
            
            // Create data rows
            int rowNum = 1;
            for (Object item : data) {
                Row row = sheet.createRow(rowNum++);
                for (int i = 0; i < columns.size(); i++) {
                    org.apache.poi.ss.usermodel.Cell poiCell = row.createCell(i);
                    String value = getFieldValue(item, columns.get(i));
                    poiCell.setCellValue(value);
                }
            }
            
            // Auto-size columns
            for (int i = 0; i < columns.size(); i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }
    
    public byte[] exportToPDF(String title, List<?> data, List<String> columns) {
        if (data == null || data.isEmpty()) {
            return new byte[0];
        }
        
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);
            
            // Add title
            Paragraph titleParagraph = new Paragraph(title)
                .setFontSize(18)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER);
            document.add(titleParagraph);
            
            // Add date
            Paragraph dateParagraph = new Paragraph("Generated: " + LocalDateTime.now().format(DATETIME_FORMATTER))
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER);
            document.add(dateParagraph);
            
            // Add spacing
            document.add(new Paragraph("\n"));
            
            // Create table
            float[] columnWidths = new float[columns.size()];
            for (int i = 0; i < columns.size(); i++) {
                columnWidths[i] = 1;
            }
            Table table = new Table(UnitValue.createPercentArray(columnWidths));
            table.setWidth(UnitValue.createPercentValue(100));
            
            // Add header cells
            for (String column : columns) {
                com.itextpdf.layout.element.Cell headerCell = new com.itextpdf.layout.element.Cell()
                    .add(new Paragraph(column))
                    .setBold()
                    .setBackgroundColor(com.itextpdf.kernel.colors.ColorConstants.LIGHT_GRAY)
                    .setTextAlignment(TextAlignment.CENTER);
                table.addHeaderCell(headerCell);
            }
            
            // Add data rows
            for (Object item : data) {
                for (String column : columns) {
                    String value = getFieldValue(item, column);
                    com.itextpdf.layout.element.Cell pdfCell = new com.itextpdf.layout.element.Cell()
                        .add(new Paragraph(value));
                    table.addCell(pdfCell);
                }
            }
            
            document.add(table);
            document.close();
            
            return out.toByteArray();
        } catch (Exception e) {
            // Fallback to CSV if PDF generation fails
            return exportToCSV(data, columns);
        }
    }
    
    private String getFieldValue(Object obj, String fieldName) {
        try {
            // Try direct field access
            Field field = findField(obj.getClass(), fieldName);
            if (field != null) {
                field.setAccessible(true);
                Object value = field.get(obj);
                return formatValue(value);
            }
            
            // Try getter method
            String getterName = "get" + capitalize(fieldName);
            try {
                Object value = obj.getClass().getMethod(getterName).invoke(obj);
                return formatValue(value);
            } catch (Exception e) {
                // Ignore
            }
            
            return "";
        } catch (Exception e) {
            return "";
        }
    }
    
    private Field findField(Class<?> clazz, String fieldName) {
        while (clazz != null) {
            try {
                return clazz.getDeclaredField(fieldName);
            } catch (NoSuchFieldException e) {
                clazz = clazz.getSuperclass();
            }
        }
        return null;
    }
    
    private String formatValue(Object value) {
        if (value == null) {
            return "";
        }
        if (value instanceof LocalDateTime) {
            return ((LocalDateTime) value).format(DATETIME_FORMATTER);
        }
        if (value instanceof LocalDate) {
            return ((LocalDate) value).format(DATE_FORMATTER);
        }
        return value.toString();
    }
    
    private String escapeCSV(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
    
    private String capitalize(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }
}
