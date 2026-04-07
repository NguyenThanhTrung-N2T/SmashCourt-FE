import { NavItem } from "@/src/shared/types/navigation.types";
import { BarChart2, Building2, Users, Grid3x3, Gift, ShieldCheck, Settings, Coffee } from "lucide-react";

export const OWNER_NAV: NavItem[] = [
    {
        label: "Tổng quan",
        href: "/owner",
        icon: BarChart2,
        hint: "KPI & Báo cáo",
        exact: true,
    },
    {
        label: "Chi nhánh",
        href: "/owner/branches",
        icon: Building2,
        hint: "Điều phối các cơ sở",
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
        icon: Grid3x3,
        hint: "Quản lý các loại sân",
    },
    {
        label: "Ưu đãi",
        href: "/owner/benefits",
        icon: Gift,
        hint: "Loyalty & Khuyến mãi",
    },
    {
        label: "Chính sách",
        href: "/owner/policy",
        icon: ShieldCheck,
        hint: "Quản lý chính sách hủy & hoàn tiền",
    },
    {
        label: "Cài đặt",
        href: "/owner/settings",
        icon: Settings,
        hint: "Cấu hình hệ thống",
    },
];