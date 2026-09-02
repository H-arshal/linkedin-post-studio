import type { FormattingOperation } from '../../types/formatting';

export interface AiFormatRequest {
  text: string;
  style: string;
  customInstructions?: string;
}

export interface AiFormatResponse {
  success: boolean;
  plan?: {
    version: string;
    rewrittenText?: string;
    operations: FormattingOperation[];
  };
  errorMessage?: string;
  metadata?: any;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://linkedin-post-studio-api.onrender.com';

/**
 * Sends the post text to the backend AI formatting service.
 */
export async function formatTextWithAi(request: AiFormatRequest): Promise<AiFormatResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/format/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      // If the response is not OK, attempt to parse the error message if provided
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        errorMessage: errorData?.errorMessage || `Server error: ${response.statusText}`,
      };
    }

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      errorMessage: error.message || 'Failed to connect to the formatting service.',
    };
  }
}
