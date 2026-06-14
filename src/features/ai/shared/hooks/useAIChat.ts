import { useState, useCallback } from "react";
import { sendPublicChat } from "@/src/api/ai.api";
import type { ChatResponseDto } from "@/src/features/ai/shared/types/ai.types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
    role: MessageRole;
    content: string;
    timestamp: string; // ISO 8601
    /** Populated on assistant messages only */
    suggestions?: string[];
}

export interface UseAIChatReturn {
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;
    sendMessage: (text: string) => Promise<void>;
    clearSession: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generates a UUID v4 using the Web Crypto API (available in all modern browsers and Node ≥ 19). */
function generateUUID(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for environments without crypto.randomUUID
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function nowISO(): string {
    return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * `useAIChat` — manages a stateful AI chat session.
 *
 * - Generates a UUID v4 session ID on first render and persists it in React
 *   state (NOT localStorage) for the lifetime of the component.
 * - Appends both the user turn and the assistant reply to `messages`.
 * - Surfaces `isLoading` and `error` states.
 * - `clearSession()` resets messages **and** rotates the session ID so the
 *   next message starts a fresh server-side conversation context.
 *
 * @example
 * const { messages, sendMessage, isLoading, error, clearSession } = useAIChat();
 */
export function useAIChat(): UseAIChatReturn {
    const [sessionId, setSessionId] = useState<string>(() => generateUUID());
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = useCallback(
        async (text: string) => {
            const trimmed = text.trim();
            if (!trimmed || isLoading) return;

            // Optimistically append the user message
            const userMessage: ChatMessage = {
                role: "user",
                content: trimmed,
                timestamp: nowISO(),
            };

            setMessages((prev) => [...prev, userMessage]);
            setIsLoading(true);
            setError(null);

            try {
                const response: ChatResponseDto = await sendPublicChat({
                    message: trimmed,
                    sessionId,
                });

                // Update sessionId from the server response (server may assign one)
                if (response.sessionId && response.sessionId !== sessionId) {
                    setSessionId(response.sessionId);
                }

                const assistantMessage: ChatMessage = {
                    role: "assistant",
                    content: response.reply,
                    timestamp: response.generatedAt ?? nowISO(),
                    suggestions: response.suggestions,
                };

                setMessages((prev) => [...prev, assistantMessage]);
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "An unknown error occurred.";
                setError(message);
            } finally {
                setIsLoading(false);
            }
        },
        [sessionId, isLoading]
    );

    const clearSession = useCallback(() => {
        setMessages([]);
        setError(null);
        // Rotate session ID so the next exchange starts a fresh context on the server
        setSessionId(generateUUID());
    }, []);

    return { messages, isLoading, error, sendMessage, clearSession };
}
