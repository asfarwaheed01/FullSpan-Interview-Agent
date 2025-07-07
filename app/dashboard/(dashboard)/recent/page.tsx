// app/dashboard/recent/page.tsx
import {
  Calendar,
  Clock,
  Star,
  ArrowRight,
  Filter,
  Search,
  Download,
} from "lucide-react";

export default function RecentInterviewsPage() {
  const interviews = [
    {
      id: 1,
      title: "Full Stack Developer",
      company: "Stellar Tech Solutions",
      date: "15-6-2025",
      duration: "15 min",
      score: 82,
      status: "Excellent",
      statusColor: "text-green-700 bg-green-50 border-green-200",
    },
    {
      id: 2,
      title: "UI UX Designer",
      company: "Zee Frames",
      date: "14-6-2025",
      duration: "30 min",
      score: 75,
      status: "Good",
      statusColor: "text-yellow-700 bg-yellow-50 border-yellow-200",
    },
    {
      id: 3,
      title: "UI UX Designer",
      company: "Zee Frames",
      date: "25-6-2025",
      duration: "45 min",
      score: 90,
      status: "Excellent",
      statusColor: "text-green-700 bg-green-50 border-green-200",
    },
    {
      id: 4,
      title: "Data Scientist",
      company: "Quantum Analytics",
      date: "30-6-2025",
      duration: "60 min",
      score: 88,
      status: "Excellent",
      statusColor: "text-green-700 bg-green-50 border-green-200",
    },
    {
      id: 5,
      title: "Product Manager",
      company: "Innovate Corp",
      date: "02-7-2025",
      duration: "40 min",
      score: 70,
      status: "Good",
      statusColor: "text-yellow-700 bg-yellow-50 border-yellow-200",
    },
    {
      id: 6,
      title: "DevOps Engineer",
      company: "Tech Forward",
      date: "10-7-2025",
      duration: "50 min",
      score: 85,
      status: "Excellent",
      statusColor: "text-green-700 bg-green-50 border-green-200",
    },
    {
      id: 7,
      title: "Marketing Specialist",
      company: "Bright Future",
      date: "12-7-2025",
      duration: "25 min",
      score: 78,
      status: "Good",
      statusColor: "text-yellow-700 bg-yellow-50 border-yellow-200",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Recent Interviews
            </h1>
            <p className="text-gray-600">
              Track your progress and review past performances
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              <Download size={16} className="mr-2" />
              Export
            </button>
            <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              <Filter size={16} className="mr-2" />
              Filter
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search interviews by role, company, or date..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <select className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white">
            <option>All Status</option>
            <option>Excellent</option>
            <option>Good</option>
            <option>Needs Improvement</option>
          </select>
          <select className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 90 days</option>
            <option>All time</option>
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Interviews
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {interviews.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Average Score
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(
                  interviews.reduce(
                    (acc, interview) => acc + interview.score,
                    0
                  ) / interviews.length
                )}
                %
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Time
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {interviews.reduce(
                  (acc, interview) => acc + parseInt(interview.duration),
                  0
                )}{" "}
                min
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Success Rate
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(
                  (interviews.filter((i) => i.status === "Excellent").length /
                    interviews.length) *
                    100
                )}
                %
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Interviews List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Interview History
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {interviews.map((interview) => (
            <div
              key={interview.id}
              className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 space-y-2 sm:space-y-0">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base mb-1">
                        {interview.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        at {interview.company}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${interview.statusColor}`}
                      >
                        {interview.status}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{interview.date}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{interview.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{interview.score}% score</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to{" "}
              <span className="font-medium">{interviews.length}</span> of{" "}
              <span className="font-medium">{interviews.length}</span> results
            </p>
            <div className="flex items-center space-x-2">
              <button
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                disabled
              >
                Previous
              </button>
              <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">
                1
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
