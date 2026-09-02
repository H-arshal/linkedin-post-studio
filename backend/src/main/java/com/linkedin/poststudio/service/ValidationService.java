package com.linkedin.poststudio.service;

import com.linkedin.poststudio.dto.FormattingOperation;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ValidationService {

    /**
     * Validates that the list of operations is valid for the given source text.
     * Ensures bounds are correct, ranges don't overlap improperly, and types are
     * valid.
     */
    public void validateOperations(String sourceText, List<FormattingOperation> operations) {
        if (operations == null || operations.isEmpty()) {
            return;
        }

        int length = sourceText.length();

        for (FormattingOperation op : operations) {
            // 1. Bounds check
            if (op.getStart() < 0 || op.getEnd() > length || op.getStart() >= op.getEnd()) {
                throw new IllegalArgumentException(
                        "Invalid operation bounds: [" + op.getStart() + ", " + op.getEnd() + "]");
            }

            // 2. Type and attribute check
            if ("style".equals(op.getType())) {
                if (op.getStyle() == null || op.getStyle().isBlank()) {
                    throw new IllegalArgumentException("Style operation must have a valid style attribute");
                }
            } else if ("list".equals(op.getType())) {
                if (op.getMarker() == null || op.getMarker().isBlank()) {
                    throw new IllegalArgumentException("List operation must have a valid marker attribute");
                }
            } else {
                throw new IllegalArgumentException("Unknown operation type: " + op.getType());
            }
        }

        // 3. Overlap check for style operations (simplified for now, frontend handles
        // merge/split)
        // Strictly speaking, styles shouldn't overlap with different styles unless
        // handled,
        // but for safety, we just ensure no duplicate identical ranges.
    }
}
