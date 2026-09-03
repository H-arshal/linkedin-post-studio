package com.linkedin.poststudio.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linkedin.poststudio.dto.FormatRequest;
import com.linkedin.poststudio.dto.FormatResponse;
import com.linkedin.poststudio.dto.FormatResponse.FormattingPlan;
import com.openai.client.OpenAIClient;
import com.openai.models.ChatModel;
import com.openai.models.chat.completions.ChatCompletion;
import com.openai.models.chat.completions.ChatCompletionCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * AI formatting service backed by Groq (via the OpenAI-compatible API).
 *
 * <p>Performance characteristics (Groq free tier, llama-3.1-8b-instant):</p>
 * <ul>
 *   <li>Cold start: ~1-2s</li>
 *   <li>Warm cache: 0.5-1.5s typical</li>
 *   <li>JSON mode: native, no schema enforcement — we validate after parsing</li>
 * </ul>
 *
 * <p>We use OpenAI's {@code response_format: json_object} mode (Groq supports
 * it natively) and then validate the parsed plan via {@link ValidationService}.</p>
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AiFormattingService {

    private final OpenAIClient groqClient;
    private final PromptService promptService;
    private final ValidationService validationService;
    private final ObjectMapper objectMapper;

    @Value("${groq.model:llama-3.1-8b-instant}")
    private String modelName;

    @Value("${groq.temperature:0.2}")
    private double temperature;

    public FormatResponse formatText(FormatRequest request) {
        log.debug("Starting formatting request for style: [{}], custom instructions: [{}]",
                request.getStyle(), request.getCustomInstructions());
        try {
            // 1. Build the prompts
            String systemPrompt = promptService.getSystemPrompt(request.getStyle(), request.getCustomInstructions());
            String userPrompt = "<POST_CONTENT>\n" + request.getText() + "\n</POST_CONTENT>";
            log.debug("System prompt length: {} chars, User prompt length: {} chars",
                    systemPrompt.length(), userPrompt.length());

            // 2. Build the chat completion request with JSON mode enabled
            ChatCompletionCreateParams params = ChatCompletionCreateParams.builder()
                    .model(modelName)
                    .temperature(temperature)
                    .maxCompletionTokens(2048)
                    .addSystemMessage(systemPrompt)
                    .addUserMessage(userPrompt)
                    // Enable JSON mode — Groq guarantees a valid JSON object response
                    .responseFormat(com.openai.models.ResponseFormatJsonObject.builder().build())
                    .build();

            // 3. Call Groq
            log.debug("Calling Groq API (model={})...", modelName);
            long start = System.currentTimeMillis();
            ChatCompletion completion = groqClient.chat().completions().create(params);
            long elapsed = System.currentTimeMillis() - start;
            log.debug("Groq response in {}ms", elapsed);

            // 4. Extract the JSON string from the response
            String content = completion.choices().get(0).message().content().orElse("");
            log.debug("Groq raw response ({} chars): {}", content.length(), content);

            // 5. Parse the JSON
            FormattingPlan plan;
            try {
                plan = objectMapper.readValue(content, FormattingPlan.class);
            } catch (Exception parseErr) {
                log.warn("Failed to parse Groq response as FormattingPlan: {}", parseErr.getMessage());
                // Sometimes the model wraps in markdown fences even with json_object mode
                String sanitized = sanitizeJson(content);
                plan = objectMapper.readValue(sanitized, FormattingPlan.class);
            }
            log.debug("Parsed FormattingPlan with {} operations",
                    plan != null && plan.getOperations() != null ? plan.getOperations().size() : 0);

            // 6. Validate the returned operations
            if (plan != null && plan.getOperations() != null) {
                validationService.validateOperations(request.getText(), plan.getOperations());
            } else {
                plan = new FormattingPlan("1.0", null, Collections.emptyList());
            }

            return FormatResponse.builder()
                    .success(true)
                    .plan(plan)
                    .build();

        } catch (Exception e) {
            log.error("AI formatting failed", e);
            return FormatResponse.builder()
                    .success(false)
                    .errorMessage("Failed to format text: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Sanitize raw LLM output to extract pure JSON. Handles markdown code fences
     * and preamble text in case the model wraps its output despite JSON mode.
     */
    private String sanitizeJson(String raw) {
        if (raw == null || raw.isBlank()) {
            return "{\"version\":\"1.0\",\"operations\":[]}";
        }

        String cleaned = raw.trim();

        // Remove markdown code fences
        cleaned = cleaned.replaceAll("(?s)```json\\s*", "")
                .replaceAll("(?s)```\\s*$", "")
                .trim();

        // Extract from first { to last }
        int firstBrace = cleaned.indexOf('{');
        int lastBrace = cleaned.lastIndexOf('}');
        if (firstBrace >= 0 && lastBrace > firstBrace) {
            cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        }
        return cleaned;
    }
}
