package com.smartvote.service;

import com.smartvote.entity.Notification;
import com.smartvote.entity.User;
import com.smartvote.entity.enums.NotificationType;
import com.smartvote.exception.ResourceNotFoundException;
import com.smartvote.repository.NotificationRepository;
import com.smartvote.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Notification createNotification(User user, String title, String message, NotificationType type) {
        Notification notification = new Notification(user, title, message, type);
        Notification saved = notificationRepository.save(notification);

        // Broadcast or send via websocket if configured
        if (messagingTemplate != null) {
            try {
                if (user != null) {
                    messagingTemplate.convertAndSend("/topic/notifications/" + user.getId(), saved);
                } else {
                    messagingTemplate.convertAndSend("/topic/notifications/broadcast", saved);
                }
            } catch (Exception e) {
                log.warn("WebSocket push failed: {}", e.getMessage());
            }
        }
        return saved;
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findForUser(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countUnreadForUser(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        notification.setRead(true);
        notificationRepository.save(notification);
    }
}
