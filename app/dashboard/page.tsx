// app/dashboard/page.tsx
"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  Star,
  ArrowRight,
  Lightbulb,
  TrendingUp,
  Target,
  Award,
} from "lucide-react";
import StartInterviewModal from "../components/startInterviewModal/StartInterviewModal";

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const recentInterviews = [
    {
      id: 1,
      title: "Full Stack Developer",
      company: "Stellar Tech Solutions",
      date: "15-6-2025",
      duration: "15 min",
      score: 82,
      status: "Excellent",
      statusColor: "text-green-600 bg-green-50 border-green-200",
    },
    {
      id: 2,
      title: "UI UX Designer",
      company: "Zee Frames",
      date: "14-6-2025",
      duration: "30 min",
      score: 75,
      status: "Good",
      statusColor: "text-yellow-600 bg-yellow-50 border-yellow-200",
    },
    {
      id: 3,
      title: "UI UX Designer",
      company: "Zee Frames",
      date: "25-6-2025",
      duration: "45 min",
      score: 90,
      status: "Excellent",
      statusColor: "text-green-600 bg-green-50 border-green-200",
    },
  ];

  const interviewTips = [
    "Practice the STAR method (Situation, Task, Action, Result) for behavioral questions",
    "Click below to start your first mock session with our AI Interviewer.",
    "Click below to start your first mock session with our AI Interviewer.",
  ];

  const stats = [
    {
      title: "Total Interviews",
      value: "12",
      change: "+2.5%",
      changeType: "positive" as const,
      icon: Target,
    },
    {
      title: "Average Score",
      value: "82%",
      change: "+5.2%",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
    {
      title: "Success Rate",
      value: "85%",
      change: "+12%",
      changeType: "positive" as const,
      icon: Award,
    },
  ];

  return (
    <>
      <div className="space-y-6 sm:space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <div
                      className={`
                      flex items-center mt-2 text-sm
                      ${
                        stat.changeType === "positive"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    `}
                    >
                      <TrendingUp size={14} className="mr-1" />
                      <span>{stat.change}</span>
                      <span className="text-gray-500 ml-1">
                        from last month
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Icon size={24} className="text-blue-600" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interview Tips Card */}
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 rounded-xl p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center mb-4 sm:mb-6">
              <Lightbulb className="w-6 h-6 mr-3 text-yellow-400 flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold">
                Today's Interview Tips
              </h2>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {interviewTips.map((tip, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 sm:mr-4 flex-shrink-0"></div>
                  <p className="text-sm sm:text-base leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-4 right-4 sm:top-8 sm:right-8 opacity-10">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full"></div>
          </div>
          <div className="absolute -bottom-6 -right-6 sm:-bottom-8 sm:-right-8 opacity-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full"></div>
          </div>
          <div className="absolute top-1/2 left-8 opacity-5">
            <div className="w-16 h-16 border-2 border-white rounded-full"></div>
          </div>
        </div>

        {/* Main Interview Card */}
        <div className="bg-white rounded-xl p-6 sm:p-8 lg:p-12 shadow-sm border border-gray-200 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 opacity-3">
            <div className="absolute top-10 left-10 w-12 h-12 sm:w-16 sm:h-16 border-2 border-gray-300 rounded-full"></div>
            <div className="absolute top-20 right-20 w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full"></div>
            <div className="absolute bottom-10 left-20 w-8 h-8 sm:w-12 sm:h-12 border border-gray-300 rounded-lg rotate-45"></div>
            <div className="absolute bottom-20 right-10 w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-lg"></div>
            <div className="absolute top-1/3 right-1/4 w-4 h-4 sm:w-6 sm:h-6 border border-gray-300 rounded-full"></div>
            <div className="absolute bottom-1/3 left-1/4 w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-lg rotate-12"></div>
          </div>

          <div className="relative z-10 text-center">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white rounded-full flex items-center justify-center">
                <span className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">
                  AI
                </span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Ready for Your Next Mock Interview?
            </h2>

            <p className="text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Practice with our AI interviewer tailored to your target job and
              company. Get real-time feedback and improve your interview skills
              with personalized insights.
            </p>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold transition-all duration-200 inline-flex items-center text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Start New Interview
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Recent Interviews */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              Recent Interviews
            </h3>
            <p className="text-sm text-gray-500">
              Track your progress and review past performances
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {recentInterviews.map((interview) => (
              <div
                key={interview.id}
                className="border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-all duration-200 hover:border-gray-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-3 space-y-2 sm:space-y-0">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                        {interview.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${interview.statusColor}`}
                        >
                          {interview.status}
                        </span>
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-600 mb-3">
                      at {interview.company}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                        <span className="whitespace-nowrap">
                          {interview.date}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                        <span className="whitespace-nowrap">
                          {interview.duration}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                        <span className="whitespace-nowrap">
                          {interview.score}% score
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="mt-4 sm:mt-6 text-center">
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
              View All Interviews →
            </button>
          </div>
        </div>

        {/* Quick Actions - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-100">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                Practice Sessions
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-4">
              Start quick 10-minute practice sessions for specific skills
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
            >
              Start Practice →
            </button>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 border border-green-100">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                View Progress
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-4">
              Track your improvement over time with detailed analytics
            </p>
            <button className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors">
              View Analytics →
            </button>
          </div>
        </div>
      </div>

      {/* Start Interview Modal */}
      {isModalOpen && (
        <StartInterviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
