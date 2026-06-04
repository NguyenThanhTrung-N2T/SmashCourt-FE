"use client";

import {
    X,
    Plus,
    GridFour,
} from "@phosphor-icons/react";
import type { BranchCourtTypeDto } from "@/src/features/court-type/shared/types/court-type.types";
import { Button } from "@/src/shared/components/ui";

interface AddCourtTypePanelProps {
    availableCourtTypes: BranchCourtTypeDto[];
    actionLoading: boolean;
    onAdd: (courtTypeId: string) => Promise<void>;
    onClose: () => void;
}

export function AddCourtTypePanel({
    availableCourtTypes,
    actionLoading,
    onAdd,
    onClose,
}: AddCourtTypePanelProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 animate-fade-in p-4 sm:p-0">
            <div
                className="h-full w-full max-w-md bg-surface-1 shadow-2xl flex flex-col animate-slide-left p-6 sm:p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-foreground">Thêm loại sân</h2>
                        <p className="text-sm font-medium text-muted mt-1">Chọn loại sân để kích hoạt tại chi nhánh</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-surface-2 transition-colors text-muted hover:text-foreground"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-none">
                    {availableCourtTypes.length === 0 ? (
                        <div className="py-12 text-center rounded-2xl bg-surface-2 border border-dashed border-border">
                            <GridFour className="mx-auto h-12 w-12 text-muted mb-4 opacity-50" />
                            <p className="text-sm font-bold text-muted">
                                Tất cả loại sân hiện có đã được thêm.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {availableCourtTypes.map((courtType) => (
                                <div
                                    key={courtType.id}
                                    className="group flex items-start gap-4 p-4 rounded-2xl border border-border bg-surface-1 hover:border-primary hover:bg-primary/[0.02] transition-all duration-300"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 text-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                                        <GridFour className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0 py-1">
                                        <h4 className="text-base font-extrabold text-foreground mb-1">
                                            {courtType.courtTypeName}
                                        </h4>
                                        {courtType.courtTypeDescription && (
                                            <p className="text-xs text-muted line-clamp-2 italic">
                                                {courtType.courtTypeDescription}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => onAdd(courtType.courtTypeId)}
                                        disabled={actionLoading}
                                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-surface-2 group-hover:bg-primary text-muted group-hover:text-white transition-all shadow-sm active:scale-95"
                                    >
                                        <Plus className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                    <Button
                        variant="secondary"
                        className="w-full"
                        onClick={onClose}
                    >
                        Đóng
                    </Button>
                </div>
            </div>
        </div>
    );
}
