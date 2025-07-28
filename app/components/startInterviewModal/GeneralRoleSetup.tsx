// "use client";

// import { useState, useEffect } from "react";
// import { Upload, FileText, Search, Loader2 } from "lucide-react";
// import { getToken } from "@/app/utils/constants";
// import { GeneralFormData } from "./StartInterviewModal";

// interface GeneralRoleSetupProps {
//   formData: GeneralFormData;
//   onFormDataChange: (data: GeneralFormData) => void;
//   resumeFile: File | null;
//   useExistingResume: boolean;
//   onResumeUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
//   onUseExistingResume: () => void;
//   isLoading: boolean;
// }

// interface Occupation {
//   id: string;
//   name: string;
//   levelName: string;
// }

// interface OccupationsResponse {
//   success: boolean;
//   data: {
//     occupations: Occupation[];
//     pagination: {
//       page: number;
//       limit: number;
//       total: number;
//       pages: number;
//       hasNextPage: boolean;
//       hasPrevPage: boolean;
//     };
//     meta: {
//       totalOccupations: number;
//       filteredCount: number;
//     };
//   };
// }

// export default function GeneralRoleSetup({
//   formData,
//   onFormDataChange,
//   resumeFile,
//   useExistingResume,
//   onResumeUpload,
//   onUseExistingResume,
//   isLoading,
// }: GeneralRoleSetupProps) {
//   const [occupations, setOccupations] = useState<Occupation[]>([]);
//   const [loadingOccupations, setLoadingOccupations] = useState(false);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [hasNextPage, setHasNextPage] = useState(false);
//   const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
//     null
//   );

//   const token = getToken();

//   useEffect(() => {
//     fetchOccupations(1, true);
//   }, []);

//   useEffect(() => {
//     if (searchTimeout) {
//       clearTimeout(searchTimeout);
//     }

//     const timeout = setTimeout(() => {
//       if (searchQuery !== "") {
//         fetchOccupations(1, true, searchQuery);
//       } else {
//         fetchOccupations(1, true);
//       }
//     }, 500);

//     setSearchTimeout(timeout);

//     return () => {
//       if (timeout) {
//         clearTimeout(timeout);
//       }
//     };
//   }, [searchQuery]);

//   const fetchOccupations = async (
//     page: number = 1,
//     reset: boolean = false,
//     search: string = ""
//   ) => {
//     if (reset) {
//       setLoadingOccupations(true);
//     } else {
//       setLoadingMore(true);
//     }

//     try {
//       const params = new URLSearchParams({
//         page: page.toString(),
//         limit: "20",
//       });

//       if (search.trim()) {
//         params.append("search", search.trim());
//       }

//       const response = await fetch(
//         `${
//           process.env.NEXT_PUBLIC_BACKEND_URL
//         }/api/recommendations/occupations?${params.toString()}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.ok) {
//         const data: OccupationsResponse = await response.json();
//         if (data.success) {
//           if (reset) {
//             setOccupations(data.data.occupations);
//           } else {
//             setOccupations((prev) => [...prev, ...data.data.occupations]);
//           }
//           setCurrentPage(data.data.pagination.page);
//           setHasNextPage(data.data.pagination.hasNextPage);
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching occupations:", error);
//     } finally {
//       setLoadingOccupations(false);
//       setLoadingMore(false);
//     }
//   };

//   const handleLoadMore = () => {
//     if (hasNextPage && !loadingMore) {
//       fetchOccupations(currentPage + 1, false, searchQuery);
//     }
//   };

//   return (
//     <div>
//       <h3 className="text-lg font-semibold text-gray-900 mb-4">
//         General Role Setup
//       </h3>

//       {/* Occupation Name */}
//       <div className="mb-4">
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Occupation Name <span className="text-red-500">*</span>
//         </label>

//         {/* Search Input */}
//         <div className="relative mb-2">
//           <Search
//             size={16}
//             className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//           />
//           <input
//             type="text"
//             placeholder="Search occupations..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full pl-10 pr-4 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             disabled={isLoading}
//           />
//         </div>

//         {/* Occupation Select */}
//         <div className="relative">
//           <select
//             value={formData.occupationName}
//             onChange={(e) =>
//               onFormDataChange({
//                 ...formData,
//                 occupationName: e.target.value,
//               })
//             }
//             className="w-full p-2 rounded-xl  bg-white shadow-sm transition-all duration-200 text-gray-800 font-medium"
//             disabled={isLoading || loadingOccupations}
//             required
//             size={
//               occupations.length > 10 ? 10 : Math.max(occupations.length, 3)
//             }
//             style={{
//               height: "auto",
//               minHeight: "140px",
//               maxHeight: "320px",
//               background: "white",
//             }}
//           >
//             <option
//               value=""
//               className="p-3 text-gray-500 bg-gray-50 font-medium"
//             >
//               {loadingOccupations
//                 ? "Loading occupations..."
//                 : "Select occupation"}
//             </option>
//             {occupations.map((occupation) => (
//               <option
//                 key={occupation.id}
//                 value={occupation.name}
//                 className="p-3 text-gray-800 hover:bg-purple-50 font-medium border-b border-gray-100 last:border-b-0"
//                 style={{
//                   backgroundColor:
//                     formData.occupationName === occupation.name
//                       ? "#8B5CF6"
//                       : "white",
//                   color:
//                     formData.occupationName === occupation.name
//                       ? "white"
//                       : "#374151",
//                   padding: "12px 16px",
//                   borderBottom: "1px solid #F3F4F6",
//                 }}
//               >
//                 {occupation.name}
//               </option>
//             ))}
//           </select>

//           {/* Load More Button */}
//           {hasNextPage && (
//             <div className="mt-2">
//               <button
//                 type="button"
//                 onClick={handleLoadMore}
//                 disabled={loadingMore || isLoading}
//                 className="w-full p-2 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//               >
//                 {loadingMore ? (
//                   <>
//                     <Loader2 size={14} className="mr-2 animate-spin" />
//                     Loading more...
//                   </>
//                 ) : (
//                   `Load More (${occupations.length} of many)`
//                 )}
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Resume Details */}
//       <div className="mb-4">
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Resume Details
//         </label>
//         <div className="grid grid-cols-2 gap-3">
//           <label
//             className={`
//               flex items-center justify-center p-3 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer
//               ${resumeFile ? "ring-2 ring-blue-500" : ""}
//               ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
//             `}
//           >
//             <Upload size={16} className="mr-2 text-blue-600" />
//             <span className="text-sm text-blue-700">
//               {resumeFile
//                 ? resumeFile.name.substring(0, 15) + "..."
//                 : "Upload Resume"}
//             </span>
//             <input
//               type="file"
//               accept=".pdf,.doc,.docx"
//               onChange={onResumeUpload}
//               className="hidden"
//               disabled={isLoading}
//             />
//           </label>
//           <button
//             type="button"
//             onClick={onUseExistingResume}
//             className={`
//               flex items-center justify-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors
//               ${useExistingResume ? "ring-2 ring-green-500 bg-green-50" : ""}
//               ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
//             `}
//             disabled={isLoading}
//           >
//             <FileText
//               size={16}
//               className={`mr-2 ${
//                 useExistingResume ? "text-green-600" : "text-gray-500"
//               }`}
//             />
//             <span
//               className={`text-sm ${
//                 useExistingResume ? "text-green-700" : "text-gray-600"
//               }`}
//             >
//               Existing Resume
//             </span>
//           </button>
//         </div>
//         {resumeFile && (
//           <p className="text-xs text-green-600 mt-2">
//             ✓ {resumeFile.name} selected
//           </p>
//         )}
//         {useExistingResume && (
//           <p className="text-xs text-green-600 mt-2">
//             ✓ Using existing resume from profile
//           </p>
//         )}
//       </div>

//       {/* Additional Focus Areas */}
//       <div className="mb-4">
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Additional Focus Areas{" "}
//           <span className="text-gray-500">(Optional)</span>
//         </label>
//         <textarea
//           value={formData.additionalFocusAreas}
//           onChange={(e) =>
//             onFormDataChange({
//               ...formData,
//               additionalFocusAreas: e.target.value,
//             })
//           }
//           placeholder="Any specific areas you'd like to focus on or provide a list of questions..."
//           className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//           rows={3}
//           disabled={isLoading}
//         />
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, FileText, ChevronDown, Loader2, X } from "lucide-react";
import { getToken } from "@/app/utils/constants";
import { GeneralFormData } from "./StartInterviewModal";

interface GeneralRoleSetupProps {
  formData: GeneralFormData;
  onFormDataChange: (data: GeneralFormData) => void;
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

export default function GeneralRoleSetup({
  formData,
  onFormDataChange,
  resumeFile,
  useExistingResume,
  onResumeUpload,
  onUseExistingResume,
  isLoading,
}: GeneralRoleSetupProps) {
  const [occupations, setOccupations] = useState<Occupation[]>([]);
  const [loadingOccupations, setLoadingOccupations] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
        setIsDropdownOpen(true);
      } else {
        fetchOccupations(1, true);
        setIsDropdownOpen(false);
      }
      setHighlightedIndex(-1);
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const handleOccupationSelect = (occupationName: string) => {
    setSearchQuery(occupationName);
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);

    onFormDataChange({
      ...formData,
      occupationName: occupationName,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim() === "") {
      onFormDataChange({
        ...formData,
        occupationName: "",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || occupations.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < occupations.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < occupations.length) {
          handleOccupationSelect(occupations[highlightedIndex].name);
        }
        break;
      case "Escape":
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const clearSelection = () => {
    setSearchQuery("");
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
    onFormDataChange({
      ...formData,
      occupationName: "",
    });
    inputRef.current?.focus();
  };

  const filteredOccupations = occupations.filter((occ) =>
    occ.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        General Role Setup
      </h3>

      {/* AutoComplete Occupation Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Occupation Name <span className="text-red-500">*</span>
        </label>

        <div className="relative" ref={dropdownRef}>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type to search occupations..."
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (searchQuery.trim() !== "" || occupations.length > 0) {
                  setIsDropdownOpen(true);
                }
              }}
              className="w-full p-3 pr-20 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
              required
            />

            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSelection}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  disabled={isLoading}
                >
                  <X size={16} className="text-gray-400" />
                </button>
              )}

              {loadingOccupations ? (
                <Loader2 size={16} className="text-blue-500 animate-spin" />
              ) : (
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              )}
            </div>
          </div>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {loadingOccupations && occupations.length === 0 ? (
                <div className="p-3 text-center text-gray-500">
                  <Loader2 size={16} className="inline animate-spin mr-2" />
                  Loading occupations...
                </div>
              ) : filteredOccupations.length === 0 ? (
                <div className="p-3 text-center text-gray-500">
                  No occupations found
                </div>
              ) : (
                <>
                  {filteredOccupations.map((occupation, index) => (
                    <div
                      key={occupation.id}
                      className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                        index === highlightedIndex
                          ? "bg-blue-50 text-blue-700"
                          : formData.occupationName === occupation.name
                          ? "bg-purple-50 text-purple-700"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleOccupationSelect(occupation.name)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <div className="font-medium">{occupation.name}</div>
                    </div>
                  ))}

                  {/* Load More Button */}
                  {hasNextPage && (
                    <div className="p-2 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleLoadMore}
                        disabled={loadingMore || isLoading}
                        className="w-full p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                </>
              )}
            </div>
          )}
        </div>
      </div>

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
          placeholder="Any specific areas you'd like to focus on or provide a list of questions..."
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
