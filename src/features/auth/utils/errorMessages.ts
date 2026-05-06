/**
 * Vietnamese error message mappings for authentication errors
 * 
 * This module provides comprehensive, user-friendly Vietnamese error messages
 * for all backend authentication error codes, with context-specific variations
 * to provide relevant guidance based on the operation being performed.
 */

import type { ErrorMessageMap } from "./errorCodes";

/**
 * Vietnamese error messages for all authentication error codes
 * 
 * Each error code has:
 * - A default message used when no context-specific message exists
 * - Optional context-specific messages for different authentication operations
 * 
 * All messages follow these guidelines:
 * - Polite and professional tone
 * - Clear and actionable guidance
 * - Concise but informative
 * - Consistent terminology
 * 
 * @example
 * ```typescript
 * const message = AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS.default;
 * const loginMessage = AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS.contexts?.login;
 * ```
 */
export const AUTH_ERROR_MESSAGES: ErrorMessageMap = {
  INVALID_CREDENTIALS: {
    default: "Email hoặc mật khẩu không đúng. Vui lòng kiểm tra và thử lại.",
    contexts: {
      login: "Email hoặc mật khẩu không đúng. Vui lòng kiểm tra và thử lại.",
    },
  },

  EMAIL_NOT_VERIFIED: {
    default: "Email chưa được xác thực. Vui lòng kiểm tra hộp thư và xác thực email.",
    contexts: {
      login: "Email chưa được xác thực. Vui lòng kiểm tra hộp thư và xác thực email trước khi đăng nhập.",
      register: "Vui lòng kiểm tra email và nhập mã xác thực để hoàn tất đăng ký.",
    },
  },

  ACCOUNT_LOCKED: {
    default: "Tài khoản tạm thời bị khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.",
    contexts: {
      login: "Tài khoản tạm thời bị khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.",
    },
  },

  OTP_INVALID: {
    default: "Mã xác thực không đúng. Vui lòng kiểm tra và nhập lại.",
    contexts: {
      "verify-email": "Mã xác thực không đúng. Vui lòng kiểm tra email và nhập lại.",
      "2fa": "Mã xác thực 2FA không đúng. Vui lòng kiểm tra và nhập lại.",
      "verify-otp": "Mã OTP không đúng. Vui lòng kiểm tra email và nhập lại.",
    },
  },

  OTP_EXPIRED: {
    default: "Mã xác thực đã hết hạn. Vui lòng yêu cầu gửi lại mã mới.",
    contexts: {
      "verify-email": "Mã xác thực đã hết hạn. Vui lòng nhấn 'Gửi lại mã' để nhận mã mới.",
      "2fa": "Mã 2FA đã hết hạn. Vui lòng yêu cầu gửi lại mã mới.",
      "verify-otp": "Mã OTP đã hết hạn. Vui lòng nhấn 'Gửi lại mã' để nhận mã mới.",
    },
  },

  OTP_MAX_ATTEMPTS: {
    default: "Đã nhập sai mã quá nhiều lần. Vui lòng yêu cầu gửi lại mã mới.",
    contexts: {
      "verify-email": "Đã nhập sai mã quá nhiều lần. Vui lòng nhấn 'Gửi lại mã' để nhận mã mới.",
      "2fa": "Đã nhập sai mã 2FA quá nhiều lần. Vui lòng yêu cầu gửi lại mã mới.",
      "verify-otp": "Đã nhập sai mã quá nhiều lần. Vui lòng nhấn 'Gửi lại mã' để nhận mã mới.",
    },
  },

  OTP_LIMIT_EXCEEDED: {
    default: "Đã vượt quá giới hạn yêu cầu mã. Vui lòng thử lại sau.",
    contexts: {
      "verify-email": "Đã gửi quá nhiều yêu cầu. Vui lòng đợi một lúc rồi thử lại.",
      "verify-otp": "Đã gửi quá nhiều yêu cầu. Vui lòng đợi một lúc rồi thử lại.",
    },
  },

  TOKEN_EXPIRED: {
    default: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    contexts: {
      refresh: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      "reset-password": "Liên kết đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu lại.",
    },
  },

  TOKEN_INVALID: {
    default: "Phiên không hợp lệ. Vui lòng thực hiện lại từ đầu.",
    contexts: {
      "2fa": "Phiên xác thực không hợp lệ. Vui lòng đăng nhập lại.",
      "verify-otp": "Phiên xác thực không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu lại.",
      "reset-password": "Liên kết đặt lại mật khẩu không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu lại.",
    },
  },

  INVALID_TOKEN: {
    default: "Token không hợp lệ hoặc đã bị thu hồi. Vui lòng đăng nhập lại.",
    contexts: {
      refresh: "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
    },
  },

  UNAUTHORIZED: {
    default: "Bạn cần đăng nhập để tiếp tục.",
    contexts: {
      login: "Email hoặc mật khẩu không đúng. Vui lòng kiểm tra và thử lại.",
      generic: "Bạn cần đăng nhập để truy cập tính năng này.",
    },
  },

  FORBIDDEN: {
    default: "Bạn không có quyền thực hiện thao tác này.",
    contexts: {
      login: "Vui lòng xác thực email trước khi đăng nhập.",
      generic: "Bạn không có quyền truy cập tính năng này.",
    },
  },

  NOT_FOUND: {
    default: "Không tìm thấy thông tin. Vui lòng kiểm tra và thử lại.",
    contexts: {
      login: "Không tìm thấy tài khoản với email này.",
      "verify-email": "Không tìm thấy yêu cầu xác thực. Vui lòng đăng ký lại.",
      "verify-otp": "Không tìm thấy yêu cầu đặt lại mật khẩu. Vui lòng thử lại.",
    },
  },

  CONFLICT: {
    default: "Dữ liệu đã tồn tại. Vui lòng kiểm tra và thử lại.",
    contexts: {
      register: "Email này đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác.",
      oauth: "Email này đã được đăng ký bằng phương thức khác. Vui lòng đăng nhập bằng email/mật khẩu.",
    },
  },

  BAD_REQUEST: {
    default: "Yêu cầu không hợp lệ. Vui lòng kiểm tra thông tin và thử lại.",
    contexts: {
      register: "Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra và thử lại.",
      login: "Thông tin đăng nhập không hợp lệ. Vui lòng kiểm tra và thử lại.",
    },
  },

  INTERNAL_ERROR: {
    default: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
    contexts: {
      generic: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.",
    },
  },

  EMAIL_EXISTS: {
    default: "Email đã được sử dụng",
    contexts: {
      register: "Email này đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác.",
    },
  },

  VALIDATION_ERROR: {
    default: "Thông tin không hợp lệ. Vui lòng kiểm tra và thử lại.",
    contexts: {
      register: "Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra các trường.",
      login: "Thông tin đăng nhập không hợp lệ. Vui lòng kiểm tra và thử lại.",
    },
  },

  RESOURCE_IN_USE: {
    default: "Tài nguyên đang được sử dụng. Không thể thực hiện thao tác này.",
    contexts: {
      generic: "Không thể xóa vì đang được sử dụng.",
    },
  },

  NAME_DUPLICATE: {
    default: "Tên đã tồn tại. Vui lòng sử dụng tên khác.",
    contexts: {
      generic: "Tên này đã được sử dụng. Vui lòng chọn tên khác.",
    },
  },
};

/**
 * Generic fallback messages (backward compatible with existing AUTH_GENERIC)
 * 
 * These messages are used when:
 * - No specific error code is available
 * - Server returns 5xx errors
 * - Generic error scenarios occur
 * 
 * @example
 * ```typescript
 * const message = AUTH_GENERIC_MESSAGES.clientError;
 * ```
 */
export const AUTH_GENERIC_MESSAGES = {
  clientError: "Yêu cầu không hợp lệ. Vui lòng thử lại.",
  serverError: "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.",
  verifyFailed: "Không thể xác thực. Vui lòng kiểm tra mã và thử lại.",
  resendFailed: "Không thể gửi lại mã. Vui lòng thử lại sau.",
  resendOtpSuccess: "Đã gửi lại mã xác thực. Vui lòng kiểm tra email của bạn.",
  sessionInvalid: "Phiên không hợp lệ. Vui lòng thực hiện lại từ đầu.",
  twoFaFailed: "Không thể xác thực. Vui lòng thử lại.",
} as const;
