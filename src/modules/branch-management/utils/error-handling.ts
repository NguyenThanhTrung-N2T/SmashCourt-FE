// Error handling utilities for branch management

const ERROR_CODES: Record<string, string> = {
  // Branch Management
  BRANCH_NOT_FOUND: 'Chi nhánh không tồn tại',
  MANAGER_NOT_FOUND: 'Chi nhánh hiện tại không có quản lý',
  MANAGER_ALREADY_EXISTS: 'Người dùng đã là quản lý của chi nhánh khác',
  INVALID_MANAGER_USER: 'Người dùng không đủ điều kiện làm quản lý',
  STAFF_NOT_FOUND: 'Nhân viên không được tìm thấy trong chi nhánh này',
  STAFF_ALREADY_EXISTS: 'Người dùng đã được gán vào chi nhánh này',
  INVALID_STAFF_USER: 'Người dùng không đủ điều kiện làm nhân viên',

  // User Management
  USER_NOT_FOUND: 'Người dùng không tồn tại',
  USER_SEARCH_INVALID_CRITERIA: 'Tiêu chí tìm kiếm không hợp lệ',

  // Validation
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
  INSUFFICIENT_PERMISSIONS: 'Không đủ quyền thực hiện thao tác này',

  // Business Rules
  INVALID_BUSINESS_HOURS: 'Giờ đóng cửa phải sau giờ mở cửa',
  BRANCH_HAS_DEPENDENCIES: 'Không thể xóa chi nhánh có booking hoặc nhân viên đang hoạt động'
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
