package com.linkedin.poststudio.controller;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    /**
     * Full health check. Returns service status and a small JSON payload.
     * Suitable for monitoring dashboards and manual smoke tests.
     */
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
     * Lightweight keep-alive endpoint for external cron pingers
     * (e.g. cron-job.org, UptimeRobot, GitHub Actions schedule).
     *
     * <p>Designed to be cheap to call every 14 minutes so Render's free-tier
     * service never spins down due to inactivity.</p>
     *
     * <p>Returns a plain-text "pong" with {@code Cache-Control: no-store}
     * so pingers and intermediaries don't cache the response.</p>
     */
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore().mustRevalidate())
                .header("Pragma", "no-cache")
                .body("pong");
    }
}
