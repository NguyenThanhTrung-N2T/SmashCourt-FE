'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface BookingInfo {
  bookingId: string;
  branchName: string;
  courtNames: string[];
  bookingDate: string;
  startTime: string;
  endTime: string;
  refundAmount: number;
  refundPercent: number;
  status: string;
}

function CancelBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5179';

  // Bước 1: Load thông tin booking
  useEffect(() => {
    if (!token) {
      setError('Link không hợp lệ');
      setLoading(false);
      return;
    }

    const fetchBookingInfo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/bookings/cancel/${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Có lỗi xảy ra');
        }

        setBookingInfo(data.data);
      } catch (err: any) {
        setError(err.message || 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingInfo();
  }, [token, API_BASE_URL]);

  // Bước 2: Xử lý hủy booking
  const handleCancelBooking = async () => {
    setCancelling(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/cancel/${token}`, {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Không thể hủy đặt sân');
      }

      setCancelled(true);
      setShowConfirmModal(false);
    } catch (err: any) {
      setError(err.message || 'Không thể hủy đặt sân');
      setShowConfirmModal(false);
    } finally {
      setCancelling(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Không Thể Hủy Đặt Sân</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="bg-gray-50 p-4 rounded mb-6">
              <p className="font-semibold mb-2">Vui lòng liên hệ:</p>
              <p className="text-sm">📞 Hotline: 1900-xxxx</p>
              <p className="text-sm">📧 Email: support@smashcourt.com</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="w-full px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (cancelled && bookingInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Hủy Đặt Sân Thành Công</h2>
            <p className="text-gray-600 mb-4">Đơn đặt sân của bạn đã được hủy</p>

            {bookingInfo.refundAmount > 0 ? (
              <>
                <div className="bg-green-50 p-4 rounded mb-4">
                  <p className="text-lg font-semibold text-green-700">
                    💰 Số tiền hoàn: {bookingInfo.refundAmount.toLocaleString('vi-VN')} VNĐ
                  </p>
                  <p className="text-sm text-gray-600 mt-2">📧 Email xác nhận đã được gửi</p>
                </div>
                <div className="bg-blue-50 p-4 rounded mb-6 border-l-4 border-blue-500">
                  <p className="text-sm text-blue-900 font-semibold mb-1">📍 Cách nhận tiền hoàn:</p>
                  <p className="text-sm text-blue-800">
                    Vui lòng đến <strong>{bookingInfo.branchName}</strong> để nhận tiền mặt hoàn lại.
                  </p>
                  <p className="text-xs text-blue-700 mt-2">
                    💡 Mang theo CMND/CCCD để xác nhận danh tính
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-yellow-50 p-4 rounded mb-4">
                <p className="text-yellow-700">⚠️ Đơn này không được hoàn tiền do hủy quá gần giờ chơi</p>
              </div>
            )}

            <button
              onClick={() => router.push('/')}
              className="w-full px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation page
  if (!bookingInfo) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">🏸 Xác Nhận Hủy Đặt Sân</h2>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Chi nhánh:</span>
            <span className="text-gray-900">{bookingInfo.branchName}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Sân:</span>
            <span className="text-gray-900">{bookingInfo.courtNames.join(', ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Ngày:</span>
            <span className="text-gray-900">
              {new Date(bookingInfo.bookingDate).toLocaleDateString('vi-VN')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Giờ:</span>
            <span className="text-gray-900">
              {bookingInfo.startTime} - {bookingInfo.endTime}
            </span>
          </div>
        </div>

        <div
          className={`p-4 rounded mb-6 ${
            bookingInfo.refundAmount > 0 ? 'bg-green-50' : 'bg-yellow-50'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-700">💰 Số tiền hoàn lại:</span>
            <span className="text-lg font-bold text-gray-900">
              {bookingInfo.refundAmount.toLocaleString('vi-VN')} VNĐ
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">📊 Tỷ lệ hoàn:</span>
            <span className="text-gray-900">{bookingInfo.refundPercent}%</span>
          </div>

          {bookingInfo.refundAmount === 0 && (
            <p className="text-yellow-700 text-sm mt-2">
              ⚠️ Đơn này không được hoàn tiền do hủy quá gần giờ chơi
            </p>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded mb-6">
          <p className="font-semibold mb-2 text-gray-700">⚠️ Lưu ý:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            {bookingInfo.refundAmount > 0 && (
              <>
                <li>• Nhận tiền mặt tại <strong>{bookingInfo.branchName}</strong></li>
                <li>• Mang theo CMND/CCCD để xác nhận</li>
              </>
            )}
            <li>• Sau khi hủy không thể khôi phục</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition text-gray-700"
          >
            Quay lại
          </button>
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={cancelling}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition"
          >
            {cancelling ? 'Đang xử lý...' : '❌ Xác nhận hủy'}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Xác nhận hủy đặt sân</h3>
            <p className="mb-4 text-gray-600">Bạn có chắc chắn muốn hủy đặt sân này?</p>
            <p className="text-sm text-gray-500 mb-6">Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition text-gray-700"
              >
                Không
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition"
              >
                {cancelling ? 'Đang xử lý...' : 'Có, hủy đặt sân'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CancelBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      }
    >
      <CancelBookingContent />
    </Suspense>
  );
}
