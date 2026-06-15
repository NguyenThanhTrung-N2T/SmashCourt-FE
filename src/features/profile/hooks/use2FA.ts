"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuthSession } from "@/src/features/auth/session/sessionStore";
import {
    authDisable2FA,
    authDisable2FAVerify,
    authEnable2FA,
    authEnable2FAVerify,
} from "@/src/api/auth.api";

type TwoFAAction = "enable" | "disable";

type Use2FAOptions = {
    initialEnabled: boolean;
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
};

function getErrorMessage(error: unknown, fallback: string) {
    if (!error) return fallback;

    if (typeof error === "string") return error;
    if (error instanceof Error && error.message) return error.message;

    if (typeof error === "object" && error !== null) {
        const maybeMessage = (error as { message?: unknown }).message;
        if (typeof maybeMessage === "string" && maybeMessage.trim()) {
            return maybeMessage;
        }
    }

    return fallback;
}

export function use2FA({ initialEnabled, onSuccess, onError }: Use2FAOptions) {
    const [isEnabled, setIsEnabled] = useState(initialEnabled);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [action, setAction] = useState<TwoFAAction | null>(null);
    const [isRequestLoading, setIsRequestLoading] = useState(false);
    const [isVerifyLoading, setIsVerifyLoading] = useState(false);
    const [otpError, setOtpError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        setIsEnabled(initialEnabled);
    }, [initialEnabled]);

    const openOtpFlow = useCallback(
        async (nextAction: TwoFAAction) => {
            setIsRequestLoading(true);
            setOtpError(null);

            try {
                if (nextAction === "enable") {
                    const res = await authEnable2FA();
                    setAction("enable");
                    setShowOtpModal(true);
                    onSuccess?.(res.message ?? "OTP đã được gửi đến email của bạn.");
                } else {
                    const res = await authDisable2FA();
                    setAction("disable");
                    setShowOtpModal(true);
                    onSuccess?.(res.message ?? "OTP đã được gửi đến email của bạn.");
                }
            } catch (error) {
                const message = getErrorMessage(error, "Không thể gửi OTP. Vui lòng thử lại.");
                setOtpError(message);
                onError?.(message);
            } finally {
                setIsRequestLoading(false);
            }
        },
        [onError, onSuccess],
    );

    const requestEnable = useCallback(() => {
        if (isEnabled) return;
        void openOtpFlow("enable");
    }, [isEnabled, openOtpFlow]);

    const requestDisable = useCallback(() => {
        if (!isEnabled) return;
        void openOtpFlow("disable");
    }, [isEnabled, openOtpFlow]);

    const verify2FA = useCallback(
        async (otpCode: string) => {
            if (!action) return;

            setIsVerifyLoading(true);
            setOtpError(null);

            try {
                const res =
                    action === "enable"
                        ? await authEnable2FAVerify({ otpCode })
                        : await authDisable2FAVerify({ otpCode });

                const nextEnabled = action === "enable";
                setIsEnabled(nextEnabled);
                setShowOtpModal(false);
                setAction(null);

                const successMessage =
                    res.message ??
                    (nextEnabled
                        ? "Bật xác thực 2 yếu tố thành công. Vui lòng đăng nhập lại để áp dụng thay đổi."
                        : "Tắt xác thực 2 yếu tố thành công. Vui lòng đăng nhập lại để áp dụng thay đổi.");

                onSuccess?.(successMessage);

                setTimeout(() => {
                    clearAuthSession();
                    router.replace("/auth/login");
                }, 1500);
            } catch (error) {
                const message = getErrorMessage(error, "OTP không hợp lệ hoặc đã hết hạn.");
                setOtpError(message);
                onError?.(message);
            } finally {
                setIsVerifyLoading(false);
            }
        },
        [action, onError, onSuccess],
    );

    const resend2FA = useCallback(() => {
        if (!action) return;
        void openOtpFlow(action);
    }, [action, openOtpFlow]);

    const cancelOtp = useCallback(() => {
        setShowOtpModal(false);
        setAction(null);
        setOtpError(null);
    }, []);

    return {
        isEnabled,
        action,
        showOtpModal,
        isRequestLoading,
        isVerifyLoading,
        otpError,
        requestEnable,
        requestDisable,
        verify2FA,
        resend2FA,
        cancelOtp,
    };
}