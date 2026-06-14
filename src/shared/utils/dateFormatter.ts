/**
 * Date Formatting Utilities
 * 
 * Utility functions for formatting dates consistently across the application.
 */

/**
 * Format a date string to Vietnamese locale format (DD/MM/YYYY)
 * Handles various input formats and returns a safe fallback if parsing fails
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";
  
  try {
    // Try parsing as ISO date first
    let date = new Date(dateStr);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      // Try parsing common formats like DD/MM/YYYY, DD-MM-YYYY, DD MM YYYY
      const match = dateStr.match(/^(\d{1,2})[\/\-\s](\d{1,2})[\/\-\s](\d{4})/);
      if (match) {
        const [ , day, month, year ] = match;
        date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
        
        if (isNaN(date.getTime())) {
          return dateStr; // Return original if still can't parse
        }
      } else {
        return dateStr; // Return original if can't parse
      }
    }
    
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", dateStr, error);
    return dateStr; // Return original string if formatting fails
  }
}

/**
 * Format a date string to Vietnamese locale format with full month name
 * Example: "Thứ Hai, 1 tháng 1, 2024"
 */
export function formatDateLong(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";
  
  try {
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) {
      return dateStr;
    }
    
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", dateStr, error);
    return dateStr;
  }
}

/**
 * Format a date string to short format (DD/MM)
 */
export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";
  
  try {
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) {
      return dateStr;
    }
    
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting date:", dateStr, error);
    return dateStr;
  }
}

/**
 * Format a date string to ISO format (YYYY-MM-DD)
 * Useful for API requests and date inputs
 */
export function formatDateISO(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  
  try {
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) {
      return "";
    }
    
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error("Error formatting date to ISO:", dateStr, error);
    return "";
  }
}

/**
 * Format a datetime string to Vietnamese locale format with time
 * Example: "01/01/2024 14:30"
 */
export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";
  
  try {
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) {
      return dateStr;
    }
    
    const dateFormatted = date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    
    const timeFormatted = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    
    return `${dateFormatted} ${timeFormatted}`;
  } catch (error) {
    console.error("Error formatting datetime:", dateStr, error);
    return dateStr;
  }
}

/**
 * Check if a date string is valid
 */
export function isValidDate(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  
  try {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}

/**
 * Get relative time string (e.g., "2 ngày trước", "3 giờ trước")
 */
export function getRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";
  
  try {
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) {
      return dateStr;
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) {
      return "Vừa xong";
    } else if (diffMins < 60) {
      return `${diffMins} phút trước`;
    } else if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return formatDate(dateStr);
    }
  } catch (error) {
    console.error("Error getting relative time:", dateStr, error);
    return dateStr;
  }
}
