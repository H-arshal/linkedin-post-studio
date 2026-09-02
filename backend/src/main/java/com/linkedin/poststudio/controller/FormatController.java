package com.linkedin.poststudio.controller;

import com.linkedin.poststudio.dto.FormatRequest;
import com.linkedin.poststudio.dto.FormatResponse;
import com.linkedin.poststudio.service.AiFormattingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/format")
@RequiredArgsConstructor
public class FormatController {

    private final AiFormattingService aiFormattingService;

    @PostMapping("/ai")
    public ResponseEntity<FormatResponse> formatText(@Valid @RequestBody FormatRequest request) {
        FormatResponse response = aiFormattingService.formatText(request);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
}
