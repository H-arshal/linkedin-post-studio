package com.linkedin.poststudio.service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Internal keep-alive for Render's free tier.
 *
 * <p>Render spins down a free-tier service after 15 minutes of inactivity.
 * To prevent the first user request from suffering a 30-60s cold start, we
 * self-ping the public URL every 14 minutes. Render sees this as real
 * traffic (it comes from the container's outbound network) and keeps the
 * instance warm.</p>
 *
 * <p>Configuration:</p>
 * <ul>
 *   <li>Disabled when the env var {@code RENDER_EXTERNAL_URL} is absent
 *       (e.g. local dev), so the scheduler doesn't try to ping a localhost URL</li>
 *   <li>Runs on the standard Spring cron expression (every 14 minutes)</li>
 *   <li>10-second timeout per ping -- failure is logged but never throws</li>
 * </ul>
 */
@Service
@Slf4j
public class KeepAliveService {

    @Value("${RENDER_EXTERNAL_URL:}")
    private String renderExternalUrl;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    private boolean enabled;

    @PostConstruct
    void init() {
        enabled = renderExternalUrl != null
                && !renderExternalUrl.isBlank()
                && renderExternalUrl.startsWith("http");

        if (enabled) {
            log.info("Keep-alive ENABLED. Will self-ping {} every 14 minutes.", renderExternalUrl);
        } else {
            log.info("Keep-alive DISABLED (RENDER_EXTERNAL_URL not set). "
                    + "This is normal for local development.");
        }
    }

    /**
     * Pings the public /api/health endpoint every 14 minutes.
     * Render injects the public URL into the RENDER_EXTERNAL_URL env var.
     */
    @Scheduled(cron = "0 */14 * * *")
    public void pingSelf() {
        if (!enabled) return;

        String url = renderExternalUrl + "/api/health";
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            int status = response.statusCode();
            if (status >= 200 && status < 300) {
                log.debug("Keep-alive ping OK: {} ({}ms)", status, response.statusCode());
            } else {
                log.warn("Keep-alive ping returned non-2xx status: {}", status);
            }
        } catch (Exception e) {
            // Never let a keep-alive failure crash the app
            log.warn("Keep-alive ping failed: {}", e.getMessage());
        }
    }
}
