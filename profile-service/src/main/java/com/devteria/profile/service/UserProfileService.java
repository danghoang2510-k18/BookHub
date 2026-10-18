package com.devteria.profile.service;

import com.devteria.profile.dto.request.ProfileCreationRequest;
import com.devteria.profile.dto.response.UserProfileResponse;
import com.devteria.profile.entity.UserProfile;
import com.devteria.profile.mapper.UserProfileMapper;
import com.devteria.profile.repository.UserProfileRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
public class UserProfileService {
    UserProfileRepository userProfileRepository;
    UserProfileMapper userProfileMapper;

//    Create profile for user
    public UserProfileResponse createProfile(ProfileCreationRequest request)
    {
        UserProfile userProfile = userProfileMapper.toUserProfile(request);

        userProfileRepository.save(userProfile);

        return userProfileMapper.toUserProfileResponse(userProfile);
    }

    public UserProfileResponse getProfileById(String id)
    {
        UserProfile userProfile = userProfileRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Profile not exist")
        );

        return userProfileMapper.toUserProfileResponse(userProfile);
    }

//    Get all user profiles
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserProfileResponse> getAllProfile()
    {
        return userProfileRepository.findAll()
                .stream()
                .map(u -> userProfileMapper.toUserProfileResponse(u))
                .toList();
    }
}
