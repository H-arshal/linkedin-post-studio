package com.linkedin.poststudio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormatResponse {
    private boolean success;
    private FormattingPlan plan;
    private String errorMessage;
    private Object metadata;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FormattingPlan {
        private String version;
        private String rewrittenText;
        private List<FormattingOperation> operations;
    }
}
