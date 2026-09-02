package com.linkedin.poststudio.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import com.google.genai.types.Schema;
import com.google.genai.types.Type;
import com.linkedin.poststudio.dto.FormatRequest;
import com.linkedin.poststudio.dto.FormatResponse;
import com.linkedin.poststudio.dto.FormatResponse.FormattingPlan;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class AiFormattingService {

    private final Client geminiClient;
    private final PromptService promptService;
    private final ValidationService validationService;
    private final ObjectMapper objectMapper;

    @Value("${gemini.model}")
    private String modelName;

    @Value("${gemini.temperature}")
    private double temperature;

    public FormatResponse formatText(FormatRequest request) {
        log.debug("Starting formatting request for style: [{}], custom instructions: [{}]", request.getStyle(), request.getCustomInstructions());
        try {
            // 1. Build the prompts
            String systemPrompt = promptService.getSystemPrompt(request.getStyle(), request.getCustomInstructions());
            String userPrompt = "<POST_CONTENT>\n" + request.getText() + "\n</POST_CONTENT>";
            log.debug("Generated System Prompt:\n{}", systemPrompt);
            log.debug("Generated User Prompt length: {} characters", userPrompt.length());

            // 2. Build the JSON schema for structured output
            Schema responseSchema = buildFormattingPlanSchema();

            // 3. Configure the generation with structured output
            GenerateContentConfig config = GenerateContentConfig.builder()
                    .systemInstruction(Content.fromParts(Part.fromText(systemPrompt)))
                    .responseMimeType("application/json")
                    .responseSchema(responseSchema)
                    .temperature((float) temperature)
                    .build();
            log.debug("Prepared Gemini Config. Model: {}, Temperature: {}, ResponseMimeType: {}", modelName, temperature, config.responseMimeType());

            // 4. Call Gemini
            log.debug("Calling Gemini API...");
            GenerateContentResponse response = geminiClient.models.generateContent(
                    modelName,
                    userPrompt,
                    config
            );

            String content = response.text();
            log.debug("Gemini raw response string:\n{}", content);

            // 5. Sanitize and parse the JSON response
            String sanitized = sanitizeJson(content);
            log.debug("Sanitized JSON string ready for parsing:\n{}", sanitized);
            FormattingPlan plan = objectMapper.readValue(sanitized, FormattingPlan.class);
            log.debug("Parsed FormattingPlan successfully with {} operations", plan.getOperations() != null ? plan.getOperations().size() : 0);

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
     * Build the JSON Schema that Gemini will enforce at the model level.
     * This guarantees the response matches our FormattingPlan structure.
     */
    private Schema buildFormattingPlanSchema() {
        // Build the operation schema properties
        Map<String, Schema> operationProps = new LinkedHashMap<>();
        operationProps.put("id", Schema.builder()
                .type(Type.Known.STRING)
                .description("Unique operation ID")
                .build());
        operationProps.put("type", Schema.builder()
                .type(Type.Known.STRING)
                .description("Operation type: 'style' or 'list'")
                .enum_(List.of("style", "list"))
                .build());
        operationProps.put("start", Schema.builder()
                .type(Type.Known.INTEGER)
                .description("Start character index (0-based) in the original text")
                .build());
        operationProps.put("end", Schema.builder()
                .type(Type.Known.INTEGER)
                .description("End character index (exclusive) in the original text")
                .build());
        operationProps.put("style", Schema.builder()
                .type(Type.Known.STRING)
                .description("Style to apply when type is 'style'")
                .enum_(List.of("bold", "italic", "boldItalic", "underline", "strikethrough", "sansSerif", "smallCaps", "doubleStruck"))
                .build());
        operationProps.put("marker", Schema.builder()
                .type(Type.Known.STRING)
                .description("List marker when type is 'list'")
                .enum_(List.of("dot", "arrow", "number"))
                .build());

        Schema operationSchema = Schema.builder()
                .type(Type.Known.OBJECT)
                .properties(operationProps)
                .required(List.of("id", "type", "start", "end"))
                .build();

        // Build the top-level plan schema
        Map<String, Schema> planProps = new LinkedHashMap<>();
        planProps.put("version", Schema.builder()
                .type(Type.Known.STRING)
                .description("Schema version, always '1.0'")
                .build());
        planProps.put("rewrittenText", Schema.builder()
                .type(Type.Known.STRING)
                .description("Optional. The fully rewritten text, if the user asked to add emojis, fix grammar, or rewrite the content. If provided, all operation coordinates must map to this new text, not the original text.")
                .nullable(true)
                .build());
        planProps.put("operations", Schema.builder()
                .type(Type.Known.ARRAY)
                .items(operationSchema)
                .description("List of formatting operations to apply")
                .build());

        return Schema.builder()
                .type(Type.Known.OBJECT)
                .properties(planProps)
                .required(List.of("version", "operations"))
                .build();
    }

    /**
     * Sanitize raw LLM output to extract pure JSON.
     * Handles markdown code fences, preamble text, and think blocks.
     */
    private String sanitizeJson(String raw) {
        if (raw == null || raw.isBlank()) {
            log.debug("sanitizeJson: Input is null or blank, returning empty plan.");
            return "{\"version\":\"1.0\",\"operations\":[]}";
        }

        String cleaned = raw.trim();
        log.debug("sanitizeJson: Initial trim length = {}", cleaned.length());

        // Remove <think>...</think> blocks
        cleaned = cleaned.replaceAll("(?s)<think>.*?</think>", "").trim();

        // Remove markdown code fences
        cleaned = cleaned.replaceAll("(?s)```json\\s*", "").replaceAll("(?s)```\\s*$", "").trim();

        // If there's preamble text before the JSON, extract from first {
        int firstBrace = cleaned.indexOf('{');
        int lastBrace = cleaned.lastIndexOf('}');
        if (firstBrace >= 0 && lastBrace > firstBrace) {
            if (firstBrace > 0 || lastBrace < cleaned.length() - 1) {
                log.debug("sanitizeJson: Extracting JSON between index {} and {}", firstBrace, lastBrace);
            }
            cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        } else {
            log.debug("sanitizeJson: No valid curly braces found in response!");
        }

        return cleaned;
    }
}
