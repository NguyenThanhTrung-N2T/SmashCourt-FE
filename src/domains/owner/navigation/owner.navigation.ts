import { NavItem } from "@/src/shared/types/navigation.types";
import {
  ChartBar,
  Buildings,
  Users,
  User,
  CourtBasketball,
  SquaresFour,
  Gift,
  ShieldCheck,
  Gear,
  Coffee,
  CalendarDots,
  CreditCard,
  Tag,
} from "@phosphor-icons/react";

export const OWNER_NAV: NavItem[] = [
    {
        label: "Tổng quan",
        href: "/owner",
        icon: ChartBar,
        hint: "KPI & Báo cáo",
        exact: true,
    },
    {
        label: "Chi nhánh",
        href: "/owner/branches",
        icon: Buildings,
        hint: "Điều phối các cơ sở",
    },
    {
        label: "Bookings",
        href: "/owner/bookings",
        icon: CalendarDots,
        hint: "Đơn đặt sân & lịch sử",
    },
    {
        label: "Thanh toán",
        href: "/owner/payments",
        icon: CreditCard,
        hint: "Quản lý giao dịch",
    },
    {
        label: "Bảng giá",
        href: "/owner/pricing",
        icon: Tag,
        hint: "Cấu hình giá theo khung giờ",
    },
    {
        label: "Sân",
        href: "/owner/courts",
        icon: SquaresFour,
        hint: "Quản lý sân thi đấu",
    },
    {
        label: "Khách hàng",
        href: "/owner/customers",
        icon: User,
        hint: "Hồ sơ & lịch sử khách hàng",
    },
    {
        label: "Nhân sự",
        href: "/owner/staff",
        icon: Users,
        hint: "Manager & Staff",
    },
    {
        label: "Dịch vụ",
        href: "/owner/services",
        icon: Coffee,
        hint: "Quản lý nước & thuê đồ",
    },
    {
        label: "Loại sân",
        href: "/owner/court-types",
        icon: CourtBasketball,
        hint: "Quản lý các loại sân",
    },
    {
        label: "Ưu đãi",
        href: "/owner/benefits",
        icon: Gift,
        hint: "Hạng thành viên & Khuyến mãi",
    },
    {
        label: "Chính sách",
        href: "/owner/policy",
        icon: ShieldCheck,
        hint: "Chính sách hủy & hoàn tiền",
    },
    {
        label: "Cài đặt",
        href: "/owner/settings",
        icon: Gear,
        hint: "Cấu hình hệ thống",
    },
];