"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import { useSidebar } from "@/app/dashboard/layout";
import { Bell, Settings, User, ChevronDown, Menu, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function DashboardNavbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const { toggleMobile } = useSidebar();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mounted, setMounted] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  console.log(user);

  const handleConfig = () => {
    router.push("/dashboard/user-config");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex-shrink-0">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu + Title */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={toggleMobile}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu size={20} className="text-gray-600" />
          </button>

          {/* Page Title */}
          <div className="flex items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Dashboard
            </h1>
          </div>
        </div>

        {/* Center - Search (hidden on mobile) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search interviews, tips..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Mobile search button */}
          <button className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Search size={18} />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell size={18} />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                3
              </span>
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 transform opacity-0 scale-95 animate-dropdown">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      Notifications
                    </h3>
                    <span className="text-xs text-gray-500">3 new</span>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <div className="p-3 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 border-transparent hover:border-blue-500">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          New interview completed
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Full Stack Developer interview - 82% score
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          2 minutes ago
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 border-transparent hover:border-blue-500">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Interview feedback ready
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          UI/UX Designer interview analysis
                        </p>
                        <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 border-transparent hover:border-blue-500">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Account upgrade available
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Unlock advanced features
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          3 hours ago
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="relative">
            <button
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={handleConfig}
            >
              <Settings size={18} />
              {/* Settings badge */}
              <span className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                1
              </span>
            </button>
          </div>

          {/* Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center space-x-2 sm:space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="hidden sm:block text-sm font-medium text-gray-700 truncate max-w-40">
                Hello, {isAuthenticated ? user?.username : "Guest"}
              </span>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                {user?.avatar ? (
                  <img
                    className="rounded-full w-full h-full object-cover"
                    src={user.avatar}
                    referrerPolicy="no-referrer"
                    alt={user.username || "User Avatar"}
                  />
                ) : (
                  <User size={20} className="text-white" />
                )}
              </div>
              <ChevronDown
                size={16}
                className="text-gray-600 hidden sm:block"
              />
            </button>

            {/* Profile dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 transform opacity-0 scale-95 animate-dropdown">
                <div className="p-3 border-b border-gray-200">
                  <p className="font-medium text-gray-900 truncate">
                    {user?.username}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || "No email provided"}
                  </p>
                </div>
                <div className="p-2">
                  <a
                    href="#"
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Profile Settings
                  </a>
                  <a
                    href="#"
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Billing & Usage
                  </a>
                  <a
                    href="#"
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Help & Support
                  </a>
                  <a
                    href="#"
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Keyboard Shortcuts
                  </a>
                </div>
                <div className="p-2 border-t border-gray-200">
                  <a
                    onClick={logout}
                    className="block px-3 py-2 cursor-pointer text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Sign out
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      {/* <div className="md:hidden mt-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search interviews, tips..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div> */}

      <style jsx>{`
        @keyframes dropdown {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-dropdown {
          animation: dropdown 0.15s ease-out forwards;
        }
      `}</style>
    </header>
  );
}
