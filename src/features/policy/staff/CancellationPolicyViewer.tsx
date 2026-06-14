"use client";

import { useCallback, useEffect, useState } from "react";
import { Warning, ArrowClockwise, ShieldCheck, Info } from "@phosphor-icons/react";

import { AuthApiError } from "@/src/api/auth.api";
import { fetchCancelPolicies } from "@/src/api/cancel-policy.api";
import { sortCancelPolicies } from "@/src/features/policy/utils/cancellationPolicy";
import type { CancelPolicy } from "@/src/features/policy/shared/types/cancel-policy.types";

import { Button } from "@/src/shared/components/ui/Button";
import { Alert } from "@/src/shared/components/ui/Alert";
import { Flex } from "@/src/shared/components/layout/Flex";
import { PolicyEditorRow } from "../owner/PolicyEditorRow";

type EditableCancelPolicy = CancelPolicy & { clientId: string; isNew: boolean };

function toEditablePolicy(policy: CancelPolicy): EditableCancelPolicy {
    return { ...policy, clientId: policy.id, isNew: false };
}

function resolveErrorMessage(error: unknown) {
    if (error instanceof AuthApiError || error instanceof Error) return error.message;
    return "Đã xảy ra lỗi khi tải chính sách hủy.";
}

export function CancellationPolicyViewer() {
    const [policies, setPolicies] = useState<EditableCancelPolicy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadPolicies = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchCancelPolicies();
            setPolicies(sortCancelPolicies(response).map(toEditablePolicy));
        } catch (err) {
            setError(resolveErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadPolicies();
    }, [loadPolicies]);

    return (
        <div className="space-y-6 animate-slide-up w-full text-foreground px-8 pt-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight text-foreground">
                        Chính sách hủy sân
                    </h1>
                    <p className="text-sm font-medium text-muted mt-1">
                        Xem các mốc hoàn tiền đang áp dụng trên hệ thống.
                    </p>
                </div>
                <Button
                    variant="secondary"
                    size="md"
                    onClick={() => void loadPolicies()}
                    disabled={loading}
                    leftIcon={<ArrowClockwise className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />}
                >
                    Làm mới
                </Button>
            </div>

            {/* Count label */}
            <Flex align="center" spacing="sm">
                <h2 className="text-lg font-bold tracking-tight text-foreground">Danh sách thiết lập</h2>
                <span className="inline-flex items-center justify-center rounded-lg bg-surface-2 px-2 py-0.5 text-xs font-bold text-muted">
                    {policies.length} mốc
                </span>
            </Flex>

            {/* Content */}
            {loading ? (
                <div className="space-y-4 pt-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 w-full animate-pulse rounded-2xl bg-surface-2 border border-border" />
                    ))}
                </div>
            ) : error ? (
                <Alert variant="error" className="mt-4 py-8 flex flex-col items-center text-center">
                    <Warning className="h-10 w-10 text-red-500 mb-3" />
                    <p className="font-bold text-red-600">Lỗi kết nối</p>
                    <p className="mt-1 text-sm text-red-500 max-w-sm">{error}</p>
                </Alert>
            ) : policies.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-surface-1 px-8 py-16 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Chưa có chính sách nào</h3>
                    <p className="text-sm text-muted">Hiện tại hệ thống chưa thiết lập chính sách hủy nào.</p>
                </div>
            ) : (
                <div className="space-y-4 pt-2">
                    {policies.map((policy, index) => (
                        <PolicyEditorRow
                            key={policy.clientId}
                            policy={policy}
                            allPolicies={policies}
                            onChange={() => { }}
                            onRemove={() => { }}
                            disableRemove={true}
                            index={index}
                            readOnly={true}
                        />
                    ))}
                </div>
            )}
            {/* Read-only notice */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <Info className="h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">
                    Bạn đang ở chế độ xem.
                </p>
            </div>
        </div>

    );
}