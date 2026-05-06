"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  XCircle,
  Funnel,
  MagnifyingGlass,
  CaretRight,
  ArrowLeft,
} from "@phosphor-icons/react";

type BookingStatus = "completed" | "upcoming" | "cancelled";

type Booking = {
  id: string;
  courtName: string;
  branch: string;
  date: string;
  timeSlot: string;
  status: BookingStatus;
  price: number;
  duration: number;
};

const MOCK_BOOKINGS: Booking[] = [
  {
    id: "BK001",
    courtName: "Sân 1",
    branch: "CS Tân Bình",
    date: "2024-03-20",
    timeSlot: "18:00 - 19:30",
    status: "upcoming",
    price: 150000,
    duration: 90,
  },
  {
    id: "BK002",
    courtName: "Sân 2, Sân 3",
    branch: "CS Gò Vấp",
    date: "2024-03-15",
    timeSlot: "06:00 - 07:30",
    status: "completed",
    price: 280000,
    duration: 90,
  },
  {
    id: "BK003",
    courtName: "Sân 1",
    branch: "CS Quận 7",
    date: "2024-03-10",
    timeSlot: "19:00 - 20:00",
    status: "cancelled",
    price: 120000,
    duration: 60,
  },
];

export default function BookingHistory() {
  const router = useRouter();
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBookings = MOCK_BOOKINGS.filter((booking) => {
    const matchesFilter = filter === "all" || booking.status === filter;
    const matchesSearch =
      booking.courtName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.branch.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusConfig = (status: BookingStatus) => {
    switch (status) {
      case "completed":
        return {
          label: "Đã hoàn thành",
          color: "text-emerald-700 bg-emerald-50 border-emerald-200",
          icon: CheckCircle,
        };
      case "upcoming":
        return {
          label: "Sắp tới",
          color: "text-blue-700 bg-blue-50 border-blue-200",
          icon: Clock,
        };
      case "cancelled":
        return {
          label: "Đã hủy",
          color: "text-red-700 bg-red-50 border-red-200",
          icon: XCircle,
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/40 py-8">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8">
          <button
            onClick={() => router.push("/")}
            className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-x-1 hover:border-emerald-500 hover:text-emerald-600"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại trang chủ
          </button>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-emerald-700 bg-clip-text text-transparent">
            Lịch sử đặt sân
          </h1>
          <p className="mt-2 text-slate-600">
            Quản lý và theo dõi tất cả các lượt đặt sân của bạn
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo sân hoặc chi nhánh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full rounded-2xl border-2 border-slate-200 bg-white pl-12 pr-4 text-sm font-medium outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                filter === "all"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                filter === "upcoming"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Sắp tới
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                filter === "completed"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Hoàn thành
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const statusConfig = getStatusConfig(booking.status);
            const StatusIcon = statusConfig.icon;

            return (
              <article
                key={booking.id}
                className="group relative overflow-hidden rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-lg transition-all hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-500">
                        #{booking.id}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusConfig.color}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {statusConfig.label}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900">
                      {booking.courtName}
                    </h3>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        {booking.branch}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        {new Date(booking.date).toLocaleDateString("vi-VN")}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-amber-600" />
                        {booking.timeSlot}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-slate-900">
                        {booking.price.toLocaleString("vi-VN")}đ
                      </p>
                      <p className="text-xs text-slate-500">
                        {booking.duration} phút
                      </p>
                    </div>

                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all hover:bg-emerald-500 hover:text-white">
                      <CaretRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filteredBookings.length === 0 && (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
            <Funnel className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-lg font-semibold text-slate-600">
              Không tìm thấy lịch sử đặt sân
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
