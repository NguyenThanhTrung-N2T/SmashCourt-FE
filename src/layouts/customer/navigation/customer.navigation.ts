import {
  CalendarPlus,
  ClockCounterClockwise,
  Medal,
  User,
  Gear,
  Question,
  Tag,
} from "@phosphor-icons/react";
import { NavItem } from "@/src/shared/types/navigation.types";

// Primary navigation items for top navigation bar (max 4 items)
export const CUSTOMER_TOP_NAV: NavItem[] = [
  {
    label: "Đặt sân",
    href: "/bookings/new",
    icon: CalendarPlus,
    hint: "Tạo đặt sân mới",
    exact: false,
  },
  {
    label: "Lịch sử",
    href: "/bookings",
    icon: ClockCounterClockwise,
    hint: "Xem lịch sử đặt sân",
    exact: false,
  },
  {
    label: "Khuyến mãi",
    href: "/promotions",
    icon: Tag,
    hint: "Xem mã khuyến mãi",
    exact: false,
  },
  {
    label: "Điểm thưởng",
    href: "/loyalty",
    icon: Medal,
    hint: "Xem điểm thưởng và hạng thành viên",
    exact: false,
  },
];

// Account menu items for user dropdown (moved from primary nav)
export const CUSTOMER_ACCOUNT_MENU: NavItem[] = [
  {
    label: "Hồ sơ cá nhân",
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
  {
    label: "Trợ giúp",
    href: "/help",
    icon: Question,
    hint: "Trợ giúp và hỗ trợ",
    exact: false,
  },
];
