"use client";

import { createContext, useContext, useState, useEffect } from "react";
import DashboardNavbar from "../components/dashboardLayout/dashboardNavbar/DashboardNavbar";
import DashboardSidebar from "../components/dashboardLayout/dashboardSidebar/DashboardSidebar";

// Create context for sidebar state
interface SidebarContextType {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapse: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Handle screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
      // Auto-collapse on smaller screens
      if (window.innerWidth < 1280) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
  const closeMobile = () => setIsMobileOpen(false);

  const sidebarContextValue: SidebarContextType = {
    isCollapsed,
    isMobileOpen,
    toggleCollapse,
    toggleMobile,
    closeMobile,
  };

  return (
    <SidebarContext.Provider value={sidebarContextValue}>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Mobile Backdrop */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden" onClick={closeMobile} />
        )}

        {/* Sidebar */}
        <DashboardSidebar />

        {/* Main Content */}
        <div
          className={`
          flex-1 flex flex-col overflow-hidden min-w-0
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "lg:ml-0" : "lg:ml-0"}
        `}
        >
          {/* Navbar */}
          <DashboardNavbar />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8 max-w-full">
              <div className="max-w-7xl mx-auto">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
