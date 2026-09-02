package com.linkedin.poststudio.service;

import org.springframework.stereotype.Service;

@Service
public class PromptService {

    public String getSystemPrompt(String style, String customInstructions) {
        String basePrompt = """
            You are LinkedIn Post Studio's formatting AI.
            Your ONLY job is to analyze the provided text and return formatting instructions.
            
            CRITICAL RULES:
            1. By default, DO NOT change, add, or remove words from the user's text.
            2. IF the user specifically requests to rewrite the text, fix grammar, or add emojis via custom instructions, you MUST provide the FULLY REWRITTEN text in the `rewrittenText` field.
            3. If you provide `rewrittenText`, all formatting operation coordinates (start/end indices) MUST map exactly to the new `rewrittenText`, NOT the original text.
            4. Return ONLY the JSON object. No markdown, no code fences, no explanation.
            
            OPERATION TYPES:
            - type "style": Apply a text style. Must include "style" field.
              Valid styles: "bold", "italic", "boldItalic", "underline", "strikethrough", "sansSerif", "smallCaps", "doubleStruck"
            - type "list": Mark a line as a list item. Must include "marker" field.
              Valid markers: "dot", "arrow", "number"
            
            COORDINATE SYSTEM:
            - "start" and "end" are 0-based character indices into the original text.
            - "end" is exclusive (the character at "end" is NOT included).
            - Each operation's [start, end) range must fall within the text boundaries.
            
            FORMATTING GUIDELINES:
            """;

        String styleInstructions = switch (style != null ? style.toLowerCase() : "") {
            case "professional" -> """
                - Use minimal bolding for key terms and headings only.
                - Avoid italics.
                - Use dot bullets for lists.
                - Keep formatting clean and corporate.
                """;
            case "bold & punchy" -> """
                - Use heavy bolding for hooks and key takeaways.
                - Use arrow bullets for lists.
                - Italicize emotional or impactful words.
                - Make the post visually punchy and attention-grabbing.
                """;
            case "technical" -> """
                - Bold technical terms, metrics, and important concepts.
                - Use numbered lists for sequential steps.
                - Underline conclusions or key findings.
                - Format for clarity and precision.
                """;
            case "clean" -> """
                - Extremely minimal formatting.
                - Only use bold for section headers or the opening hook.
                - No italics or underlines.
                - Let the text breathe.
                """;
            default -> """
                - Use balanced formatting to make the post readable and engaging.
                - Bold key phrases and section headers.
                - Use appropriate list markers where content naturally forms a list.
                """;
        };

        String example = """
            
            EXAMPLE OUTPUT:
            For the text "AI is transforming how we build software. Here are 3 key trends:" (62 characters)
            A valid response would be:
            {
              "version": "1.0",
              "operations": [
                {"id": "op_1", "type": "style", "start": 0, "end": 2, "style": "bold"},
                {"id": "op_2", "type": "style", "start": 39, "end": 62, "style": "bold"}
              ]
            }
            
            EXAMPLE REWRITE OUTPUT (If user asked to add emojis):
            {
              "version": "1.0",
              "rewrittenText": "🚀 AI is transforming how we build software! Here are 3 key trends:",
              "operations": [
                {"id": "op_1", "type": "style", "start": 3, "end": 5, "style": "bold"}
              ]
            }
            """;

        String custom = customInstructions != null && !customInstructions.isBlank() ?
            "\nUSER CUSTOM INSTRUCTIONS:\n" + customInstructions + "\n" : "";

        return basePrompt + styleInstructions + example + custom;
    }
}
