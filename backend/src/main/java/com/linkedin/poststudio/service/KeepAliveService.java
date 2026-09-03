package com.linkedin.poststudio.service;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

/**
 * Self-pings the public /api/health endpoint every 14 minutes when deployed to
 * Render (or any platform that injects the public URL into RENDER_EXTERNAL_URL).
 * This keeps the free-tier instance warm so users never see the 30-60s cold start
 * on first request after 15 min of inactivity.
 *
 * Behaviour:
 *  - Production (RENDER_EXTERNAL_URL set): ping every 14 minutes, log success/failure.
 *  - Local dev (no env var): disable silently, log once, never ping.
 *  - All exceptions are caught and logged; a failed ping can never crash the app.
 */
@Service
public class KeepAliveService {

    private static final Logger log = LoggerFactory.getLogger(KeepAliveService.class);
    private static final long FOURTEEN_MINUTES_MS = 14L * 60L * 1000L;

    @Value("${RENDER_EXTERNAL_URL:}")
    private String renderExternalUrl;

    private final RestClient http = RestClient.create();

    @PostConstruct
    void init() {
        if (renderExternalUrl == null || renderExternalUrl.isBlank()) {
            log.info("Keep-alive DISABLED. Set RENDER_EXTERNAL_URL to enable self-ping in production.");
        } else {
            String target = renderExternalUrl + "/api/health";
            log.info("Keep-alive ENABLED. Will self-ping {} every 14 minutes.", target);
        }
    }

    /**
     * Pings /api/health every 14 minutes. Cron: at minute 0 of every 14th hour,
     * plus a fixed delay of 14 minutes between runs.
     */
    @Scheduled(initialDelayString = "0", fixedDelayString = "PT14M")
    public void pingSelf() {
        if (renderExternalUrl == null || renderExternalUrl.isBlank()) {
            return; // local dev - no-op
        }
        String url = renderExternalUrl + "/api/health";
        try {
            int status = http.get().uri(url).retrieve().toBodilessEntity().getStatusCode().value();
            log.info("Keep-alive ping OK: {} -> {}", url, status);
        } catch (Exception e) {
            log.warn("Keep-alive ping FAILED for {} : {}", url, e.getMessage());
        }
    }
}
