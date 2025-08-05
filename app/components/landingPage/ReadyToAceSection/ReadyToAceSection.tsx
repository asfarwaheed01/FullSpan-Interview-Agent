"use client";
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";

const ReadyToAceSection = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleStartInterview = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  const handleCheckFAQ = () => {
    // Handle FAQ navigation
    console.log("Navigating to FAQ...");
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900"></div>

      {/* Background pattern/texture overlay */}

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Header badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600/20 backdrop-blur-sm border border-blue-400/30 mb-8"
        >
          <span className="text-sm font-medium text-blue-300 uppercase tracking-wide">
            BOOST YOUR INTERVIEW SKILLS
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
        >
          Ready to Ace Your Next Interview?
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          Click below to start your first mock session with our AI interviewer
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <motion.button
            onClick={handleStartInterview}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.5)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
            <span>Start Mock Interview</span>
            <motion.div className="group-hover:translate-x-1 transition-transform duration-200">
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </motion.button>
        </motion.div>

        {/* FAQ Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-blue-200 text-sm mb-2">
            Need help? Check our helpful guide below or explore FAQs at the
            bottom.
          </p>
          <motion.button
            onClick={handleCheckFAQ}
            className="text-blue-300 hover:text-white font-medium underline underline-offset-4 hover:underline-offset-8 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
          >
            View Frequently Asked Questions
          </motion.button>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-0 w-16 h-16 bg-blue-400/10 rounded-full blur-lg"></div>
        <div className="absolute top-1/4 right-0 w-24 h-24 bg-purple-400/10 rounded-full blur-lg"></div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none"></div>
    </section>
  );
};

export default ReadyToAceSection;
