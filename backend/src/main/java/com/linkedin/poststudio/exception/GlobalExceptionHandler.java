package com.linkedin.poststudio.exception;

import com.linkedin.poststudio.dto.FormatResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<FormatResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            // Only return messages we authored in the DTO (@NotBlank, @Size).
            // Default message strings from the framework are safe; never echo raw values.
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage == null ? "Invalid value" : errorMessage);
        });

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(FormatResponse.builder()
                        .success(false)
                        .errorMessage("Validation failed")
                        .metadata(errors)
                        .build());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<FormatResponse> handleIllegalArgumentException(IllegalArgumentException ex) {
        // Log internally for debugging, but return a sanitized message to the client.
        log.debug("IllegalArgumentException: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(FormatResponse.builder()
                        .success(false)
                        .errorMessage("The AI returned an invalid response. Please try again.")
                        .build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<FormatResponse> handleAllExceptions(Exception ex) {
        // Log the full stack trace server-side, but never echo it to the client.
        log.error("Unhandled exception", ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(FormatResponse.builder()
                        .success(false)
                        .errorMessage("An unexpected error occurred. Please try again.")
                        .build());
    }
}
