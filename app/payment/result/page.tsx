'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface PaymentResult {
  isSuccess: boolean;
  message: string;
  bookingId?: string;
  transactionRef?: string;
  amount?: number;
  responseCode?: string;
}

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        // 1. Parse tất cả query params từ VNPay
        const queryParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          queryParams[key] = value;
        });

        console.log('🔍 Query params từ VNPay:', queryParams);

        // 2. Gọi backend qua ngrok để confirm payment
        console.log('📡 Đang gọi API confirm...');
        const response = await fetch(
          'https://undelineative-nodous-sasha.ngrok-free.dev/api/payments/vnpay/confirm',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ queryParams })
          }
        );

        console.log('📥 Response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Response data:', data);

        // 3. Lưu kết quả
        setResult(data.data);
      } catch (err: any) {
        console.error('❌ Payment confirmation error:', err);
        setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xác nhận thanh toán');
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [searchParams]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang xác nhận thanh toán</h2>
            <p className="text-gray-600">Vui lòng đợi trong giây lát...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-500 to-pink-600 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-7xl mb-6 animate-bounce">❌</div>
            <h1 className="text-3xl font-bold text-red-600 mb-4">Có lỗi xảy ra</h1>
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success/Failure result
  const isSuccess = result?.isSuccess ?? false;
  const bgGradient = isSuccess 
    ? 'from-green-500 to-emerald-600' 
    : 'from-red-500 to-pink-600';

  return (
    <div className={`flex items-center justify-center min-h-screen bg-gradient-to-br ${bgGradient} p-4`}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full animate-fade-in">
        <div className="text-center">
          {/* Icon */}
          <div className="text-8xl mb-6 animate-bounce">
            {isSuccess ? '✅' : '❌'}
          </div>

          {/* Title */}
          <h1 className={`text-3xl font-bold mb-3 ${
            isSuccess ? 'text-green-600' : 'text-red-600'
          }`}>
            {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-8 text-lg">{result?.message}</p>

          {/* Details */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left space-y-4">
            {result?.bookingId && (
              <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                <span className="text-gray-600 font-medium">Mã đơn:</span>
                <span className="font-mono text-xs text-gray-800 font-semibold break-all text-right ml-4">
                  {result.bookingId}
                </span>
              </div>
            )}
            {result?.amount && (
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <span className="text-gray-600 font-medium">Số tiền:</span>
                <span className={`text-2xl font-bold ${
                  isSuccess ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.amount.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
            )}
            {result?.transactionRef && (
              <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                <span className="text-gray-600 font-medium">Mã giao dịch:</span>
                <span className="font-mono text-sm text-gray-800 font-semibold break-all text-right ml-4">
                  {result.transactionRef}
                </span>
              </div>
            )}
            {result?.responseCode && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Mã phản hồi:</span>
                <span className="font-mono text-sm text-gray-800 font-semibold">
                  {result.responseCode}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {isSuccess && result?.bookingId && (
              <button
                onClick={() => router.push(`/customer/bookings/${result.bookingId}`)}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Xem chi tiết đơn đặt sân
              </button>
            )}
            <button
              onClick={() => router.push('/')}
              className="w-full px-6 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
