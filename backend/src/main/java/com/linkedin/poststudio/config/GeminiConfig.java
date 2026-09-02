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
     */
    @Bean
    public Client geminiClient() {
        return Client.builder()
                .apiKey(apiKey)
                .httpOptions(
                        com.google.genai.types.HttpOptions.builder()
                                .timeout(120_000) // 60s — Gemini can take 25-45s on first request
                                .build()
                )
                .build();
    }
}
