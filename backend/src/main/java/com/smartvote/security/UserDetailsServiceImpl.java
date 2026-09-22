package com.smartvote.security;

import com.smartvote.entity.User;
import com.smartvote.entity.enums.UserStatus;
import com.smartvote.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        boolean accountNonLocked = true;
        if (user.getStatus() == UserStatus.LOCKED) {
            if (user.getAccountLockedUntil() != null && LocalDateTime.now().isAfter(user.getAccountLockedUntil())) {
                // Auto-unlock expired lockout
                user.setStatus(UserStatus.APPROVED);
                user.setFailedLoginAttempts(0);
                user.setAccountLockedUntil(null);
                userRepository.save(user);
            } else {
                accountNonLocked = false;
            }
        }

        boolean enabled = user.getStatus() != UserStatus.REJECTED;

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                enabled,
                true,
                true,
                accountNonLocked,
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name()))
        );
    }
}
