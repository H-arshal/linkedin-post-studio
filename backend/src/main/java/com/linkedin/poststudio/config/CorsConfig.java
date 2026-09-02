package com.linkedin.poststudio.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        // Explicit allowlist (no wildcards) — Render serves over HTTPS only
                        .allowedOrigins(
                                "http://localhost:5173",
                                "http://localhost:5174",
                                "https://h-arshal.github.io"
                        )
                        // Only the methods we actually use
                        .allowedMethods("GET", "POST", "OPTIONS")
                        // Only the headers we actually read
                        .allowedHeaders("Content-Type", "Accept", "Origin", "X-Requested-With")
                        // Don't send cookies / credentials — keeps the API stateless
                        .allowCredentials(false)
                        // Cache CORS preflight for 1 hour
                        .maxAge(3600);
            }
        };
    }
}
