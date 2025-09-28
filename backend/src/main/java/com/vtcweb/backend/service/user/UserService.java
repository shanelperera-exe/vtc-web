package com.vtcweb.backend.service.user;

import com.vtcweb.backend.model.entity.user.User;
import com.vtcweb.backend.repository.user.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
//Dependency Injection
public class UserService
{
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository)
    {
        this.userRepository = userRepository;
    }

    // CREATE - Register new user
    public User createUser(User user)
    {
        if (userRepository.existsByEmail(user.getEmail()))
        {
            throw new RuntimeException("Email already exists: " + user.getEmail());
        }
        return userRepository.save(user);
    }

    // READ - Get all users
    public List<User> getAllUsers()
    {
        return userRepository.findAll();
    }

    // READ - Get user by ID
    public User getUserById(Long id)
    {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    // READ - Get user by email
    public User getUserByEmail(String email)
    {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    // UPDATE - Update user profile
    public User updateUser(Long id, User userDetails)
    {
        User user = getUserById(id);

        // Check if email is being changed and if it already exists
        if (!user.getEmail().equals(userDetails.getEmail()) &&
                userRepository.existsByEmail(userDetails.getEmail()))
        {
            throw new RuntimeException("Email already exists: " + userDetails.getEmail());
        }

        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        user.setEmail(userDetails.getEmail());
        user.setRole(userDetails.getRole());

        // Only update password if provided
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty())
        {
            user.setPassword(userDetails.getPassword());
        }

        return userRepository.save(user);
    }

    // DELETE - Delete user
    public void deleteUser(Long id)
    {
        User user = getUserById(id);
        userRepository.delete(user);
    }

    // Simple validation
    public boolean validateUser(String email, String password)
    {
        Optional<User> user = userRepository.findByEmail(email);
        return user.isPresent() && user.get().getPassword().equals(password);
    }
}