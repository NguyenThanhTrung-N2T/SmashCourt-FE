/**
 * Custom hook for booking form validation
 */

export function useBookingValidation() {
  const validatePhone = (phone: string): string => {
    if (!phone.trim()) return "";
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    const cleanPhone = phone.trim().replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return "Số điện thoại không hợp lệ (VD: 0901234567)";
    }
    return "";
  };

  const validateEmail = (email: string): string => {
    if (!email.trim()) return "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "Email không hợp lệ";
    }
    return "";
  };

  const validateGuestInfo = (name: string, phone: string, email: string): string | null => {
    if (!name.trim() || !phone.trim() || !email.trim()) {
      return "Vui lòng nhập đầy đủ họ tên, số điện thoại và email";
    }

    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(phone.trim().replace(/\s/g, ''))) {
      return "Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (10-11 số)";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "Email không hợp lệ. Vui lòng nhập đúng định dạng email";
    }

    return null;
  };

  return {
    validatePhone,
    validateEmail,
    validateGuestInfo,
  };
}
