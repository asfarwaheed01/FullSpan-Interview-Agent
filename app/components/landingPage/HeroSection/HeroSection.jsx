"use client";
import React from "react";
import { ArrowRight, Mic, Video, Brain, Star } from "lucide-react";

export default function InterviewHero() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>

      <div className="relative z-10 container mx-auto px-6 pt-20 pb-16">
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-[80vh]">
          {/* Left content */}
          <div className="flex-1 max-w-2xl mb-12 lg:mb-0">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-sm mb-8 animate-fade-in">
              <Star className="w-4 h-4 mr-2 text-yellow-400" />
              Mock Interview Agent
            </div>

            {/* Main heading */}
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
              Your{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient-x">
                Interview
              </span>{" "}
              Coach
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-300 mb-8 leading-relaxed animate-fade-in-up delay-200">
              Get ready for your next big opportunity with our AI-powered
              interview coach. Practice real interview scenarios, receive
              instant feedback, and build the confidence you need to land your
              dream job. Our advanced AI analyzes your responses and provides
              personalized insights to help you improve.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105">
                <span className="flex items-center justify-center">
                  Start Your Interview
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition-opacity -z-10"></div>
              </button>

              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300">
                Watch Demo
              </button>
            </div>

            {/* Stats or features */}
            <div className="flex items-center gap-8 mt-12 text-gray-400 animate-fade-in-up delay-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Live AI Feedback</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
                <span className="text-sm">Real-time Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-700"></div>
                <span className="text-sm">Instant Results</span>
              </div>
            </div>
          </div>

          {/* Right visual element */}
          <div className="flex-1 max-w-lg lg:ml-12">
            <div className="relative">
              {/* Main card */}
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl animate-float">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>

                <div className="relative z-10">
                  {/* Mock interview UI */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                      <span className="text-white/80 font-medium">
                        Live Interview
                      </span>
                    </div>
                    <div className="text-white/60 text-sm">02:34</div>
                  </div>

                  {/* AI Avatar */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        AI Interviewer
                      </div>
                      <div className="text-white/60 text-sm">
                        Senior Technical Recruiter
                      </div>
                    </div>
                  </div>

                  {/* Mock question */}
                  <div className="bg-white/5 rounded-xl p-4 mb-4">
                    <p className="text-white/90 text-sm leading-relaxed">
                      "Tell me about a challenging project you worked on and how
                      you overcame the obstacles."
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <button className="w-12 h-12 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-full flex items-center justify-center transition-colors">
                      <Mic className="w-5 h-5 text-red-400" />
                    </button>
                    <button className="w-12 h-12 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-full flex items-center justify-center transition-colors">
                      <Video className="w-5 h-5 text-blue-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center animate-bounce delay-1000">
                <span className="text-2xl">🎯</span>
              </div>

              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl flex items-center justify-center animate-bounce delay-500">
                <span className="text-xl">✨</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }

        .animate-fade-in-up.delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animate-fade-in-up.delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animate-fade-in-up.delay-500 {
          animation-delay: 0.5s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }

        .bg-grid-white\\/\\[0\\.02\\] {
          background-image: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.02) 1px,
            transparent 1px
          );
        }
      `}</style>
    </section>
  );
}
