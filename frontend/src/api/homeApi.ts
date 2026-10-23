import { api } from './client';

export interface FeaturedJob {
  id: number;
  title: string;
  category: string;
  description?: string;
  requiredSkills?: string;
  budget: number;
  priceType: 'FIXED' | 'HOURLY' | string;
  deadline?: string;
  estimatedDurationDays?: number;
  featured?: boolean;
  verified?: boolean;
  escrowFunded?: boolean;
  workType?: string;
  experienceLevel?: string;
  status: string;
  createdAt: string;
  customer?: {
    id: number;
    fullName: string;
    companyName?: string;
    location?: string;
    avatar?: string;
  };
}

export interface FeaturedFreelancer {
  id: number;
  fullName: string;
  email: string;
  avatar?: string;
  location?: string;
  professionalTitle?: string;
  bio?: string;
  skills?: string;
  hourlyRate?: number;
  rating?: number;
  completedProjects?: number;
  experienceYears?: number;
  talentCreditBalance?: number;
}

export interface HomeOverviewData {
  featuredJobs: FeaturedJob[];
  proposalCounts: Record<number, number>;
  featuredFreelancers: FeaturedFreelancer[];
  freelancerCount: number;
  customerCount: number;
  openJobCount: number;
}

export const homeApi = {
  getOverview: async (): Promise<HomeOverviewData> => {
    return api.get<HomeOverviewData>('/home/overview');
  },

  getFreelancers: async (q?: string): Promise<{ freelancers: FeaturedFreelancer[]; total: number; q?: string }> => {
    const params = q ? `?q=${encodeURIComponent(q)}` : '';
    return api.get(`/freelancers${params}`);
  },

  getFreelancerProfile: async (id: number | string): Promise<FeaturedFreelancer> => {
    return api.get(`/freelancers/${id}`);
  },
};
