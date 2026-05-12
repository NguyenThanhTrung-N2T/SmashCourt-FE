import {
  CalendarBlank,
  ClockCounterClockwise,
  User,
  Gear,
} from "@phosphor-icons/react";
import { NavItem } from "@/src/shared/types/navigation.types";

export const CUSTOMER_NAV: NavItem[] = [
  {
    label: "Đặt sân mới",
    href: "/bookings/new",
    icon: CalendarBlank,
    hint: "Tạo đặt sân mới",
    exact: false,
  },
  {
    label: "Lịch sử đặt sân",
    href: "/bookings",
    icon: ClockCounterClockwise,
    hint: "Xem lịch sử đặt sân",
    exact: false,
  },
  {
    label: "Thông tin cá nhân",
    href: "/profile",
    icon: User,
    hint: "Quản lý hồ sơ",
    exact: false,
  },
  {
    label: "Cài đặt",
    href: "/settings",
    icon: Gear,
    hint: "Cài đặt tài khoản",
    exact: false,
  },
];
