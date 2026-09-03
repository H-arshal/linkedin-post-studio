package com.linkedin.poststudio.config;

import com.google.genai.Client;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GeminiConfig {

    @Value("${gemini.api-key}")
    private String apiKey;

    /**
     * Gemini client with explicit timeouts so a slow LLM response cannot
     * hold a request thread indefinitely.
     *
     * <p>Production timings observed:</p>
     * <ul>
     *   <li>Warm cache: 2-8 seconds</li>
     *   <li>Cold cache (first request after deploy): 25-45 seconds</li>
     *   <li>Cold cache + complex prompt (rewrite + emojis): 60-120 seconds</li>
     * </ul>
     *
     * <p>180s gives ample headroom for the worst case while still killing
     * truly hung requests within a reasonable window.</p>
     */
    @Bean
    public Client geminiClient() {
        return Client.builder()
                .apiKey(apiKey)
                .httpOptions(
                        com.google.genai.types.HttpOptions.builder()
                                .timeout(180_000) // 180s
                                .build()
                )
                .build();
    }
}
