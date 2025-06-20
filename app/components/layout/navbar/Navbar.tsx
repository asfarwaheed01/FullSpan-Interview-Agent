"use client";
import React, { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
  };

  const handleGetStartedClick = () => {
    // Handle the "Get Started" button click
    setIsMobileMenuOpen(false);
    router.push("/login");
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

  const languageDropdownVariants = {
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

  const mobileLanguageDropdownVariants = {
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

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="text-2xl font-bold text-gray-900">LOGO</div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                href="/"
                className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                href="#"
                className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Features
              </Link>
              <Link
                href="/interview"
                className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Interview
              </Link>
              <a
                href="#"
                className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Contact US
              </a>
            </div>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Dropdown */}
            <div className="relative">
              <motion.button
                onClick={toggleLanguageDropdown}
                className="flex items-center space-x-1 text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>En (US)</span>
                <motion.div
                  animate={{ rotate: isLanguageDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {isLanguageDropdownOpen && (
                  <motion.div
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={languageDropdownVariants}
                    className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 overflow-hidden"
                  >
                    <div className="py-1">
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      >
                        En (US)
                      </a>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      >
                        Es (ES)
                      </a>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      >
                        Fr (FR)
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Get Started Button */}
            <motion.button
              className="px-6 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200"
              style={{ backgroundColor: "#6576FF" }}
              whileHover={{
                scale: 1.05,
                backgroundColor: "#5a6beb",
              }}
              onClick={handleGetStartedClick}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              Get Started
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-900 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
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
            className="md:hidden overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-100">
              <motion.a
                href="#"
                variants={menuItemVariants}
                className="text-gray-900 hover:text-gray-600 block px-3 py-2 text-base font-medium transition-colors duration-200"
              >
                Home
              </motion.a>
              <motion.a
                href="#"
                variants={menuItemVariants}
                className="text-gray-900 hover:text-gray-600 block px-3 py-2 text-base font-medium transition-colors duration-200"
              >
                Features
              </motion.a>
              <motion.a
                href="#"
                variants={menuItemVariants}
                className="text-gray-900 hover:text-gray-600 block px-3 py-2 text-base font-medium transition-colors duration-200"
              >
                About Us
              </motion.a>
              <motion.a
                href="#"
                variants={menuItemVariants}
                className="text-gray-900 hover:text-gray-600 block px-3 py-2 text-base font-medium transition-colors duration-200"
              >
                Contact US
              </motion.a>

              {/* Mobile Language Selector */}
              <motion.div variants={menuItemVariants} className="px-3 py-2">
                <motion.button
                  onClick={toggleLanguageDropdown}
                  className="flex items-center justify-between w-full text-gray-900 hover:text-gray-600 text-base font-medium transition-colors duration-200"
                  whileTap={{ scale: 0.98 }}
                >
                  <span>En (US)</span>
                  <motion.div
                    animate={{ rotate: isLanguageDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {isLanguageDropdownOpen && (
                    <motion.div
                      initial="closed"
                      animate="open"
                      exit="closed"
                      variants={mobileLanguageDropdownVariants}
                      className="mt-2 ml-4 space-y-1 overflow-hidden"
                    >
                      <a
                        href="#"
                        className="block text-gray-600 hover:text-gray-900 text-sm py-1 transition-colors duration-150"
                      >
                        En (US)
                      </a>
                      <a
                        href="#"
                        className="block text-gray-600 hover:text-gray-900 text-sm py-1 transition-colors duration-150"
                      >
                        Es (ES)
                      </a>
                      <a
                        href="#"
                        className="block text-gray-600 hover:text-gray-900 text-sm py-1 transition-colors duration-150"
                      >
                        Fr (FR)
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Mobile Get Started Button */}
              <motion.div variants={menuItemVariants} className="px-3 pt-2">
                <motion.button
                  className="w-full px-6 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200"
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
