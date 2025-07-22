// components/dashboard/AIEmergingCareersSetup.tsx
"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, Search, Loader2, RefreshCw } from "lucide-react";
import { getToken } from "@/app/utils/constants";
import { AIFormData } from "./StartInterviewModal";

interface AIEmergingCareersSetupProps {
  formData: AIFormData;
  onFormDataChange: (data: AIFormData) => void;
  resumeFile: File | null;
  useExistingResume: boolean;
  onResumeUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUseExistingResume: () => void;
  isLoading: boolean;
}

interface Occupation {
  id: string;
  name: string;
  levelName: string;
}

interface OccupationsResponse {
  success: boolean;
  data: {
    occupations: Occupation[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    meta: {
      totalOccupations: number;
      filteredCount: number;
    };
  };
}

interface RecommendationOccupation {
  id: string;
  name: string;
  ai_automation_risk_score: string;
  score: number;
  _id: string;
}

interface RecommendationsData {
  _id: string;
  occupationId: number;
  top_3_similar_occupations: RecommendationOccupation[];
  top_3_lateral_occupations: RecommendationOccupation[];
  top_3_advance_occupations: RecommendationOccupation[];
  __v: number;
}

interface RecommendationsResponse {
  success: boolean;
  data: RecommendationsData | RecommendationOccupation[];
}

export default function AIEmergingCareersSetup({
  formData,
  onFormDataChange,
  resumeFile,
  useExistingResume,
  onResumeUpload,
  onUseExistingResume,
  isLoading,
}: AIEmergingCareersSetupProps) {
  const [occupations, setOccupations] = useState<Occupation[]>([]);
  const [loadingOccupations, setLoadingOccupations] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [recommendations, setRecommendations] =
    useState<RecommendationsData | null>(null);

  const token = getToken();

  useEffect(() => {
    fetchOccupations(1, true);
  }, []);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      if (searchQuery !== "") {
        fetchOccupations(1, true, searchQuery);
      } else {
        fetchOccupations(1, true);
      }
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [searchQuery]);

  const fetchOccupations = async (
    page: number = 1,
    reset: boolean = false,
    search: string = ""
  ) => {
    if (reset) {
      setLoadingOccupations(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (search.trim()) {
        params.append("search", search.trim());
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/api/recommendations/occupations?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data: OccupationsResponse = await response.json();
        if (data.success) {
          if (reset) {
            setOccupations(data.data.occupations);
          } else {
            setOccupations((prev) => [...prev, ...data.data.occupations]);
          }
          setCurrentPage(data.data.pagination.page);
          setHasNextPage(data.data.pagination.hasNextPage);
        }
      }
    } catch (error) {
      console.error("Error fetching occupations:", error);
    } finally {
      setLoadingOccupations(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (hasNextPage && !loadingMore) {
      fetchOccupations(currentPage + 1, false, searchQuery);
    }
  };

  const fetchRecommendations = async (
    occupationName: string,
    occupationId: string
  ) => {
    if (!occupationName.trim() || !occupationId.trim()) return;

    setLoadingRecommendations(true);
    setRecommendations(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/recommendations/get-recommendations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            occupation: occupationName,
            id: occupationId,
          }),
        }
      );

      if (response.ok) {
        const data: RecommendationsResponse = await response.json();
        if (data.success) {
          // Check if data is the new format or legacy format
          if (Array.isArray(data.data)) {
            // Legacy format - update formData
            onFormDataChange({
              ...formData,
              recommendedOccupations: data.data || [],
            });
          } else {
            // New format - set recommendations
            setRecommendations(data.data);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleOccupationSelect = (occupationName: string) => {
    onFormDataChange({
      ...formData,
      selectedOccupation: occupationName,
    });

    // Find the selected occupation object to get its ID
    const selectedOccupation = occupations.find(
      (occ) => occ.name === occupationName
    );
    if (selectedOccupation) {
      fetchRecommendations(occupationName, selectedOccupation.id);
    }
  };

  const handleRecommendationSelect = (occupationName: string) => {
    onFormDataChange({
      ...formData,
      selectedOccupation: occupationName,
    });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        AI Emerging Careers Setup
      </h3>

      {/* Manual Occupation Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Base Occupation <span className="text-red-500">*</span>
        </label>

        {/* Search Input */}
        <div className="relative mb-2">
          <Search
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search occupations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        {/* Occupation Select */}
        <div className="relative">
          <select
            value={formData.selectedOccupation}
            onChange={(e) => handleOccupationSelect(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading || loadingOccupations}
            required
            size={
              occupations.length > 10 ? 10 : Math.max(occupations.length, 3)
            }
            style={{ height: "auto", minHeight: "120px", maxHeight: "300px" }}
          >
            <option value="">
              {loadingOccupations
                ? "Loading occupations..."
                : "Select occupation"}
            </option>
            {occupations.map((occupation) => (
              <option key={occupation.id} value={occupation.name}>
                {occupation.name}
              </option>
            ))}
          </select>

          {/* Load More Button */}
          {hasNextPage && (
            <div className="mt-2">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore || isLoading}
                className="w-full p-2 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loadingMore ? (
                  <>
                    <Loader2 size={14} className="mr-2 animate-spin" />
                    Loading more...
                  </>
                ) : (
                  `Load More (${occupations.length} of many)`
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Recommendations Status */}
      {formData.selectedOccupation && (
        <div className="mb-4">
          <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex-1">
              <span className="text-sm text-gray-700">
                Base Occupation: <strong>{formData.selectedOccupation}</strong>
              </span>
            </div>
            {loadingRecommendations && (
              <div className="flex items-center text-sm text-blue-600">
                <Loader2 size={16} className="animate-spin mr-2" />
                Getting AI recommendations...
              </div>
            )}
            {!loadingRecommendations && recommendations && (
              <div className="flex items-center text-sm text-green-600">
                <RefreshCw size={16} className="mr-2" />
                Recommendations loaded
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Recommendations - Categorized Display */}
      {recommendations && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            AI Career Recommendations
          </h4>

          {/* Three columns layout */}
          <div className="grid grid-cols-3 gap-4">
            {/* Top 3 Similar Career */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h5 className="text-sm font-semibold text-blue-600 mb-4">
                Top 3 Similar Career
              </h5>
              <div className="space-y-3">
                {recommendations.top_3_similar_occupations?.map(
                  (occupation) => (
                    <div
                      key={occupation.id}
                      className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-all ${
                        formData.selectedOccupation === occupation.name
                          ? "bg-blue-100"
                          : "hover:bg-white"
                      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() =>
                        !isLoading &&
                        handleRecommendationSelect(occupation.name)
                      }
                    >
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={
                            formData.selectedOccupation === occupation.name
                          }
                          onChange={() => {}}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {occupation.name}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Top 3 Advancements */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h5 className="text-sm font-semibold text-blue-600 mb-4">
                Top 3 Advancements
              </h5>
              <div className="space-y-3">
                {recommendations.top_3_advance_occupations?.map(
                  (occupation) => (
                    <div
                      key={occupation.id}
                      className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-all ${
                        formData.selectedOccupation === occupation.name
                          ? "bg-blue-100"
                          : "hover:bg-white"
                      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() =>
                        !isLoading &&
                        handleRecommendationSelect(occupation.name)
                      }
                    >
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={
                            formData.selectedOccupation === occupation.name
                          }
                          onChange={() => {}}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {occupation.name}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Top 3 Lateral Transitions */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h5 className="text-sm font-semibold text-blue-600 mb-4">
                Top 3 Lateral Transitions
              </h5>
              <div className="space-y-3">
                {recommendations.top_3_lateral_occupations?.map(
                  (occupation) => (
                    <div
                      key={occupation.id}
                      className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-all ${
                        formData.selectedOccupation === occupation.name
                          ? "bg-blue-100"
                          : "hover:bg-white"
                      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() =>
                        !isLoading &&
                        handleRecommendationSelect(occupation.name)
                      }
                    >
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={
                            formData.selectedOccupation === occupation.name
                          }
                          onChange={() => {}}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {occupation.name}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resume Details */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Resume Details
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`
              flex items-center justify-center p-3 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer
              ${resumeFile ? "ring-2 ring-blue-500" : ""}
              ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <Upload size={16} className="mr-2 text-blue-600" />
            <span className="text-sm text-blue-700">
              {resumeFile
                ? resumeFile.name.substring(0, 15) + "..."
                : "Upload Resume"}
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={onResumeUpload}
              className="hidden"
              disabled={isLoading}
            />
          </label>
          <button
            type="button"
            onClick={onUseExistingResume}
            className={`
              flex items-center justify-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors
              ${useExistingResume ? "ring-2 ring-green-500 bg-green-50" : ""}
              ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
            `}
            disabled={isLoading}
          >
            <FileText
              size={16}
              className={`mr-2 ${
                useExistingResume ? "text-green-600" : "text-gray-500"
              }`}
            />
            <span
              className={`text-sm ${
                useExistingResume ? "text-green-700" : "text-gray-600"
              }`}
            >
              Existing Resume
            </span>
          </button>
        </div>
        {resumeFile && (
          <p className="text-xs text-green-600 mt-2">
            ✓ {resumeFile.name} selected
          </p>
        )}
        {useExistingResume && (
          <p className="text-xs text-green-600 mt-2">
            ✓ Using existing resume from profile
          </p>
        )}
      </div>

      {/* Additional Focus Areas */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Focus Areas{" "}
          <span className="text-gray-500">(Optional)</span>
        </label>
        <textarea
          value={formData.additionalFocusAreas}
          onChange={(e) =>
            onFormDataChange({
              ...formData,
              additionalFocusAreas: e.target.value,
            })
          }
          placeholder="Any specific emerging career skills or AI-related areas you'd like to focus on..."
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
