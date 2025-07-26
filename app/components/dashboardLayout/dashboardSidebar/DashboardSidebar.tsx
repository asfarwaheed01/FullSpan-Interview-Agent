"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  Settings,
  X,
  AlignJustify,
} from "lucide-react";
import { useSidebar } from "@/app/dashboard/layout";
import logo from "@/public/assets/Intervia-logo.svg";
import logoIcon from "@/public/assets/icon.png";
import Image from "next/image";

const sidebarItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Recent Interviews",
    href: "/dashboard/recent",
    icon: Clock,
  },
  {
    name: "Settings",
    href: "/dashboard/user-config",
    icon: Settings,
  },
];

export default function DashboardSidebar() {
  const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile } =
    useSidebar();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <>
      {/* Sidebar */}
      <div
        className={`
        bg-[#212529] flex flex-col z-50
        transition-all duration-300 ease-in-out transform
        ${isCollapsed ? "w-16" : "w-[270px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        fixed lg:relative h-full
        shadow-lg lg:shadow-none
      `}
      >
        {/* Logo section */}
        <div
          className={`
          flex flex-col border-b-[1px] border-gray-700 min-h-[50px]
          ${isCollapsed ? "p-2" : "p-4"}
        `}
        >
          {/* Logo and collapse button row */}
          <div
            className={`
            flex items-center transition-all duration-300
            ${isCollapsed ? "" : "justify-between mb-0"}
          `}
          >
            <div
              className={`
              flex items-center
              ${isCollapsed ? "" : "space-x-3"}
            `}
            >
              {isCollapsed ? (
                <Image src={logoIcon} alt="logo" className="w-full h-full" />
              ) : (
                <Image src={logo} alt="logo" />
              )}
            </div>

            {/* Desktop collapse button - aligned with logo when expanded */}
            {!isCollapsed && (
              <button
                onClick={toggleCollapse}
                className="hidden lg:flex items-center justify-center p-2 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors duration-200"
              >
                <AlignJustify size={16} className="text-[#ffffff]" />
              </button>
            )}

            {/* Mobile close button */}
            <button
              onClick={closeMobile}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Collapsed state - button below logo */}
          {isCollapsed && (
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex items-center justify-center p-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 w-8 mx-auto"
            >
              <AlignJustify size={14} className="text-[#FFFFFF]" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                className={`
                  group flex items-center px-3 py-3 text-sm font-medium 
                  transition-all duration-200 relative rounded-md
                  ${
                    isActive
                      ? "bg-gradient-to-r from-pink-600 to-indigo-800 text-[#ffffff]"
                      : "text-[#a4a4a4] hover:bg-gray-800 hover:text-gray-300"
                  }
                  ${isCollapsed ? "justify-center" : ""}
                `}
              >
                <Icon
                  size={20}
                  className={`
                    flex-shrink-0 transition-all duration-200
                    ${isCollapsed ? "" : "mr-3"}
                    ${isActive ? "text-[#FFFFFF]" : ""}
                  `}
                />
                <span
                  className={`
                  transition-all duration-300 truncate
                  ${
                    isCollapsed
                      ? "opacity-0 w-0 overflow-hidden"
                      : "opacity-100"
                  }
                `}
                >
                  {item.name}
                </span>

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div
                    className="
                    absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible
                    transition-all duration-200 z-50 whitespace-nowrap
                  "
                  >
                    {item.name}
                    <div
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 
                      border-4 border-transparent border-r-gray-900"
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
