import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Image as ImageIcon, X, Plus, Trash, CheckCircle } from "@phosphor-icons/react";
import { Input } from "@/src/shared/components/ui/Input";
import { Select } from "@/src/shared/components/ui/Select";
import { Grid } from "@/src/shared/components/layout/Grid";
import { Button } from "@/src/shared/components/ui/Button";
import { SmartImage } from "@/src/shared/components/ui/SmartImage";
import { useImageUpload } from "@/src/shared/hooks/useImageUpload";
import { DiscountType, ConditionType, type PromotionCondition } from "@/src/features/benefit/promotion/shared/types/promotion.types";
import { CONDITION_CONFIG, getConditionValueDisplay } from "../../../config/conditionConfig";
import { fetchBranches } from "@/src/api/branch.api";
import { fetchCourts } from "@/src/api/court.api";
import type { BranchDto } from "@/src/features/branch/shared/types/branch.types";
import type { CourtDto } from "@/src/features/court/shared/types/court.types";
import {
  createValidatedChangeHandler,
  createValidatedTransformHandler,
  createNumericChangeHandler,
  createTrimOnBlurHandler,
  ValidationRules,
} from "@/src/shared/utils/inputValidation";
import { renderConditionInput } from "../utils/conditionInputRenderer";

export interface PromotionFormData {
  name: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  maxDiscountAmount: string;
  usageLimit: string;
  usagePerUserLimit: string;
  startDate: string;
  endDate: string;
  conditions: PromotionCondition[];
  promoDisplayUrl?: string;
}

export interface PromotionFormErrors {
  name?: string;
  code?: string;
  discountValue?: string;
  maxDiscountAmount?: string;
  startDate?: string;
  endDate?: string;
  general?: string;
}

interface PromotionFormProps {
  initialData?: Partial<PromotionFormData>;
  onSubmit: (data: PromotionFormData) => Promise<void>;
  errors: PromotionFormErrors;
  setErrors: (errors: PromotionFormErrors) => void;
  isSubmitting: boolean;
  showToast: (tone: "success" | "error", msg: string) => void;
  submitButtonText?: string;
  onUploadingChange?: (isUploading: boolean) => void;
}

export interface PromotionFormHandle {
  submit: () => Promise<void>;
  hasChanges: () => boolean;
}

export const PromotionForm = forwardRef<PromotionFormHandle, PromotionFormProps>(function PromotionForm({
  initialData,
  onSubmit,
  errors,
  setErrors,
  isSubmitting,
  showToast,
  submitButtonText,
  onUploadingChange,
}, ref) {
  const [name, setName] = useState(initialData?.name || "");
  const [code, setCode] = useState(initialData?.code || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [discountType, setDiscountType] = useState<DiscountType>(initialData?.discountType || DiscountType.PERCENT);
  const [discountValue, setDiscountValue] = useState(initialData?.discountValue || "");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(initialData?.maxDiscountAmount || "");
  const [usageLimit, setUsageLimit] = useState(initialData?.usageLimit || "");
  const [usagePerUserLimit, setUsagePerUserLimit] = useState(initialData?.usagePerUserLimit || "");
  const [startDate, setStartDate] = useState(initialData?.startDate || "");
  const [endDate, setEndDate] = useState(initialData?.endDate || "");
  const [conditions, setConditions] = useState<PromotionCondition[]>(initialData?.conditions || []);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(initialData?.promoDisplayUrl || "");

  // Condition builder state
  const [selectedConditionType, setSelectedConditionType] = useState<ConditionType | "">("");
  const [conditionValue, setConditionValue] = useState("");

  // Data for selects
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [courts, setCourts] = useState<CourtDto[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");

  const imageUpload = useImageUpload({
    folder: "promotions",
    onSuccess: (url) => {
      setUploadedImageUrl(url);
      showToast("success", "Tải ảnh lên thành công");
    },
    onError: (msg) => showToast("error", msg),
  });

  // Notify parent about upload status
  useEffect(() => {
    onUploadingChange?.(imageUpload.uploading);
  }, [imageUpload.uploading, onUploadingChange]);

  // Validate discount value when switching discount types
  useEffect(() => {
    if (discountValue) {
      const numValue = parseFloat(discountValue);
      if (discountType === DiscountType.PERCENT) {
        // Check if value exceeds 100% when switching to PERCENT
        if (numValue > 100) {
          setDiscountValue("100");
          setErrors({ ...errors, discountValue: "Tỷ lệ giảm giá không được vượt quá 100%" });
        } else if (numValue < 0) {
          setDiscountValue("0");
          setErrors({ ...errors, discountValue: "Tỷ lệ giảm giá phải lớn hơn 0" });
        } else {
          // Clear error if value is valid
          setErrors({ ...errors, discountValue: undefined });
        }
      } else {
        // For FIXED type, just ensure it's positive
        if (numValue < 0) {
          setDiscountValue("0");
          setErrors({ ...errors, discountValue: "Số tiền giảm phải lớn hơn 0" });
        } else {
          setErrors({ ...errors, discountValue: undefined });
        }
      }
    }
  }, [discountType]);

  // Load branches for branch selector
  useEffect(() => {
    loadBranches();
  }, []);

  // Load courts when branch is selected
  useEffect(() => {
    if (selectedBranchId) {
      loadCourts(selectedBranchId);
    }
  }, [selectedBranchId]);

  async function loadBranches() {
    try {
      const data = await fetchBranches(1, 50);
      setBranches(data.items);
    } catch (err: any) {
      showToast("error", err.message);
    }
  }

  async function loadCourts(branchId: string) {
    try {
      const data = await fetchCourts(branchId);
      setCourts(data);
    } catch (err: any) {
      showToast("error", err.message);
    }
  }

  function handleAddCondition() {
    if (!selectedConditionType || !conditionValue.trim()) {
      showToast("error", "Vui lòng chọn loại điều kiện và nhập giá trị");
      return;
    }

    // Check if exact condition already exists
    const exists = conditions.some(c => c.conditionType === selectedConditionType && c.conditionValue === conditionValue.trim());
    if (exists) {
      showToast("error", "Điều kiện này đã tồn tại");
      return;
    }

    setConditions([...conditions, {
      conditionType: selectedConditionType,
      conditionValue: conditionValue.trim(),
    }]);
    setSelectedConditionType("");
    setConditionValue("");
  }

  function handleRemoveCondition(index: number) {
    setConditions(conditions.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    // Wait for any pending upload to complete
    if (imageUpload.uploading) {
      showToast("error", "Vui lòng đợi ảnh tải lên hoàn tất");
      return;
    }

    const formData: PromotionFormData = {
      name: name.trim(),
      code: code.trim(),
      description: description.trim(),
      discountType,
      discountValue,
      maxDiscountAmount,
      usageLimit,
      usagePerUserLimit,
      startDate,
      endDate,
      conditions,
      promoDisplayUrl: uploadedImageUrl,
    };

    await onSubmit(formData);
  }

  // Expose submit method via ref
  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
    hasChanges: () => {
      // Check if any field has changed from initial data
      return (
        name !== (initialData?.name || "") ||
        code !== (initialData?.code || "") ||
        description !== (initialData?.description || "") ||
        discountType !== (initialData?.discountType || DiscountType.PERCENT) ||
        discountValue !== (initialData?.discountValue || "") ||
        maxDiscountAmount !== (initialData?.maxDiscountAmount || "") ||
        usageLimit !== (initialData?.usageLimit || "") ||
        usagePerUserLimit !== (initialData?.usagePerUserLimit || "") ||
        startDate !== (initialData?.startDate || "") ||
        endDate !== (initialData?.endDate || "") ||
        uploadedImageUrl !== (initialData?.promoDisplayUrl || "") ||
        JSON.stringify(conditions) !== JSON.stringify(initialData?.conditions || [])
      );
    },
  }));

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Thông tin cơ bản</h3>
        <div className="flex gap-6 items-start">
          {/* Left side - Name and Code */}
          <div className="flex-1 space-y-4">
            <Input
              label="Tên chương trình *"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors({ ...errors, name: undefined });
              }}
              onBlur={createTrimOnBlurHandler(setName)}
              placeholder="VD: Khuyến mãi hè 2026"
              error={errors.name}
            />

            <Input
              label="Mã khuyến mãi"
              type="text"
              value={code}
              onChange={createValidatedTransformHandler(
                (val) => {
                  setCode(val);
                  setErrors({ ...errors, code: undefined });
                },
                ValidationRules.codeFormat,
                (v) => v.toUpperCase()
              )}
              placeholder="VD: SUMMER20"
              error={errors.code}
            />
          </div>

          {/* Right side - Image */}
          <div className="w-48 flex-shrink-0 self-stretch flex flex-col">
            <label className="block text-xs font-semibold text-muted mb-2">
              ẢNH
            </label>

            <div className="flex-1">
              {(imageUpload.preview || uploadedImageUrl) ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-border w-full h-full">
                  <SmartImage
                    src={imageUpload.preview || uploadedImageUrl}
                    alt="Promotion"
                    width={480}
                    height={480}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      imageUpload.clear();
                      setUploadedImageUrl("");
                    }}
                    className="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg"
                    disabled={imageUpload.uploading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {imageUpload.uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-white text-sm font-semibold">Đang tải lên...</div>
                    </div>
                  )}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                  <div className="flex flex-col items-center justify-center p-4">
                    <ImageIcon className="h-10 w-10 text-muted mb-2" />
                    <p className="text-xs font-semibold text-foreground text-center">Nhấn để chọn ảnh</p>
                    <p className="text-[10px] text-muted mt-1 text-center leading-tight">JPG, PNG, WEBP hoặc GIF (tối đa 10MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        void imageUpload.handleFile(file);
                      }
                    }}
                  />
                </label>
              )}

              {imageUpload.error && (
                <p className="mt-2 text-xs text-red-600">{imageUpload.error}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Mô tả
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="VD: Giảm 20% cho tất cả đơn đặt sân"
            rows={2}
            className="w-full rounded-xl border border-border bg-surface-1 px-4 py-2.5 text-base text-foreground placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>
      </div>

      {/* Discount Settings */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Cài đặt giảm giá</h3>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Loại giảm giá *
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setDiscountType(DiscountType.PERCENT)}
              className={`relative rounded-xl border-2 p-4 text-left transition-all ${discountType === DiscountType.PERCENT
                ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20"
                : "border-border bg-surface-1 hover:border-primary/50 hover:bg-primary/5"
                }`}
            >
              {/* Checkmark indicator */}
              {discountType === DiscountType.PERCENT && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="h-5 w-5 text-primary" weight="fill" />
                </div>
              )}

              {/* Text */}
              <div className="font-bold text-foreground text-base mb-1">Phần trăm (%)</div>
              <div className={`text-xs transition-colors ${discountType === DiscountType.PERCENT
                ? "text-primary"
                : "text-muted"
                }`}>
                VD: Giảm 20% giá trị đơn hàng
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDiscountType(DiscountType.FIXED)}
              className={`relative rounded-xl border-2 p-4 text-left transition-all ${discountType === DiscountType.FIXED
                ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20"
                : "border-border bg-surface-1 hover:border-primary/50 hover:bg-primary/5"
                }`}
            >
              {/* Checkmark indicator */}
              {discountType === DiscountType.FIXED && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="h-5 w-5 text-primary" weight="fill" />
                </div>
              )}

              {/* Text */}
              <div className="font-bold text-foreground text-base mb-1">Số tiền cố định</div>
              <div className={`text-xs transition-colors ${discountType === DiscountType.FIXED
                ? "text-primary"
                : "text-muted"
                }`}>
                VD: Giảm 50,000 VNĐ
              </div>
            </button>
          </div>
        </div>

        <Grid cols={2} spacing="md">
          <Input
            label={discountType === DiscountType.PERCENT ? "Tỷ lệ giảm giá (%) *" : "Số tiền giảm (VNĐ) *"}
            type="number"
            onWheel={(e) => e.currentTarget.blur()}
            inputMode="decimal"
            value={discountValue}
            onChange={
              discountType === DiscountType.PERCENT
                ? createValidatedChangeHandler(
                  (val) => {
                    setDiscountValue(val);
                    setErrors({ ...errors, discountValue: undefined });
                  },
                  ValidationRules.percentage
                )
                : createNumericChangeHandler(
                  (val) => {
                    setDiscountValue(val);
                    setErrors({ ...errors, discountValue: undefined });
                  },
                  { min: 0, allowDecimal: false }
                )
            }
            error={errors.discountValue}
            rightIcon={<span className="text-sm font-bold text-slate-400">{discountType === DiscountType.PERCENT ? "%" : "VNĐ"}</span>}
            className="[&_input]:[-moz-appearance:textfield] [&_input]:[&::-webkit-outer-spin-button]:appearance-none [&_input]:[&::-webkit-inner-spin-button]:appearance-none"
          />

          {discountType === DiscountType.PERCENT && (
            <Input
              label="Giảm tối đa (VNĐ)"
              type="number"
              onWheel={(e) => e.currentTarget.blur()}
              value={maxDiscountAmount}
              onChange={createNumericChangeHandler(
                (val) => {
                  setMaxDiscountAmount(val);
                  setErrors({ ...errors, maxDiscountAmount: undefined });
                },
                { min: 0, allowDecimal: false }
              )}
              error={errors.maxDiscountAmount}
              rightIcon={<span className="text-sm font-bold text-slate-400">VNĐ</span>}
              className="[&_input]:[-moz-appearance:textfield] [&_input]:[&::-webkit-outer-spin-button]:appearance-none [&_input]:[&::-webkit-inner-spin-button]:appearance-none"
            />
          )}
        </Grid>
      </div>

      {/* Usage Limits */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Giới hạn sử dụng</h3>

        <Grid cols={2} spacing="md">
          <Input
            label="Tổng số lượt sử dụng"
            type="number"
            onWheel={(e) => e.currentTarget.blur()}
            value={usageLimit}
            onChange={createNumericChangeHandler(setUsageLimit, { min: 1, allowDecimal: false })}
            placeholder="Để trống = không giới hạn"
            className="[&_input]:[-moz-appearance:textfield] [&_input]:[&::-webkit-outer-spin-button]:appearance-none [&_input]:[&::-webkit-inner-spin-button]:appearance-none"
          />

          <Input
            label="Giới hạn sử dụng cho mỗi người dùng"
            type="number"
            onWheel={(e) => e.currentTarget.blur()}
            value={usagePerUserLimit}
            onChange={createNumericChangeHandler(setUsagePerUserLimit, { min: 1, allowDecimal: false })}
            placeholder="Để trống = không giới hạn"
            className="[&_input]:[-moz-appearance:textfield] [&_input]:[&::-webkit-outer-spin-button]:appearance-none [&_input]:[&::-webkit-inner-spin-button]:appearance-none"
          />
        </Grid>
      </div>

      {/* Dates */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Thời gian áp dụng</h3>

        <Grid cols={2} spacing="md">
          <Input
            label="Ngày bắt đầu *"
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setErrors({ ...errors, startDate: undefined, endDate: undefined });
            }}
            error={errors.startDate}
          />

          <Input
            label="Ngày kết thúc *"
            type="date"
            min={startDate}
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setErrors({ ...errors, endDate: undefined });
            }}
            error={errors.endDate}
          />
        </Grid>
      </div>

      {/* Conditions */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Điều kiện áp dụng</h3>

        {/* Existing Conditions */}
        {conditions.length > 0 && (
          <div className="space-y-2">
            {conditions.map((condition, index) => {
              const config = CONDITION_CONFIG[condition.conditionType];
              return (
                <div
                  key={`${condition.conditionType}-${index}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface-2/50 p-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{config.label}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {getConditionValueDisplay(condition.conditionType, condition.conditionValue)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCondition(index)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Add New Condition */}
        <div className="space-y-3 rounded-xl border-2 border-dashed border-border bg-surface-2/30 p-4">
          <Select
            value={selectedConditionType}
            onChange={(val) => {
              setSelectedConditionType(val as ConditionType);
              setConditionValue("");
              setSelectedBranchId("");
            }}
            placeholder="Chọn loại điều kiện"
          >
            {Object.entries(CONDITION_CONFIG).map(([type, config]) => (
              <option key={type} value={type}>
                {config.label}
              </option>
            ))}
          </Select>

          {selectedConditionType && (
            <>
              {renderConditionInput({
                selectedConditionType,
                conditionValue,
                setConditionValue,
                branches,
                courts,
                selectedBranchId,
                setSelectedBranchId,
              })}
              <Button
                variant="primary"
                onClick={handleAddCondition}
                leftIcon={<Plus className="h-5 w-5" weight="bold" />}
                className="w-full shadow-md shadow-primary/20 hover:shadow-lg"
              >
                Thêm điều kiện
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Optional Submit Button for standalone use */}
      {submitButtonText && (
        <div className="pt-4">
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || imageUpload.uploading}
            isLoading={isSubmitting}
            className="w-full"
          >
            {submitButtonText}
          </Button>
        </div>
      )}
    </div>
  );
});
