import React from "react";
import { Users, Clock, Brain, ArrowRight } from "lucide-react";

export default function WhyUseSection() {
  const features = [
    {
      icon: Users,
      title: "Personalized Interview Practice",
      description:
        "Tailored mock interviews based on your industry, role, and experience level. Practice with scenarios specific to your target position.",
    },
    {
      icon: Clock,
      title: "Real-Time Voice Simulations",
      description:
        "Experience realistic interview conversations with our advanced AI voice technology that adapts to your responses in real-time.",
    },
    {
      icon: Brain,
      title: "Instant Feedback & Insights",
      description:
        "Get immediate analysis of your performance, including communication skills, confidence levels, and areas for improvement.",
    },
  ];

  return (
    <section
      className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
      id="whyuse"
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Why Use Mock Interview Agent?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Prepare with confidence using our AI-powered interview coach
            designed to help you succeed in your next opportunity.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              {/* Icon container */}
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                {/* Icon background glow */}
                <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-700 transition-colors">
                {feature.title}
              </h3>

              <p className="text-gray-600 leading-relaxed mb-6">
                {feature.description}
              </p>

              {/* Hover arrow */}
              <div className="flex items-center text-purple-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                <span className="text-sm font-medium mr-2">Learn more</span>
                <ArrowRight className="w-4 h-4" />
              </div>

              {/* Card border glow effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Background pattern */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
    </section>
  );
}
