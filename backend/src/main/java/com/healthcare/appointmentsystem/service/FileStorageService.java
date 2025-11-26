package com.healthcare.appointmentsystem.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {
    
    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "gif");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final int MAX_IMAGE_WIDTH = 500;
    private static final int MAX_IMAGE_HEIGHT = 500;
    
    @Value("${file.upload.dir:uploads/avatars}")
    private String uploadDir;
    
    @Value("${file.upload.base-url:http://localhost:8080/uploads/avatars}")
    private String baseUrl;
    
    /**
     * Store avatar image with validation and resizing
     */
    public String storeAvatar(MultipartFile file) throws IOException {
        // Validate file
        validateFile(file);
        
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String filename = UUID.randomUUID().toString() + "." + extension;
        
        // Resize image
        byte[] resizedImage = resizeImage(file.getBytes(), extension);
        
        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.write(filePath, resizedImage);
        
        logger.info("Avatar stored successfully: {}", filename);
        
        // Return URL
        return baseUrl + "/" + filename;
    }
    
    /**
     * Delete avatar file
     */
    public void deleteAvatar(String avatarUrl) {
        try {
            if (avatarUrl != null && avatarUrl.startsWith(baseUrl)) {
                String filename = avatarUrl.substring(avatarUrl.lastIndexOf('/') + 1);
                Path filePath = Paths.get(uploadDir).resolve(filename);
                Files.deleteIfExists(filePath);
                logger.info("Avatar deleted successfully: {}", filename);
            }
        } catch (IOException e) {
            logger.error("Error deleting avatar: {}", e.getMessage());
        }
    }
    
    /**
     * Validate uploaded file
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 5MB");
        }
        
        String filename = file.getOriginalFilename();
        if (filename == null || filename.isEmpty()) {
            throw new IllegalArgumentException("Invalid filename");
        }
        
        String extension = getFileExtension(filename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException("Invalid file type. Allowed types: " + String.join(", ", ALLOWED_EXTENSIONS));
        }
        
        // Validate that it's actually an image
        try {
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(file.getBytes()));
            if (image == null) {
                throw new IllegalArgumentException("File is not a valid image");
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Error reading image file");
        }
    }
    
    /**
     * Resize image to fit within max dimensions
     */
    private byte[] resizeImage(byte[] imageBytes, String extension) throws IOException {
        BufferedImage originalImage = ImageIO.read(new ByteArrayInputStream(imageBytes));
        
        if (originalImage == null) {
            throw new IOException("Failed to read image");
        }
        
        int originalWidth = originalImage.getWidth();
        int originalHeight = originalImage.getHeight();
        
        // Calculate new dimensions maintaining aspect ratio
        int newWidth = originalWidth;
        int newHeight = originalHeight;
        
        if (originalWidth > MAX_IMAGE_WIDTH || originalHeight > MAX_IMAGE_HEIGHT) {
            double widthRatio = (double) MAX_IMAGE_WIDTH / originalWidth;
            double heightRatio = (double) MAX_IMAGE_HEIGHT / originalHeight;
            double ratio = Math.min(widthRatio, heightRatio);
            
            newWidth = (int) (originalWidth * ratio);
            newHeight = (int) (originalHeight * ratio);
        }
        
        // Resize image
        BufferedImage resizedImage = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = resizedImage.createGraphics();
        graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        graphics.drawImage(originalImage, 0, 0, newWidth, newHeight, null);
        graphics.dispose();
        
        // Convert to bytes
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ImageIO.write(resizedImage, extension, outputStream);
        
        return outputStream.toByteArray();
    }
    
    /**
     * Get file extension from filename
     */
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }
}
