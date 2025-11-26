package com.healthcare.appointmentsystem.repository;

import com.healthcare.appointmentsystem.entity.User;
import com.healthcare.appointmentsystem.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Find user by email for authentication
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Check if user exists by email
     */
    boolean existsByEmail(String email);
    
    /**
     * Find users by role
     */
    List<User> findByRole(UserRole role);
    
    /**
     * Find enabled users by role
     */
    List<User> findByRoleAndEnabledTrue(UserRole role);
    
    /**
     * Find users by first name and last name (case insensitive)
     */
    @Query("SELECT u FROM User u WHERE LOWER(u.firstName) LIKE LOWER(CONCAT('%', :firstName, '%')) " +
           "AND LOWER(u.lastName) LIKE LOWER(CONCAT('%', :lastName, '%'))")
    List<User> findByFirstNameAndLastNameContainingIgnoreCase(@Param("firstName") String firstName, 
                                                              @Param("lastName") String lastName);
    
    /**
     * Find users created after a specific date
     */
    List<User> findByCreatedAtAfter(LocalDateTime date);
    
    /**
     * Find users by phone number
     */
    Optional<User> findByPhoneNumber(String phoneNumber);
    
    /**
     * Check if phone number exists
     */
    boolean existsByPhoneNumber(String phoneNumber);
    
    /**
     * Find all patients (users with PATIENT role)
     */
    @Query("SELECT u FROM User u WHERE u.role = 'PATIENT' AND u.enabled = true")
    List<User> findAllPatients();
    
    /**
     * Count users by role
     */
    long countByRole(UserRole role);
    
    /**
     * Count enabled users
     */
    long countByEnabledTrue();
    
    /**
     * Find users by email domain
     */
    @Query("SELECT u FROM User u WHERE u.email LIKE CONCAT('%@', :domain)")
    List<User> findByEmailDomain(@Param("domain") String domain);
    
    /**
     * Find users with names containing search term
     */
    @Query("SELECT u FROM User u WHERE LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<User> findByFullNameContaining(@Param("searchTerm") String searchTerm);
    
    /**
     * Update user enabled status
     */
    @Query("UPDATE User u SET u.enabled = :enabled WHERE u.id = :userId")
    void updateEnabledStatus(@Param("userId") Long userId, @Param("enabled") Boolean enabled);
}