"use client";
import React from "react";
import { motion } from "framer-motion";

const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      title: "Input Your Details",
      description:
        "Upload your resume, add job descriptions, and tell us about your target company. We extract:",
      features: [
        "PDF/DOC resumes",
        "Job titles and descriptions",
        "Company mission, values, and culture aspects",
      ],
      bgColor: "bg-blue-200",
      position: "right",
    },
    {
      number: "02",
      title: "Join the Mock Interview",
      description:
        'Click "Start Interview" and participate in voice-based sessions while our AI analyzes your responses.',
      features: [
        "Your AI interviewer will ask relevant context-aware questions based on your profile.",
      ],
      bgColor: "bg-purple-300",
      position: "left",
    },
    {
      number: "03",
      title: "Receive Real-Time Feedback",
      description: "Once the interview ends, get a comprehensive report:",
      features: [
        "Communication & confidence rating",
        "Response to questions for each skill",
        "Improvement suggestions with detailed responses",
      ],
      bgColor: "bg-teal-200",
      position: "right",
    },
    {
      number: "04",
      title: "Refine & Retry",
      description: "Practice makes perfect!",
      features: [
        "Retry your mock interviews or download your feedback report to track your progress over time.",
      ],
      bgColor: "bg-purple-300",
      position: "left",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const stepVariants = {
    hidden: {
      opacity: 0,
      y: 50,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const shapeVariants = {
    hidden: {
      scale: 0,
      rotate: -180,
    },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 overflow-hidden"
      id="howitworks"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-4">
            HOW IT WORKS
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works – 4 Easy Steps
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Quickly set up, simulate, and improve with a streamlined mock
            interview experience.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-24"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={stepVariants}
              className={`relative flex flex-col lg:flex-row items-center gap-12 ${
                step.position === "left" ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Content */}
              <div className="flex-1 z-10">
                <div className="max-w-lg">
                  <span className="text-2xl font-bold text-blue-600 mb-2 block">
                    {step.number}
                  </span>
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-lg text-gray-600 mb-6">
                    {step.description}
                  </p>
                  <ul className="space-y-3">
                    {step.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Decorative Shape */}
              <div className="flex-1 relative flex justify-center lg:justify-start">
                <motion.div
                  variants={shapeVariants}
                  className={`w-80 h-80 md:w-96 md:h-96 ${step.bgColor} rounded-3xl transform`}
                  style={{
                    borderRadius:
                      index % 2 === 0
                        ? "60% 40% 30% 70% / 60% 30% 70% 40%"
                        : "40% 60% 70% 30% / 40% 70% 30% 60%",
                  }}
                />

                {/* Optional: Add icons or illustrations inside shapes */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {step.number}
                    </span>
                  </div>
                </div>
              </div>

              {/* Connecting Line (except for last item) */}
              {index < steps.length - 1 && (
                <motion.div
                  className="absolute left-1/2 transform -translate-x-1/2 top-full hidden lg:block"
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  style={{ transformOrigin: "top" }}
                >
                  <div className="w-px h-24 bg-gradient-to-b from-blue-600 to-transparent"></div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
