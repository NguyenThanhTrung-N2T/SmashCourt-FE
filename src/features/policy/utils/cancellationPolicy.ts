import type {
  CancellationPolicyTone,
  CancelPolicy,
  SaveCancelPolicyRequest,
} from "@/src/shared/types/cancel-policy.types";

export function sortCancelPolicies<T extends { hoursBefore: number }>(policies: T[]) {
  return [...policies].sort((left, right) => right.hoursBefore - left.hoursBefore);
}

export function formatPolicyThreshold(hoursBefore: number) {
  if (hoursBefore === 0) {
    return "sát giờ";
  }

  if (hoursBefore >= 24 && hoursBefore % 24 === 0) {
    const days = hoursBefore / 24;
    return days === 1 ? "1 ngày" : `${days} ngày`;
  }

  return hoursBefore === 1 ? "1 giờ" : `${hoursBefore} giờ`;
}

export function formatPolicyHours(hoursBefore: number) {
  if (hoursBefore === 0) {
    return "Sát giờ đặt sân";
  }

  if (hoursBefore >= 24 && hoursBefore % 24 === 0) {
    const days = hoursBefore / 24;
    return days === 1 ? "Trước 1 ngày" : `Trước ${days} ngày`;
  }

  return hoursBefore === 1 ? "Trước 1 giờ" : `Trước ${hoursBefore} giờ`;
}

export function formatRefundPercent(refundPercent: number) {
  const formatter = new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 2,
  });

  return `${formatter.format(refundPercent)}%`;
}

export function normalizePolicyDescription(description: string | null | undefined) {
  const nextDescription = description?.trim();
  return nextDescription && nextDescription.length > 0
    ? nextDescription
    : "Không có mô tả bổ sung cho mốc này.";
}

export function getPolicyTone(
  refundPercent: number,
  index: number,
  total: number,
): CancellationPolicyTone {
  if (refundPercent >= 80) {
    return "emerald";
  }

  if (refundPercent >= 40) {
    return "amber";
  }

  if (refundPercent > 0) {
    return "rose";
  }

  return index === total - 1 ? "slate" : "rose";
}

export function getPolicyRangeLabel(
  policies: Array<{ hoursBefore: number }>,
  index: number,
) {
  const sortedPolicies = sortCancelPolicies(policies);
  const currentPolicy = sortedPolicies[index];
  const previousPolicy = index > 0 ? sortedPolicies[index - 1] : null;

  if (!currentPolicy) {
    return "";
  }

  if (index === 0) {
    return `Từ ${formatPolicyThreshold(currentPolicy.hoursBefore)} trở lên`;
  }

  if (currentPolicy.hoursBefore === 0 && previousPolicy) {
    return `Dưới ${formatPolicyThreshold(previousPolicy.hoursBefore)}`;
  }

  if (!previousPolicy) {
    return formatPolicyHours(currentPolicy.hoursBefore);
  }

  return `Từ ${formatPolicyThreshold(currentPolicy.hoursBefore)} đến dưới ${formatPolicyThreshold(previousPolicy.hoursBefore)}`;
}

export function getPolicyRangeDescription(
  policies: Array<{ hoursBefore: number }>,
  index: number,
) {
  const sortedPolicies = sortCancelPolicies(policies);
  const currentPolicy = sortedPolicies[index];
  const previousPolicy = index > 0 ? sortedPolicies[index - 1] : null;

  if (!currentPolicy) {
    return "";
  }

  if (index === 0) {
    return `Áp dụng khi khách hủy từ ${formatPolicyThreshold(currentPolicy.hoursBefore)} trước giờ đặt sân trở lên.`;
  }

  if (currentPolicy.hoursBefore === 0 && previousPolicy) {
    return `Áp dụng khi khách hủy dưới ${formatPolicyThreshold(previousPolicy.hoursBefore)} trước giờ đặt sân hoặc không đến sân đúng lịch.`;
  }

  if (!previousPolicy) {
    return `Áp dụng khi khách hủy ${formatPolicyHours(currentPolicy.hoursBefore).toLowerCase()}.`;
  }

  return `Áp dụng khi khách hủy từ ${formatPolicyThreshold(currentPolicy.hoursBefore)} đến dưới ${formatPolicyThreshold(previousPolicy.hoursBefore)} trước giờ đặt sân.`;
}
