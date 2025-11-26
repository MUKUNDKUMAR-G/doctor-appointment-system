package com.healthcare.appointmentsystem.util;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashTest {
    
    @Test
    public void generatePasswordHashes() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        System.out.println("=== Password Hashes ===");
        System.out.println("Admin123! hash: " + encoder.encode("Admin123!"));
        System.out.println("Doctor123! hash: " + encoder.encode("Doctor123!"));
        System.out.println("password hash: " + encoder.encode("password"));
    }
}
