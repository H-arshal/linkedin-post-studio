package com.linkedin.poststudio.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linkedin.poststudio.dto.FormatResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * Simple per-IP sliding-window rate limiter for the AI formatting endpoint.
 *
 * <p>Defaults: 10 requests per 60 seconds per client IP. Returns HTTP 429
 * (Too Many Requests) when exceeded.</p>
 *
 * <p>Backed by an in-memory {@link ConcurrentHashMap}. For multi-instance
 * deployments (paid Render), swap in a Redis-backed implementation.</p>
 */
@Component
@Slf4j
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final int MAX_REQUESTS = 10;
    private static final long WINDOW_MS = 60_000L;

    private final Map<String, Deque<Long>> hits = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Only rate-limit the expensive AI endpoint; skip everything else (health, ping, CORS preflight)
        String path = request.getRequestURI();
        if (!path.contains("/api/format/ai")) {
            return true;
        }
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String ip = clientIp(request);
        long now = System.currentTimeMillis();

        Deque<Long> window = hits.computeIfAbsent(ip, k -> new ConcurrentLinkedDeque<>());
        synchronized (window) {
            // Drop timestamps outside the window
            while (!window.isEmpty() && now - window.peekFirst() > WINDOW_MS) {
                window.pollFirst();
            }
            if (window.size() >= MAX_REQUESTS) {
                log.warn("Rate limit exceeded for IP {} ({} requests in last {}s)",
                        ip, window.size(), WINDOW_MS / 1000);
                writeRateLimitResponse(response, window.peekFirst());
                return false;
            }
            window.addLast(now);
        }
        return true;
    }

    private void writeRateLimitResponse(HttpServletResponse response, Long oldestHit) throws Exception {
        long retryAfterSec = oldestHit == null
                ? WINDOW_MS / 1000
                : Math.max(1, (WINDOW_MS - (System.currentTimeMillis() - oldestHit)) / 1000);

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader("Retry-After", String.valueOf(retryAfterSec));

        FormatResponse body = FormatResponse.builder()
                .success(false)
                .errorMessage("Too many requests. Please try again in " + retryAfterSec + "s.")
                .build();
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }

    /**
     * Best-effort client IP detection. Honors X-Forwarded-For when behind a proxy
     * (Render sets this). Falls back to remoteAddr.
     */
    private String clientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            // First IP in the comma-separated list is the original client
            return xff.split(",")[0].trim();
        }
        String real = request.getHeader("X-Real-IP");
        if (real != null && !real.isBlank()) {
            return real.trim();
        }
        return request.getRemoteAddr();
    }
}
