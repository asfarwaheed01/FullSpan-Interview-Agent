"use client";
import React, { useState, useEffect } from "react";
import { Menu, X, ChevronDown, User, LogOut, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import Image from "next/image";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Check if we're on the landing page
  const isLandingPage = pathname === "/";

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const handleGetStartedClick = () => {
    setIsMobileMenuOpen(false);
    router.push("/login");
  };

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
    router.push("/");
  };

  const handleProfileClick = () => {
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
    router.push("/dashboard");
  };

  const handleSettingsClick = () => {
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
    router.push("/settings");
  };

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Generate avatar initials from username or email
  const getAvatarInitials = () => {
    if (!user) return "U";

    if (user.username) {
      const names = user.username.split("_");
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return user.username.substring(0, 2).toUpperCase();
    }

    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }

    return "U";
  };

  // Animation variants
  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        when: "afterChildren",
      },
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const menuItemVariants = {
    closed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2,
      },
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const dropdownVariants = {
    closed: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
  };

  const mobileDropdownVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
  };

  // Determine navbar background and text colors
  const getNavbarStyles = () => {
    if (!isLandingPage) {
      // For non-landing pages, always use purple background with white text
      return {
        bg: "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 shadow-sm border-b border-purple-500/20",
        text: "text-white",
        hoverText: "hover:text-gray-200",
        mobileMenuBg:
          "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-t border-purple-500/20",
        mobileText: "text-white",
        mobileHoverText: "hover:text-gray-200",
        menuButton: "text-white hover:text-gray-200 hover:bg-white/10",
      };
    }

    // For landing page, use scroll-based styling
    if (isScrolled) {
      return {
        bg: "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100",
        text: "text-gray-900",
        hoverText: "hover:text-gray-600",
        mobileMenuBg: "bg-white/95 backdrop-blur-md border-t border-gray-100",
        mobileText: "text-gray-900",
        mobileHoverText: "hover:text-gray-600",
        menuButton: "text-gray-900 hover:text-gray-600 hover:bg-gray-100",
      };
    }

    return {
      bg: "bg-transparent",
      text: "text-white",
      hoverText: "hover:text-gray-200",
      mobileMenuBg: "bg-white/95 backdrop-blur-md border-t border-gray-100",
      mobileText: "text-gray-900",
      mobileHoverText: "hover:text-gray-600",
      menuButton: "text-white hover:text-gray-200 hover:bg-white/10",
    };
  };

  const styles = getNavbarStyles();

  return (
    <motion.nav
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${styles.bg}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto py-3 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href={"/"}>
              <Image
                src={"/assets/Intervia-logo.svg"}
                alt="Logo"
                width={"120"}
                height={"120"}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link
                  href="/"
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer ${styles.text} ${styles.hoverText}`}
                >
                  Home
                </Link>
              </motion.div>

              <motion.button
                onClick={() => scrollToSection("whyuse")}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer ${styles.text} ${styles.hoverText}`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                Why Use
              </motion.button>

              <motion.button
                onClick={() => scrollToSection("howitworks")}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer ${styles.text} ${styles.hoverText}`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                How It Works
              </motion.button>

              <motion.button
                onClick={() => scrollToSection("contactus")}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer ${styles.text} ${styles.hoverText}`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                Contact Us
              </motion.button>
            </div>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* User Avatar or Get Started Button */}
            {isAuthenticated && user ? (
              <div className="relative">
                <motion.button
                  onClick={toggleUserDropdown}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100/20 transition-colors duration-200 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {getAvatarInitials()}
                  </div>
                  <motion.div
                    animate={{ rotate: isUserDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className={`w-4 h-4 ${styles.text}`} />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <motion.div
                      initial="closed"
                      animate="open"
                      exit="closed"
                      variants={dropdownVariants}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user.username}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {user.email}
                        </p>
                        <p className="text-xs text-gray-400 capitalize mt-1">
                          Role: {user.role}
                        </p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={handleProfileClick}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150 cursor-pointer"
                        >
                          <User className="w-4 h-4 mr-3" />
                          Dashboard
                        </button>

                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                className="px-6 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 cursor-pointer"
                style={{ backgroundColor: "#6576FF" }}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "#5a6beb",
                  y: -2,
                }}
                onClick={handleGetStartedClick}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                Get Started
              </motion.button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              onClick={toggleMobileMenu}
              className={`inline-flex items-center justify-center p-2 rounded-md transition-colors duration-200 cursor-pointer ${styles.menuButton}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="block h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="block h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            className={`md:hidden overflow-hidden ${styles.mobileMenuBg}`}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <motion.button
                onClick={() => scrollToSection("whyuse")}
                variants={menuItemVariants}
                className={`${styles.mobileText} ${styles.mobileHoverText} block px-3 py-2 text-base font-medium transition-colors duration-200 w-full text-left cursor-pointer`}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                Why Use
              </motion.button>

              <motion.button
                onClick={() => scrollToSection("howitworks")}
                variants={menuItemVariants}
                className={`${styles.mobileText} ${styles.mobileHoverText} block px-3 py-2 text-base font-medium transition-colors duration-200 w-full text-left cursor-pointer`}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                How It Works
              </motion.button>

              <motion.button
                onClick={() => scrollToSection("contactus")}
                variants={menuItemVariants}
                className={`${styles.mobileText} ${styles.mobileHoverText} block px-3 py-2 text-base font-medium transition-colors duration-200 w-full text-left cursor-pointer`}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                Contact Us
              </motion.button>

              {/* Mobile User Section or Get Started Button */}
              {isAuthenticated && user ? (
                <motion.div variants={menuItemVariants} className="px-3 py-2">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {getAvatarInitials()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${styles.mobileText}`}
                      >
                        {user.username}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        Role: {user.role}
                      </p>
                    </div>
                  </div>

                  <motion.button
                    onClick={toggleUserDropdown}
                    className={`flex items-center justify-between w-full ${styles.mobileText} ${styles.mobileHoverText} text-base font-medium transition-colors duration-200 cursor-pointer`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Account Options</span>
                    <motion.div
                      animate={{ rotate: isUserDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {isUserDropdownOpen && (
                      <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={mobileDropdownVariants}
                        className="mt-2 ml-4 space-y-2 overflow-hidden"
                      >
                        <motion.button
                          onClick={handleProfileClick}
                          className="flex items-center w-full text-gray-600 hover:text-gray-900 text-sm py-2 transition-colors duration-150 cursor-pointer"
                          whileHover={{ x: 3 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <User className="w-4 h-4 mr-3" />
                          Dashboard
                        </motion.button>

                        <motion.button
                          onClick={handleSettingsClick}
                          className="flex items-center w-full text-gray-600 hover:text-gray-900 text-sm py-2 transition-colors duration-150 cursor-pointer"
                          whileHover={{ x: 3 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Settings
                        </motion.button>

                        <motion.button
                          onClick={handleLogout}
                          className="flex items-center w-full text-red-600 hover:text-red-700 text-sm py-2 transition-colors duration-150 cursor-pointer"
                          whileHover={{ x: 3 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Logout
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div variants={menuItemVariants} className="px-3 pt-2">
                  <motion.button
                    className="w-full px-6 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 cursor-pointer"
                    style={{ backgroundColor: "#6576FF" }}
                    whileHover={{
                      scale: 1.02,
                      backgroundColor: "#5a6beb",
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    onClick={handleGetStartedClick}
                  >
                    Get Started
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
