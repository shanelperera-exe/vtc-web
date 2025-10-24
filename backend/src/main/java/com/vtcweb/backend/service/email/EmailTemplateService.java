package com.vtcweb.backend.service.email;

import org.apache.commons.text.StringSubstitutor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class EmailTemplateService {
    public String renderFromClasspath(String templatePath, Map<String, Object> variables) {
        try {
            if (templatePath == null) {
                throw new IllegalArgumentException("templatePath must not be null");
            }
            ClassPathResource resource = new ClassPathResource(templatePath);
            byte[] bytes = resource.getInputStream().readAllBytes();
            String template = new String(bytes, StandardCharsets.UTF_8);
            StringSubstitutor sub = new StringSubstitutor(variables, "${", "}");
            return sub.replace(template);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load template: " + templatePath, e);
        }
    }
}
