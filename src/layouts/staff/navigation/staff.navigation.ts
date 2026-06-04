import { NavItem } from "@/src/shared/types/navigation.types";
import {
    ChartBar,
    CalendarDots,
    CourtBasketball,
    Coffee,
    Users,
    ShieldCheck,
    Tag,
    Gift,
    User,
    Gear,
    Question
} from "@phosphor-icons/react";

export const STAFF_NAV: NavItem[] = [
    {
        label: "Tổng quan",
        href: "/staff",
        icon: ChartBar,
        hint: "Tổng quan chi nhánh",
        exact: true,
    },
    {
        label: "Bookings",
        href: "/staff/bookings",
        icon: CalendarDots,
        hint: "Quản lý đặt sân",
    },
    {
        label: "Sân",
        href: "/staff/courts",
        icon: CourtBasketball,
        hint: "Quản lý sân thi đấu",
    },
    {
        label: "Giá",
        href: "/staff/pricing",
        icon: Tag,
        hint: "Giá đặt sân",
    },
    {
        label: "Dịch vụ",
        href: "/staff/services",
        icon: Coffee,
        hint: "Dịch vụ & mặt hàng",
    },
    {
        label: "Loại sân",
        href: "/staff/court-types",
        icon: CourtBasketball,
        hint: "Loại sân tại chi nhánh",
    },
    {
        label: "Khách hàng",
        href: "/staff/customers",
        icon: Users,
        hint: "Khách hàng",
    },
    {
        label: "Ưu đãi",
        href: "/staff/benefits",
        icon: Gift,
        hint: "Hạng thành viên & Khuyến mãi",
    },
    {
        label: "Chính sách",
        href: "/staff/policy",
        icon: ShieldCheck,
        hint: "Chính sách hủy & hoàn tiền",
    },
    {
        label: "Cài đặt",
        href: "/staff/settings",
        icon: Gear,
        hint: "Cấu hình hệ thống"
    }
];

// Account menu items for user dropdown
export const STAFF_ACCOUNT_MENU: NavItem[] = [
    {
        label: "Hồ sơ cá nhân",
        href: "/staff/profile",
        icon: User,
        hint: "Quản lý hồ sơ",
        exact: false,
    },
    {
        label: "Cài đặt",
        href: "/staff/settings",
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
