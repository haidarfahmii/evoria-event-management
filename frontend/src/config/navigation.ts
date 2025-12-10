import {
  FiHome,
  FiCalendar,
  FiUsers,
  FiUser,
  FiSettings,
  FiCreditCard,
  FiCompass,
  FiRepeat,
} from "react-icons/fi";

// tipe untuk item menu
export interface SidebarItem {
  label: string;
  href: string;
  icon: any;
  key?: string;
}

// tipe untuk group menu
export interface SidebarGroup {
  group: string;
  items: SidebarItem[];
}

// struktur menu navigasi
export const SIDEBAR_ITEMS: {
  customer: SidebarGroup[];
  organizer: SidebarGroup[];
} = {
  customer: [
    {
      group: "Menu Utama",
      items: [
        { label: "Jelajah Event", href: "/", icon: FiCompass },
        { label: "Tiket Saya", href: "/member/tiket-saya", icon: FiCreditCard },
      ],
    },
    {
      group: "Akun",
      items: [
        {
          label: "Informasi Dasar",
          href: "/member/profile/informasi-dasar",
          icon: FiUser,
        },
        {
          label: "Pengaturan",
          href: "/member/profile/pengaturan",
          icon: FiSettings,
        },
      ],
    },
    {
      group: "Mode User",
      items: [
        {
          label: "Beralih ke Organizer",
          href: "#",
          icon: FiRepeat,
          key: "switch_role",
        },
      ],
    },
  ],
  organizer: [
    {
      group: "Dashboard",
      items: [
        { label: "Dashboard", href: "/member/dashboard", icon: FiHome },
        { label: "Event Saya", href: "/member/events", icon: FiCalendar },
        { label: "Kelola Akses", href: "/member/manage-access", icon: FiUsers },
      ],
    },
    {
      group: "Akun",
      items: [
        {
          label: "Informasi Pribadi",
          href: "/member/profile/informasi-dasar",
          icon: FiUser,
        },
        {
          label: "Pengaturan",
          href: "/member/profile/pengaturan",
          icon: FiSettings,
        },
      ],
    },
    {
      group: "Mode User",
      items: [
        {
          label: "Beralih ke Pembeli",
          href: "#",
          icon: FiRepeat,
          key: "switch_role",
        },
      ],
    },
  ],
};
