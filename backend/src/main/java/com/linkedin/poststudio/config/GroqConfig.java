package com.linkedin.poststudio.config;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * Groq LLM client wired through the official OpenAI Java SDK.
 *
 * <p>Groq exposes an OpenAI-API-compatible endpoint, so we reuse the OpenAI SDK
 * and just point the base URL at Groq. This gives us sub-second responses and
 * a much more generous free tier than Gemini.</p>
 *
 * <p>Why Groq over Gemini for this app:</p>
 * <ul>
 *   <li>Speed: typically 0.5-1.5s per request vs 25-120s with Gemini</li>
 *   <li>Rate limits: 30 req/min, 14,400 req/day, 14.4M tokens/min (vs 15/1,500/1M)</li>
 *   <li>Official Java SDK (the Gemini SDK required custom code)</li>
 * </ul>
 *
 * <p>Free tier signup: <a href="https://console.groq.com/keys">https://console.groq.com/keys</a></p>
 */
@Configuration
public class GroqConfig {

    @Value("${groq.api-key}")
    private String apiKey;

    @Value("${groq.base-url:https://api.groq.com/openai/v1}")
    private String baseUrl;

    @Value("${groq.timeout-seconds:30}")
    private long timeoutSeconds;

    /**
     * OpenAI-compatible client pointed at Groq. Reuses the connection pool
     * across requests (per the SDK recommendation).
     */
    @Bean
    public OpenAIClient groqClient() {
        return OpenAIOkHttpClient.builder()
                .apiKey(apiKey)
                .baseUrl(baseUrl)
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .build();
    }
}
