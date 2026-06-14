import { useState } from "react";
import {
    Robot,
    X,
    ChatCircleDots,
    CalendarCheck,
} from "@phosphor-icons/react";
import { useAIChat } from "@/src/features/ai/shared/hooks/useAIChat";
import { ChatPanel } from "@/src/features/ai/shared/components/ChatPanel";

// Placeholder — will be implemented separately
import { BookingSuggestionsPanel } from "@/src/features/ai/shared/components/BookingSuggestionsPanel";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tab = "chat" | "booking-tips";

interface AIAssistantWidgetProps {
    /** The current user's role — widget is intended for Customer / Staff. */
    role: "CUSTOMER" | "STAFF";
}

// ---------------------------------------------------------------------------
// AIAssistantWidget
// ---------------------------------------------------------------------------

/**
 * Floating AI assistant widget anchored to the bottom-right corner.
 *
 * - Closed state: a pulsing FAB button.
 * - Open state: a slide-up chat panel with [Chat] and [Booking Tips] tabs.
 * - Completely self-contained; parent only passes `role`.
 */
export function AIAssistantWidget({ role }: AIAssistantWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>("chat");

    const { messages, isLoading, error, sendMessage, clearSession } =
        useAIChat();

    function toggleOpen() {
        setIsOpen((prev) => !prev);
    }

    // ── Render ────────────────────────────────────────────────────────────

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {/* ── Chat Panel ──────────────────────────────────────────── */}
            <div
                className={`flex flex-col overflow-hidden rounded-2xl border border-border bg-surface-1 shadow-2xl transition-all duration-300 ease-in-out origin-bottom-right ${isOpen
                        ? "w-[360px] h-[520px] opacity-100 scale-100 pointer-events-auto"
                        : "w-0 h-0 opacity-0 scale-90 pointer-events-none"
                    }`}
                style={{
                    boxShadow: isOpen
                        ? "0 20px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.05)"
                        : "none",
                }}
                aria-hidden={!isOpen}
            >
                {isOpen && (
                    <>
                        {/* ── Header ──────────────────────────────────── */}
                        <div
                            className="flex items-center justify-between px-4 py-3 text-white"
                            style={{
                                background:
                                    "linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)",
                            }}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                                    <Robot
                                        className="h-4 w-4 text-white"
                                        weight="duotone"
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-bold leading-tight">
                                        SmashCourt AI
                                    </p>
                                    <p className="text-[10px] text-white/70 leading-tight">
                                        Trợ lý thông minh
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                {/* Clear session */}
                                {messages.length > 0 && activeTab === "chat" && (
                                    <button
                                        onClick={clearSession}
                                        className="rounded-full px-2.5 py-1 text-[10px] font-semibold text-white/70 transition-all hover:bg-white/15 hover:text-white"
                                        aria-label="Xóa cuộc trò chuyện"
                                    >
                                        Xóa chat
                                    </button>
                                )}

                                {/* Close */}
                                <button
                                    onClick={toggleOpen}
                                    className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-all hover:bg-white/15 hover:text-white"
                                    aria-label="Đóng trợ lý AI"
                                >
                                    <X className="h-4 w-4" weight="bold" />
                                </button>
                            </div>
                        </div>

                        {/* ── Tab Bar ─────────────────────────────────── */}
                        <div className="flex border-b border-border bg-surface-1">
                            <TabButton
                                id="ai-tab-chat"
                                label="Chat"
                                icon={<ChatCircleDots className="h-3.5 w-3.5" weight="duotone" />}
                                isActive={activeTab === "chat"}
                                onClick={() => setActiveTab("chat")}
                            />
                            <TabButton
                                id="ai-tab-booking"
                                label="Gợi ý đặt sân"
                                icon={<CalendarCheck className="h-3.5 w-3.5" weight="duotone" />}
                                isActive={activeTab === "booking-tips"}
                                onClick={() => setActiveTab("booking-tips")}
                            />
                        </div>

                        {/* ── Tab Content ─────────────────────────────── */}
                        <div className="flex-1 overflow-hidden">
                            {activeTab === "chat" ? (
                                <ChatPanel
                                    messages={messages}
                                    isLoading={isLoading}
                                    error={error}
                                    onSendMessage={sendMessage}
                                />
                            ) : (
                                <BookingSuggestionsPanel role={role} />
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* ── FAB Toggle Button ───────────────────────────────────── */}
            <button
                onClick={toggleOpen}
                className="relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
                style={{
                    background:
                        "linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)",
                    boxShadow: "0 6px 20px rgba(27, 94, 56, 0.5)",
                }}
                aria-label={isOpen ? "Đóng trợ lý AI" : "Mở trợ lý AI"}
                aria-expanded={isOpen}
            >
                {/* Pulse ring — only when closed */}
                {!isOpen && (
                    <span className="absolute inset-0 rounded-full animate-ping bg-primary/40" />
                )}

                <span
                    className={`transition-all duration-200 ${isOpen ? "rotate-90 opacity-0 scale-50 absolute" : ""
                        }`}
                >
                    <Robot className="h-6 w-6" weight="duotone" />
                </span>
                <span
                    className={`transition-all duration-200 ${isOpen ? "" : "rotate-90 opacity-0 scale-50 absolute"
                        }`}
                >
                    <X className="h-6 w-6" weight="bold" />
                </span>

                {/* Unread dot — shown when there are messages and widget is closed */}
                {!isOpen && messages.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-surface-1">
                        {messages.filter((m) => m.role === "assistant").length}
                    </span>
                )}
            </button>
        </div>
    );
}

// ---------------------------------------------------------------------------
// TabButton helper
// ---------------------------------------------------------------------------

interface TabButtonProps {
    id: string;
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}

function TabButton({ id, label, icon, isActive, onClick }: TabButtonProps) {
    return (
        <button
            id={id}
            role="tab"
            aria-selected={isActive}
            onClick={onClick}
            className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all border-b-2 ${isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted hover:text-foreground hover:border-border"
                }`}
        >
            {icon}
            {label}
        </button>
    );
}
