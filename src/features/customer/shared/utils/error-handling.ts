// Error handling utilities for customer management

const ERROR_CODES: Record<string, string> = {
  // Customer Management
  CUSTOMER_NOT_FOUND: 'Khách hàng không tồn tại',
  CUSTOMER_ALREADY_LOCKED: 'Khách hàng đã bị khóa',
  CUSTOMER_NOT_LOCKED: 'Khách hàng không bị khóa',
  CANNOT_LOCK_CUSTOMER: 'Không thể khóa khách hàng này',
  
  // Booking
  BOOKING_NOT_FOUND: 'Booking không tồn tại',
  NO_BOOKINGS_FOUND: 'Không tìm thấy booking nào',
  
  // Loyalty
  LOYALTY_TRANSACTION_NOT_FOUND: 'Giao dịch điểm thưởng không tồn tại',
  INSUFFICIENT_LOYALTY_POINTS: 'Không đủ điểm thưởng',
  
  // Branch
  BRANCH_NOT_FOUND: 'Chi nhánh không tồn tại',
  
  // Validation
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
  INSUFFICIENT_PERMISSIONS: 'Không đủ quyền thực hiện thao tác này',
  INVALID_DATE_RANGE: 'Khoảng thời gian không hợp lệ',
  INVALID_STATUS: 'Trạng thái không hợp lệ',
};

export function handleApiError(error: any): string {
  if (error.code && ERROR_CODES[error.code as keyof typeof ERROR_CODES]) {
    return ERROR_CODES[error.code as keyof typeof ERROR_CODES];
  }

  return error.message || 'Đã xảy ra lỗi không xác định';
}

export function handleValidationErrors(errors?: Record<string, string[]>): void {
  if (!errors) return;

  Object.entries(errors).forEach(([field, messages]) => {
    console.error(`${field}: ${messages.join(', ')}`);
  });
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on validation errors or client errors
      if (error && typeof error === 'object' && 'code' in error) {
        const code = (error as any).code;
        if (code === 'VALIDATION_ERROR' || code === 'INSUFFICIENT_PERMISSIONS') {
          throw error;
        }
      }

      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError || new Error('Operation failed after retries');
}
