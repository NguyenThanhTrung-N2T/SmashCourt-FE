// Validation utilities for branch management

export function validateTimeRange(openTime: string, closeTime: string): boolean {
  // Parse time strings in format "HH:mm:ss" or "HH:mm"
  const parseTime = (time: string): number => {
    const parts = time.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    return hours * 60 + minutes;
  };

  const openMinutes = parseTime(openTime);
  const closeMinutes = parseTime(closeTime);

  return closeMinutes > openMinutes;
}

export function validateRequired(value: string | undefined | null): boolean {
  return !!value && value.trim().length > 0;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  // Vietnamese phone number format
  const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateBranchForm(data: {
  name: string;
  address: string;
  openTime: string;
  closeTime: string;
  phone?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!validateRequired(data.name)) {
    errors.push({ field: 'name', message: 'Tên chi nhánh là bắt buộc' });
  }

  if (!validateRequired(data.address)) {
    errors.push({ field: 'address', message: 'Địa chỉ là bắt buộc' });
  }

  if (!validateRequired(data.openTime)) {
    errors.push({ field: 'openTime', message: 'Giờ mở cửa là bắt buộc' });
  }

  if (!validateRequired(data.closeTime)) {
    errors.push({ field: 'closeTime', message: 'Giờ đóng cửa là bắt buộc' });
  }

  if (data.openTime && data.closeTime && !validateTimeRange(data.openTime, data.closeTime)) {
    errors.push({ field: 'closeTime', message: 'Giờ đóng cửa phải sau giờ mở cửa' });
  }

  if (data.phone && !validatePhone(data.phone)) {
    errors.push({ field: 'phone', message: 'Số điện thoại không hợp lệ' });
  }

  return errors;
}
