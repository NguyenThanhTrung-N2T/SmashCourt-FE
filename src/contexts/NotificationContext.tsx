"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useReducer,
} from "react";
import type { NotificationItem } from "@/src/types/notification.types";

// ---------------------------------------------------------------------------
// State & Actions
// ---------------------------------------------------------------------------

interface NotificationState {
    notifications: NotificationItem[];
    unreadCount: number;
}

type NotificationAction =
    | { type: "ADD"; item: NotificationItem }
    | { type: "MARK_READ"; id: string }
    | { type: "MARK_ALL_READ" }
    | { type: "CLEAR_ALL" };

const MAX_NOTIFICATIONS = 50;

function reducer(
    state: NotificationState,
    action: NotificationAction,
): NotificationState {
    switch (action.type) {
        case "ADD": {
            const next = [action.item, ...state.notifications].slice(
                0,
                MAX_NOTIFICATIONS,
            );
            return { notifications: next, unreadCount: state.unreadCount + 1 };
        }
        case "MARK_READ": {
            const next = state.notifications.map((n) =>
                n.id === action.id ? { ...n, read: true } : n,
            );
            const unread = next.filter((n) => !n.read).length;
            return { notifications: next, unreadCount: unread };
        }
        case "MARK_ALL_READ": {
            const next = state.notifications.map((n) => ({ ...n, read: true }));
            return { notifications: next, unreadCount: 0 };
        }
        case "CLEAR_ALL":
            return { notifications: [], unreadCount: 0 };
        default:
            return state;
    }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface NotificationContextValue {
    notifications: NotificationItem[];
    unreadCount: number;
    addNotification: (item: NotificationItem) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
    undefined,
);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function NotificationProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [state, dispatch] = useReducer(reducer, {
        notifications: [],
        unreadCount: 0,
    });

    const addNotification = useCallback((item: NotificationItem) => {
        dispatch({ type: "ADD", item });
    }, []);

    const markAsRead = useCallback((id: string) => {
        dispatch({ type: "MARK_READ", id });
    }, []);

    const markAllAsRead = useCallback(() => {
        dispatch({ type: "MARK_ALL_READ" });
    }, []);

    const clearAll = useCallback(() => {
        dispatch({ type: "CLEAR_ALL" });
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                notifications: state.notifications,
                unreadCount: state.unreadCount,
                addNotification,
                markAsRead,
                markAllAsRead,
                clearAll,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useNotificationContext() {
    const ctx = useContext(NotificationContext);
    if (!ctx) {
        throw new Error(
            "useNotificationContext must be used inside <NotificationProvider>",
        );
    }
    return ctx;
}
