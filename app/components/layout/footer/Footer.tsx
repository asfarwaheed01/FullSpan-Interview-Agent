import React from "react";

const Footer = () => {
  return (
    <footer
      className="relative overflow-hidden"
      style={{ backgroundColor: "#1B1B3B" }}
    >
      {/* Gradient Background Effects */}
      <div className="absolute inset-0">
        {/* Blue gradient on the left */}
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-blue-500/20 via-blue-400/10 to-transparent opacity-60"></div>

        {/* Pink gradient on the right */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-pink-500/20 via-pink-400/10 to-transparent opacity-60"></div>

        {/* Additional subtle radial gradients for more depth */}
        <div className="absolute top-1/4 left-10 w-32 h-32 bg-blue-400/15 rounded-full blur-xl"></div>
        <div className="absolute bottom-1/4 right-10 w-40 h-40 bg-pink-400/15 rounded-full blur-xl"></div>
      </div>

      {/* Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <div className="text-2xl font-bold text-white mb-4">LOGO</div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
              Mock Interview Agent is an AI-powered platform designed to help
              job seekers prepare for interviews with personalized mock
              sessions, real-time simulations, and smart feedback—tailored to
              the job, company, and candidate profile.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              QUICK LINKS
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
                >
                  Start Mock Interview
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Get Started */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              GET STARTED
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
                >
                  Login
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
                >
                  Sign up
                </a>
              </li>
            </ul>
          </div>

          {/* Who We Help */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              WHO WE HELP
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
                >
                  Job Seekers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
                >
                  Career Coaches
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
                >
                  University Career Centers
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-600/30">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              Copyright © 2023. Template Made by{" "}
              <span className="text-white font-medium">Softmio</span>.
            </div>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
