import { NavItem } from "@/src/shared/types/navigation.types";
import {
  ChartBar,
  CalendarDots,
  CourtBasketball,
  Gift,
  Coffee,
  Users,
  UsersThree,
  Tag,
  TrendUp,
  User,
  Gear,
  Question,
  ShieldCheck
} from "@phosphor-icons/react";

export const MANAGER_NAV: NavItem[] = [
  {
    label: "Tổng quan",
    href: "/manager",
    icon: ChartBar,
    hint: "Tổng quan chi nhánh",
    exact: true,
  },
  {
    label: "Bookings",
    href: "/manager/bookings",
    icon: CalendarDots,
    hint: "Quản lý đặt sân",
  },
  {
    label: "Sân",
    href: "/manager/courts",
    icon: CourtBasketball,
    hint: "Quản lý sân thi đấu",
  },
  {
    label: "Giá",
    href: "/manager/pricing",
    icon: Tag,
    hint: "Giá đặt sân",
  },
  {
    label: "Dịch vụ",
    href: "/manager/services",
    icon: Coffee,
    hint: "Dịch vụ & mặt hàng",
  },
  {
    label: "Loại sân",
    href: "/manager/court-types",
    icon: CourtBasketball,
    hint: "Loại sân tại chi nhánh",
  },
  {
    label: "Khách hàng",
    href: "/manager/customers",
    icon: Users,
    hint: "Khách hàng",
  },
  {
    label: "Nhân viên",
    href: "/manager/staff",
    icon: UsersThree,
    hint: "Nhân viên chi nhánh",
  },
  {
    label: "Ưu đãi",
    href: "/manager/benefits",
    icon: Gift,
    hint: "Hạng thành viên & Khuyến mãi",
  },
  {
    label: "Chính sách",
    href: "/manager/policy",
    icon: ShieldCheck,
    hint: "Chính sách hủy & hoàn tiền",
  },
  {
    label: "Báo cáo",
    href: "/manager/reports",
    icon: TrendUp,
    hint: "Báo cáo doanh thu",
  },
  {
    label: "Cài đặt",
    href: "/manager/settings",
    icon: Gear,
    hint: "Cấu hình hệ thống"
  }
];

// Account menu items for user dropdown
export const MANAGER_ACCOUNT_MENU: NavItem[] = [
  {
    label: "Hồ sơ cá nhân",
    href: "/manager/profile",
    icon: User,
    hint: "Quản lý hồ sơ",
    exact: false,
  },
  {
    label: "Cài đặt",
    href: "/manager/settings",
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
