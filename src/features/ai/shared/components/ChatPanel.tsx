import {
    useRef,
    useEffect,
    useState,
    KeyboardEvent,
    FormEvent,
} from "react";
import {
    PaperPlaneTilt,
    CircleNotch,
    Robot,
    User,
    WarningCircle,
} from "@phosphor-icons/react";
import type { ChatMessage } from "@/src/features/ai/shared/hooks/useAIChat";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatPanelProps {
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;
    onSendMessage: (text: string) => void;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * Parse timestamp from Backend (can be ISO string or dd/MM/yyyy HH:mm:ss format)
 */
function parseTimestamp(timestamp: string): Date {
    // Try ISO format first
    const isoDate = new Date(timestamp);
    if (!isNaN(isoDate.getTime())) {
        return isoDate;
    }
    
    // Try dd/MM/yyyy HH:mm:ss format
    const match = timestamp.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
    if (match) {
        const [, day, month, year, hour, minute, second] = match;
        return new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hour),
            parseInt(minute),
            parseInt(second)
        );
    }
    
    // Fallback to current time
    return new Date();
}

function MessageBubble({ message }: { message: ChatMessage }) {
    const isUser = message.role === "user";

    return (
        <div
            className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
        >
            {/* Avatar */}
            <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isUser
                    ? "bg-primary/20 text-primary"
                    : "bg-surface-2 text-muted"
                    }`}
            >
                {isUser ? (
                    <User className="h-3.5 w-3.5" weight="bold" />
                ) : (
                    <Robot className="h-3.5 w-3.5" weight="bold" />
                )}
            </div>

            {/* Bubble */}
            <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${isUser
                    ? "rounded-br-sm bg-primary text-white"
                    : "rounded-bl-sm bg-surface-2 text-foreground"
                    }`}
                style={
                    isUser
                        ? {
                            background:
                                "linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)",
                        }
                        : undefined
                }
            >
                {message.content}
                <p
                    className={`mt-1 text-[10px] ${isUser ? "text-white/50" : "text-muted"
                        }`}
                >
                    {parseTimestamp(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </p>
            </div>
        </div>
    );
}

function TypingIndicator() {
    return (
        <div className="flex items-end gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted">
                <Robot className="h-3.5 w-3.5" weight="bold" />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-surface-2 px-4 py-3">
                <span
                    className="h-1.5 w-1.5 rounded-full bg-muted animate-bounce"
                    style={{ animationDelay: "0ms" }}
                />
                <span
                    className="h-1.5 w-1.5 rounded-full bg-muted animate-bounce"
                    style={{ animationDelay: "150ms" }}
                />
                <span
                    className="h-1.5 w-1.5 rounded-full bg-muted animate-bounce"
                    style={{ animationDelay: "300ms" }}
                />
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// ChatPanel
// ---------------------------------------------------------------------------

export function ChatPanel({
    messages,
    isLoading,
    error,
    onSendMessage,
}: ChatPanelProps) {
    const [inputValue, setInputValue] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom on new messages or loading state change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    function handleSubmit(e?: FormEvent) {
        e?.preventDefault();
        const text = inputValue.trim();
        if (!text || isLoading) return;
        onSendMessage(text);
        setInputValue("");
    }

    function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }

    function handleChipClick(suggestion: string) {
        if (isLoading) return;
        onSendMessage(suggestion);
    }

    // Find the last assistant message that has suggestion chips
    const lastAssistantIdx = [...messages]
        .reverse()
        .findIndex((m) => m.role === "assistant" && m.suggestions?.length);
    const lastAssistantWithSuggestions =
        lastAssistantIdx !== -1
            ? messages[messages.length - 1 - lastAssistantIdx]
            : null;

    const hasMessages = messages.length > 0;

    return (
        <div className="flex h-full flex-col">
            {/* ── Message list ─────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth custom-scrollbar">
                {!hasMessages && (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Robot className="h-6 w-6 text-primary" weight="duotone" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                Xin chào! Tôi có thể giúp gì cho bạn?
                            </p>
                            <p className="mt-1 text-xs text-muted">
                                Hỏi về đặt sân, giá cả hoặc bất kỳ điều gì khác.
                            </p>
                        </div>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx}>
                        <MessageBubble message={msg} />

                        {/* Suggestion chips — only on the last AI message */}
                        {msg.role === "assistant" &&
                            msg === lastAssistantWithSuggestions &&
                            !isLoading &&
                            msg.suggestions &&
                            msg.suggestions.length > 0 && (
                                <div className="mt-2 ml-9 flex flex-wrap gap-1.5">
                                    {msg.suggestions.map((chip, chipIdx) => (
                                        <button
                                            key={chipIdx}
                                            onClick={() => handleChipClick(chip)}
                                            disabled={isLoading}
                                            className="rounded-full border border-primary/30 bg-primary/8 px-3 py-1 text-xs font-medium text-primary transition-all hover:bg-primary/15 hover:border-primary/60 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {chip}
                                        </button>
                                    ))}
                                </div>
                            )}
                    </div>
                ))}

                {isLoading && <TypingIndicator />}

                {/* Error banner */}
                {error && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-500">
                        <WarningCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* ── Input area ───────────────────────────────────────────── */}
            <form
                onSubmit={handleSubmit}
                className="flex items-end gap-2 border-t border-border bg-surface-1 px-3 py-3"
            >
                <textarea
                    ref={inputRef}
                    rows={1}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tin nhắn…"
                    disabled={isLoading}
                    className="flex-1 resize-none rounded-xl border-2 border-border bg-surface-2 px-3 py-2.5 text-sm text-foreground outline-none transition-all placeholder:text-muted focus:border-primary/60 focus:bg-surface-1 focus:ring-4 focus:ring-primary/10 disabled:opacity-50 max-h-28 overflow-y-auto"
                    style={{ fieldSizing: "content" } as React.CSSProperties}
                />
                <button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-md transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                    style={{
                        background:
                            "linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)",
                        boxShadow: "0 4px 14px rgba(27, 94, 56, 0.35)",
                    }}
                    aria-label="Gửi tin nhắn"
                >
                    {isLoading ? (
                        <CircleNotch className="h-4 w-4 animate-spin" />
                    ) : (
                        <PaperPlaneTilt className="h-4 w-4" weight="fill" />
                    )}
                </button>
            </form>
        </div>
    );
}
