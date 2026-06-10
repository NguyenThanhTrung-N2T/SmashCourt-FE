/**
 * SignalR DTO Type Definitions
 * Đồng bộ với Backend DTOs:
 * - BookingNotificationDto.cs
 * - PaymentNotificationDto.cs
 */

/**
 * Booking Notification Payload
 * 
 * Backend: SmashCourt-BE/DTOs/SignalR/BookingNotificationDto.cs
 */
export interface BookingNotificationDto {
  bookingId: string;
  customerId: string;
  customerName: string;
  branchId: string;
  branchName: string;
  status: string;
  message: string;
  timestamp: string; // ISO 8601 datetime string
}

/**
 * Payment Notification Payload
 * 
 * Backend: SmashCourt-BE/DTOs/SignalR/PaymentNotificationDto.cs
 */
export interface PaymentNotificationDto {
  bookingId: string;
  invoiceId: string;
  amount: number;
  status: string;
  message: string;
  timestamp: string; // ISO 8601 datetime string
}

/**
 * Union type of all SignalR notification payloads
 */
export type SignalRNotification = BookingNotificationDto | PaymentNotificationDto;
