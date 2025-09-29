package com.vtcweb.backend.service.user;

import com.vtcweb.backend.model.entity.user.User;
import com.vtcweb.backend.repository.user.UserRepository;
import com.vtcweb.backend.exception.NotFoundException;
import com.vtcweb.backend.exception.ConflictException;
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

    //Registering new user
    public User createUser(User user)
    {
        if (userRepository.existsByEmail(user.getEmail()))
        {
            throw new ConflictException("Email already exists: " + user.getEmail());
        }
        return userRepository.save(user);
    }

    //Getting all available users
    public List<User> getAllUsers()
    {
        return userRepository.findAll();
    }

    //Getting relevant user by ID
    public User getUserById(Long id)
    {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));
    }

    //Getting relevant user by email
    public User getUserByEmail(String email)
    {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found with email: " + email));
    }

    //Updating the relevant user profile
    public User updateUser(Long id, User userDetails)
    {
        User user = getUserById(id);

        //Checking whether the email is being changed and if the email already exists
        if (!user.getEmail().equals(userDetails.getEmail()) &&
                userRepository.existsByEmail(userDetails.getEmail()))
        {
            throw new ConflictException("Email already exists: " + userDetails.getEmail());
        }

        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        user.setEmail(userDetails.getEmail());
        user.setRole(userDetails.getRole());

        //Updating the details if the password is provided only
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty())
        {
            user.setPassword(userDetails.getPassword());
        }

        return userRepository.save(user);
    }

    //Deleting the user
    public void deleteUser(Long id)
    {
        User user = getUserById(id);
        userRepository.delete(user);
    }

    //Validating the email and password
    public boolean validateUser(String email, String password)
    {
        Optional<User> user = userRepository.findByEmail(email);
        return user.isPresent() && user.get().getPassword().equals(password);
    }
}