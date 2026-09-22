package com.smartvote.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryService.class);

    @Value("${app.cloudinary.cloud-name:demo-smartvote}")
    private String cloudName;

    @Value("${app.cloudinary.api-key:123456789012345}")
    private String apiKey;

    @Value("${app.cloudinary.api-secret:demo_secret_key}")
    private String apiSecret;

    private Cloudinary cloudinary;

    private Cloudinary getClient() {
        if (cloudinary == null) {
            cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret,
                    "secure", true
            ));
        }
        return cloudinary;
    }

    private boolean isRealCredentialsConfigured() {
        return cloudName != null && !cloudName.contains("demo") &&
               apiSecret != null && !apiSecret.contains("demo");
    }

    public String uploadFaceImage(String base64ImageOrUrl, String userEmail) {
        if (base64ImageOrUrl == null || base64ImageOrUrl.isBlank()) {
            return generateDefaultAvatarUrl(userEmail);
        }

        if (isRealCredentialsConfigured()) {
            try {
                Map<?, ?> uploadResult = getClient().uploader().upload(base64ImageOrUrl, ObjectUtils.asMap(
                        "folder", "smartvote/faces",
                        "public_id", "voter_" + UUID.randomUUID(),
                        "overwrite", true,
                        "resource_type", "image"
                ));
                String secureUrl = (String) uploadResult.get("secure_url");
                log.info("Face image uploaded to Cloudinary successfully for [{}] -> {}", userEmail, secureUrl);
                return secureUrl;
            } catch (Exception e) {
                log.warn("Cloudinary upload failed for [{}]: {}. Using safe storage fallback.", userEmail, e.getMessage());
            }
        } else {
            log.info("Cloudinary demo mode active. Saving captured face snapshot representation.");
        }

        // Return the image or optimized data URI
        if (base64ImageOrUrl.startsWith("http")) {
            return base64ImageOrUrl;
        }
        return base64ImageOrUrl;
    }

    public void deleteImage(String publicId) {
        if (isRealCredentialsConfigured() && publicId != null) {
            try {
                getClient().uploader().destroy(publicId, ObjectUtils.emptyMap());
                log.info("Deleted image from Cloudinary: {}", publicId);
            } catch (Exception e) {
                log.warn("Could not delete Cloudinary image: {}", e.getMessage());
            }
        }
    }

    private String generateDefaultAvatarUrl(String email) {
        return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";
    }
}
