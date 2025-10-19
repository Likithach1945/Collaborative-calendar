package com.example.calendar.ics;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO representing the result of an ICS import operation
 */
public class ICSImportResultDTO {
    
    private int importedCount;
    private int duplicateCount;
    private int errorCount;
    private List<String> errors;
    
    public ICSImportResultDTO() {
        this.importedCount = 0;
        this.duplicateCount = 0;
        this.errorCount = 0;
        this.errors = new ArrayList<>();
    }
    
    public void incrementImported() {
        this.importedCount++;
    }
    
    public void incrementDuplicate() {
        this.duplicateCount++;
    }
    
    public void addError(String error) {
        this.errorCount++;
        this.errors.add(error);
    }
    
    public int getImportedCount() {
        return importedCount;
    }
    
    public void setImportedCount(int importedCount) {
        this.importedCount = importedCount;
    }
    
    public int getDuplicateCount() {
        return duplicateCount;
    }
    
    public void setDuplicateCount(int duplicateCount) {
        this.duplicateCount = duplicateCount;
    }
    
    public int getErrorCount() {
        return errorCount;
    }
    
    public void setErrorCount(int errorCount) {
        this.errorCount = errorCount;
    }
    
    public List<String> getErrors() {
        return errors;
    }
    
    public void setErrors(List<String> errors) {
        this.errors = errors;
    }
    
    public int getTotalProcessed() {
        return importedCount + duplicateCount + errorCount;
    }
}
