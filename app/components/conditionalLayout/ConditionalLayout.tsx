"use client";

import { usePathname } from "next/navigation";
import Navbar from "../layout/navbar/Navbar";
import Footer from "../layout/footer/Footer";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Check if current route is dashboard or any dashboard subroute
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isUserConfigRoute = pathname === "/user-configuration";
  const isInterview = pathname === "/interview";

  if (isDashboardRoute || isUserConfigRoute || isInterview) {
    // For dashboard routes, render children without navbar/footer
    return <>{children}</>;
  }

  // For all other routes, render with navbar and footer
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
