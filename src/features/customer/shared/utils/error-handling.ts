// Error handling utilities for customer management

const ERROR_CODES: Record<string, string> = {
  // Generic BE ErrorCodes
  NOT_FOUND: 'Không tìm thấy dữ liệu',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn',
  CONFLICT: 'Dữ liệu vừa được cập nhật, vui lòng tải lại',
  BAD_REQUEST: 'Yêu cầu không hợp lệ',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
  ACCOUNT_LOCKED: 'Tài khoản đã bị khóa',

  // User & Customer Management
  USER_NOT_FOUND: 'Người dùng không tồn tại',
  USER_ALREADY_LOCKED: 'Tài khoản đã bị khóa',
  USER_NOT_LOCKED: 'Tài khoản không bị khóa',
  CANNOT_LOCK_SELF: 'Không thể tự khóa tài khoản của mình',

  // Deposit & Booking
  BOOKING_REJECTED: 'Rất tiếc, đơn đặt sân này không được chấp nhận',
  SLOT_UNAVAILABLE: 'Khung giờ đã có người đặt',
  SLOT_UNAVAILABLE_NOTIFY_REGISTERED: 'Khung giờ đã có người đặt, đã đăng ký thông báo khi trống',
  PAYMENT_HOLD_EXPIRED: 'Đã hết thời gian giữ chỗ hoặc không đủ thời gian thanh toán',
  BOOKING_ALREADY_STARTED: 'Đơn đã tới giờ chơi, không thể tự hủy',
  APPROVAL_EXPIRED: 'Đơn đã hết hạn duyệt',
  APPROVAL_ALREADY_RESOLVED: 'Đơn đã được xử lý trước đó',
  BOOKING_NOT_PENDING_APPROVAL: 'Đơn không còn ở trạng thái chờ duyệt',
  TADSS_UNAVAILABLE: 'Hệ thống duyệt cọc tạm thời không phản hồi',
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
