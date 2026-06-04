import { NavItem } from "@/src/shared/types/navigation.types";
import {
    ChartBar,
    Buildings,
    Users,
    User,
    CourtBasketball,
    UsersThree,
    Gift,
    ShieldCheck,
    Gear,
    Coffee,
    CalendarDots,
    SpeedometerIcon,
    Tag,
    Question,
} from "@phosphor-icons/react";

export const OWNER_NAV: NavItem[] = [
    {
        label: "Tổng quan",
        href: "/owner",
        icon: SpeedometerIcon,
        hint: "KPI & Báo cáo",
        exact: true,
    },
    {
        label: "Báo cáo",
        href: "/owner/reports",
        icon: ChartBar,
        hint: "Báo cáo chi tiết",
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
        label: "Bảng giá",
        href: "/owner/pricing",
        icon: Tag,
        hint: "Cấu hình giá theo khung giờ",
    },
    {
        label: "Khách hàng",
        href: "/owner/customers",
        icon: Users,
        hint: "Hồ sơ & lịch sử khách hàng",
    },
    {
        label: "Nhân sự",
        href: "/owner/staff",
        icon: UsersThree,
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

// Account menu items for user dropdown
export const OWNER_ACCOUNT_MENU: NavItem[] = [
    {
        label: "Hồ sơ cá nhân",
        href: "/owner/profile",
        icon: User,
        hint: "Quản lý hồ sơ",
        exact: false,
    },
    {
        label: "Cài đặt",
        href: "/owner/settings",
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