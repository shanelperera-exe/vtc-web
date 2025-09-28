package com.vtcweb.backend.controller;

import com.vtcweb.backend.model.entity.user.User;
import com.vtcweb.backend.service.user.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/users")
// Dependency Injection
public class UserController
{
    private final UserService userService;

    public UserController(UserService userService)
    {
        this.userService = userService;
    }

    //Registering new user
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody User user)
    {
        try
        {
            User createdUser = userService.createUser(user);
            return ResponseEntity.ok(createdUser);
        } catch (RuntimeException e)
        {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    //Getting the details of all the users
    @GetMapping
    public List<User> getAllUsers()
    {
        return userService.getAllUsers();
    }

    //Getting the relevant details of user by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id)
    {
        try
        {
            User user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e)
        {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    //Updating the user details
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody User userDetails)
    {
        try
        {
            User updatedUser = userService.updateUser(id, userDetails);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e)
        {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    //Deleting the user
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id)
    {
        try
        {
            userService.deleteUser(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "User deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e)
        {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    //Login
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginRequest)
    {
        try
        {
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");

            boolean isValid = userService.validateUser(email, password);

            if (isValid)
            {
                User user = userService.getUserByEmail(email);
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Login successful");
                response.put("user", user);
                return ResponseEntity.ok(response);
            } else
            {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Invalid email or password");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (RuntimeException e)
        {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    //Health checkpoint
    @GetMapping("/health")
    public Map<String, String> healthCheck()
    {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "User Management API is running");
        return response;
    }
}