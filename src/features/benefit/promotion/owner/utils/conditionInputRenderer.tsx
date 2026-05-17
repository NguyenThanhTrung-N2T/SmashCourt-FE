import React from "react";
import { Input } from "@/src/shared/components/ui/Input";
import { Select } from "@/src/shared/components/ui/Select";
import { CONDITION_CONFIG } from "../../../config/conditionConfig";
import { createNumericChangeHandler } from "@/src/shared/utils/inputValidation";
import type { ConditionType } from "@/src/shared/types/promotion.types";
import type { BranchDto } from "@/src/features/branch/types/branch.types";
import type { CourtDto } from "@/src/features/court/types/court.types";

export interface ConditionInputRendererProps {
  selectedConditionType: ConditionType | "";
  conditionValue: string;
  setConditionValue: (value: string) => void;
  branches: BranchDto[];
  courts: CourtDto[];
  selectedBranchId: string;
  setSelectedBranchId: (value: string) => void;
}

/**
 * Renders the appropriate input component based on the selected condition type
 */
export function renderConditionInput({
  selectedConditionType,
  conditionValue,
  setConditionValue,
  branches,
  courts,
  selectedBranchId,
  setSelectedBranchId,
}: ConditionInputRendererProps): React.ReactElement | null {
  if (!selectedConditionType) return null;

  const config = CONDITION_CONFIG[selectedConditionType];

  switch (config.inputType) {
    case "number":
      return (
        <Input
          type="text"
          inputMode="decimal"
          value={conditionValue}
          onChange={createNumericChangeHandler(setConditionValue, { min: 0, allowDecimal: true })}
          placeholder={config.placeholder}
          rightIcon={config.unit ? <span className="text-sm font-bold text-slate-400">{config.unit}</span> : undefined}
          className="[&_input]:[-moz-appearance:textfield] [&_input]:[&::-webkit-outer-spin-button]:appearance-none [&_input]:[&::-webkit-inner-spin-button]:appearance-none"
        />
      );

    case "select":
      return (
        <Select
          value={conditionValue}
          onChange={setConditionValue}
          placeholder="Chọn giá trị"
        >
          {config.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </Select>
      );

    case "time":
      return (
        <Input
          type="time"
          value={conditionValue}
          onChange={(e) => setConditionValue(e.target.value)}
          placeholder={config.placeholder}
        />
      );

    case "branch-select":
      return (
        <Select
          value={conditionValue}
          onChange={setConditionValue}
          placeholder="Chọn chi nhánh"
        >
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </Select>
      );

    case "court-select":
      return (
        <div className="space-y-2">
          <Select
            value={selectedBranchId}
            onChange={setSelectedBranchId}
            placeholder="Chọn chi nhánh trước"
          >
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </Select>
          {selectedBranchId && (
            <Select
              value={conditionValue}
              onChange={setConditionValue}
              placeholder="Chọn sân"
            >
              {courts.map((court) => (
                <option key={court.id} value={court.id}>
                  {court.name}
                </option>
              ))}
            </Select>
          )}
        </div>
      );

    case "multi-number":
    case "text":
      return (
        <Input
          type="text"
          value={conditionValue}
          onChange={(e) => setConditionValue(e.target.value)}
          placeholder={config.placeholder}
        />
      );

    default:
      return null;
  }
}
