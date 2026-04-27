import { NavItem } from "@/src/shared/types/navigation.types";
import {
  ChartBar,
  CalendarDots,
  GridFour,
  SquaresFour,
  Coffee,
  Users,
  UsersThree,
  FileText,
  TrendUp,
  UserCircle,
} from "@phosphor-icons/react";

export const MANAGER_NAV: NavItem[] = [
  {
    label: "Dashboard",
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
    label: "Time Grid",
    href: "/manager/time-grid",
    icon: SquaresFour,
    hint: "Lịch sân theo giờ",
  },
  {
    label: "Courts",
    href: "/manager/courts",
    icon: GridFour,
    hint: "Quản lý sân thi đấu",
  },
  {
    label: "Services",
    href: "/manager/services",
    icon: Coffee,
    hint: "Dịch vụ & mặt hàng",
  },
  {
    label: "Customers",
    href: "/manager/customers",
    icon: Users,
    hint: "Khách hàng",
  },
  {
    label: "Staff",
    href: "/manager/staff",
    icon: UsersThree,
    hint: "Nhân viên chi nhánh",
  },
  {
    label: "Invoices",
    href: "/manager/invoices",
    icon: FileText,
    hint: "Hóa đơn & thanh toán",
  },
  {
    label: "Reports",
    href: "/manager/reports",
    icon: TrendUp,
    hint: "Báo cáo doanh thu",
  },
  {
    label: "Profile",
    href: "/manager/profile",
    icon: UserCircle,
    hint: "Hồ sơ cá nhân",
  },
];
