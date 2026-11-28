// Error handling utilities for branch management

const ERROR_CODES: Record<string, string> = {
  // Generic BE ErrorCodes
  NOT_FOUND: 'Không tìm thấy dữ liệu',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này',
  CONFLICT: 'Dữ liệu xung đột, vui lòng tải lại',
  BAD_REQUEST: 'Yêu cầu không hợp lệ',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',

  // Branch Management (ErrorCodes.cs)
  BRANCH_NOT_FOUND: 'Chi nhánh không tồn tại',
  MANAGER_NOT_FOUND: 'Chi nhánh hiện tại không có quản lý',
  MANAGER_ALREADY_EXISTS: 'Người dùng đã là quản lý của chi nhánh khác',
  INVALID_MANAGER_USER: 'Người dùng không đủ điều kiện làm quản lý',
  STAFF_NOT_FOUND: 'Nhân viên không được tìm thấy trong chi nhánh này',
  STAFF_ALREADY_EXISTS: 'Người dùng đã được gán vào chi nhánh này',
  INVALID_STAFF_USER: 'Người dùng không đủ điều kiện làm nhân viên',
  LAST_BRANCH_MANAGER: 'Không thể gỡ quản lý cuối cùng của chi nhánh',

  // User Management
  USER_NOT_FOUND: 'Người dùng không tồn tại',
  USER_HAS_NO_BRANCH: 'Người dùng chưa được gán chi nhánh',
};

export function handleApiError(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error && ERROR_CODES[error.code as keyof typeof ERROR_CODES]) {
    return ERROR_CODES[error.code as keyof typeof ERROR_CODES];
  }

  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return 'Đã xảy ra lỗi không xác định';
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
        const code = (error as { code: string }).code;
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
