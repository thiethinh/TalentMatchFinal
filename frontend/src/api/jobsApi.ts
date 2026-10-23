import { api } from './client';

export interface JobFilterParams {
  q?: string;
  category?: string;
  skill?: string;
  minBudget?: number;
  maxBudget?: number;
  deadline?: string;
  workType?: string[];
  level?: string[];
  duration?: string;
  featuredOnly?: boolean;
  verifiedOnly?: boolean;
  escrowOnly?: boolean;
  savedOnly?: boolean;
  sort?: string;
  page?: number;
  size?: number;
}

export interface JobItemDto {
  id: number;
  title: string;
  category: string;
  description: string;
  requiredSkills?: string;
  budget: number;
  priceType: string;
  deadline?: string;
  estimatedDurationDays?: number;
  featured: boolean;
  verified: boolean;
  workType?: string;
  experienceLevel?: string;
  escrowFunded: boolean;
  status: string;
  createdAt: string;
  postedAgo: string;
  proposalCount: number;
  daysLeft: number;
  matchScore: number;
  isSaved: boolean;
  applicationStatus?: string;
  customerName?: string;
  customerLocation?: string;
}

export interface JobListResponse {
  items: JobItemDto[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  allJobsCount: number;
  categories: string[];
  categoryCounts: Record<string, number>;
}

export const jobsApi = {
  getJobs: async (params?: JobFilterParams): Promise<JobListResponse> => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          if (Array.isArray(val)) {
            val.forEach((v) => query.append(key, v));
          } else {
            query.append(key, String(val));
          }
        }
      });
    }
    const qStr = query.toString();
    return api.get(`/jobs${qStr ? `?${qStr}` : ''}`);
  },

  getJobDetail: async (id: number | string): Promise<any> => {
    return api.get(`/jobs/${id}`);
  },

  toggleSaveJob: async (id: number | string): Promise<{ saved: boolean; message: string }> => {
    return api.post(`/jobs/${id}/save`);
  },

  applyJob: async (id: number | string, payload: { coverLetter: string; proposedBudget: number; estimatedDays: number }): Promise<any> => {
    return api.post(`/jobs/${id}/apply`, payload);
  },
};
