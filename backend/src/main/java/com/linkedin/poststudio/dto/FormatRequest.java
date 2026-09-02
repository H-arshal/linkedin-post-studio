package com.linkedin.poststudio.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FormatRequest {
    @NotBlank(message = "Text cannot be blank")
    private String text;
    
    private String style; // Minimal, Professional, Bold & Punchy, Technical, Clean
    
    private String customInstructions; // Optional extra instructions
}
