import {
  LayoutDashboard,
  Globe2,
  Bell,
  FileBarChart,
  Settings,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Regions", href: "/regions", icon: Globe2 },
  { title: "Alerts", href: "/alerts", icon: Bell },
  { title: "ESG Reports", href: "/reports", icon: FileBarChart },
  { title: "Settings", href: "/settings", icon: Settings },
]
