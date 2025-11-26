package com.healthcare.appointmentsystem.service;

import com.healthcare.appointmentsystem.config.SecurityProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class PasswordValidationService {

    @Autowired
    private SecurityProperties securityProperties;

    private static final Pattern UPPERCASE_PATTERN = Pattern.compile(".*[A-Z].*");
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile(".*[a-z].*");
    private static final Pattern DIGIT_PATTERN = Pattern.compile(".*\\d.*");
    private static final Pattern SPECIAL_CHAR_PATTERN = Pattern.compile(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*");

    public boolean isValidPassword(String password) {
        return validatePassword(password).isEmpty();
    }

    public List<String> validatePassword(String password) {
        List<String> errors = new ArrayList<>();
        SecurityProperties.PasswordPolicy policy = securityProperties.getPasswordPolicy();

        if (password == null || password.length() < policy.getMinLength()) {
            errors.add("Password must be at least " + policy.getMinLength() + " characters long");
        }

        if (policy.isRequireUppercase() && !UPPERCASE_PATTERN.matcher(password).matches()) {
            errors.add("Password must contain at least one uppercase letter");
        }

        if (policy.isRequireLowercase() && !LOWERCASE_PATTERN.matcher(password).matches()) {
            errors.add("Password must contain at least one lowercase letter");
        }

        if (policy.isRequireDigits() && !DIGIT_PATTERN.matcher(password).matches()) {
            errors.add("Password must contain at least one digit");
        }

        if (policy.isRequireSpecialChars() && !SPECIAL_CHAR_PATTERN.matcher(password).matches()) {
            errors.add("Password must contain at least one special character");
        }

        return errors;
    }

    public String getPasswordRequirements() {
        SecurityProperties.PasswordPolicy policy = securityProperties.getPasswordPolicy();
        StringBuilder requirements = new StringBuilder();
        
        requirements.append("Password must be at least ").append(policy.getMinLength()).append(" characters long");
        
        if (policy.isRequireUppercase()) {
            requirements.append(" and contain at least one uppercase letter");
        }
        
        if (policy.isRequireLowercase()) {
            requirements.append(" and contain at least one lowercase letter");
        }
        
        if (policy.isRequireDigits()) {
            requirements.append(" and contain at least one digit");
        }
        
        if (policy.isRequireSpecialChars()) {
            requirements.append(" and contain at least one special character");
        }
        
        return requirements.toString();
    }
}