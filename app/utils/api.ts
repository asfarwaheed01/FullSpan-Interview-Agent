// utils/api.ts
import axios, { AxiosResponse } from "axios";
import { InterviewFormData, InterviewResponse } from "../interfaces/interview";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("interview_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("interview_token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export const interviewAPI = {
  startInterview: async (
    data: InterviewFormData
  ): Promise<InterviewResponse> => {
    const response: AxiosResponse<InterviewResponse> = await api.post(
      "/start-interview",
      data
    );
    return response.data;
  },

  endInterview: async (roomName: string): Promise<void> => {
    await api.post("/end-interview", { room_name: roomName });
  },
};

export default api;
