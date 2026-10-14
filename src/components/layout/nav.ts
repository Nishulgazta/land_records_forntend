import {
  BarChart3,
  Box,
  Cpu,
  FileText,
  History,
  LayoutDashboard,
  Map,
  NotebookPen,
  Package,
  ScrollText,
  Settings,
  ShieldCheck,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Match the href exactly for the active state (default: prefix match). */
  exact?: boolean;
}

export interface NavSection {
  title: string | null;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: null,
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard, exact: true },
      { label: "Documents", href: "/documents", icon: FileText },
      { label: "Processing", href: "/processing", icon: Cpu },
      { label: "Land Records", href: "/records", icon: ScrollText },
      { label: "Validation", href: "/validation", icon: ShieldCheck },
      { label: "Verification", href: "/verification", icon: UserCheck },
      {
        label: "Mutation Notebook",
        href: "/mutation-notebook",
        icon: NotebookPen,
      },
    ],
  },
  {
    title: "GIS",
    items: [
      { label: "View Your Land", href: "/map", icon: Map, exact: true },
      { label: "GIS / Map", href: "/map/3d", icon: Box, exact: true },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Exports", href: "/export", icon: Package },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Audit", href: "/audit", icon: History },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.exact) return pathname === item.href;
  if (item.href === "/") return pathname === "/";
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Breadcrumb segments for the compact header, derived from the path. */
export function breadcrumbsFor(pathname: string): Array<{ label: string; href: string }> {
  if (pathname === "/") return [{ label: "Dashboard", href: "/" }];

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Array<{ label: string; href: string }> = [
    { label: "Dashboard", href: "/" },
  ];

  let accumulated = "";
  for (const segment of segments) {
    accumulated += `/${segment}`;
    const href = accumulated;
    const item = NAV_SECTIONS.flatMap((section) => section.items).find(
      (candidate) => candidate.href === href || `${candidate.href}/` === `${href}/`,
    );
    const label = item?.label ?? decodeURIComponent(segment).replace(/-/g, " ");
    crumbs.push({ label: label.charAt(0).toUpperCase() + label.slice(1), href });
  }

  return crumbs;
}
