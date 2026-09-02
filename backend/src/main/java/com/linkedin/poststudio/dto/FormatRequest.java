package com.linkedin.poststudio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class FormatRequest {
    @NotBlank(message = "Text cannot be blank")
    @Size(max = 5000, message = "Text cannot exceed 5000 characters (LinkedIn limit is 3000)")
    private String text;

    // Style must be one of: Minimal, Professional, Bold & Punchy, Technical, Clean (or null/empty)
    @Size(max = 50, message = "Style name too long")
    private String style;

    // Custom instructions are user-provided guidance; cap at 500 chars
    @Size(max = 500, message = "Custom instructions too long (max 500 chars)")
    private String customInstructions;
}
