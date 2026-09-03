package com.linkedin.poststudio.controller;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Health endpoint. Doubles as the keep-alive target hit by
 * {@link KeepAliveService} every 14 minutes.
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(Map.of(
                        "status", "UP",
                        "service", "LinkedIn Post Studio Backend"
                ));
    }

    /**
     * Returns an empty 204 for /favicon.ico so browsers and Render's health
     * probes don't trigger a NoResourceFoundException 404 in the logs.
     * The actual favicon is served by the frontend (GitHub Pages).
     */
    @GetMapping("/favicon.ico")
    public ResponseEntity<Void> favicon() {
        return ResponseEntity.noContent().build();
    }
}
