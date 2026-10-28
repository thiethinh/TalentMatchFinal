import { api } from './client';

export interface UserDto {
  id: number;
  email: string;
  fullName: string;
  role: 'FREELANCER' | 'CUSTOMER' | 'ADMIN' | string;
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string;
  field?: string;
  hourlyRate?: number;
  professionalTitle?: string;
  companyName?: string;
  companySize?: string;
  talentCreditBalance?: number;
  rating?: number;
  emailVerified: boolean;
  enabled: boolean;
  authenticated?: boolean;
  notice?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'FREELANCER' | 'CUSTOMER';
  agreeTerms: boolean;
}

export interface RegisterResponse {
  success?: boolean;
  requiresOtp?: boolean;
  authenticated?: boolean;
  email?: string;
  fullName?: string;
  role?: string;
  message?: string;
}

export const authApi = {
  getMe: async (): Promise<UserDto & { authenticated: boolean; requiresOtp?: boolean }> => {
    return api.get('/auth/me');
  },

  login: async (payload: LoginPayload): Promise<UserDto & { authenticated: boolean; message?: string; requiresOtp?: boolean }> => {
    return api.post('/auth/login', payload);
  },

  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    return api.post('/auth/register', payload);
  },

  verifyOtp: async (email: string, otp: string): Promise<UserDto & { authenticated: boolean; message?: string }> => {
    return api.post('/auth/verify-otp', { email, otp });
  },

  resendOtp: async (email: string): Promise<{ message: string }> => {
    return api.post('/auth/resend-otp', { email });
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    return api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (payload: { email: string; otp?: string; token?: string; password: string; confirmPassword: string }): Promise<{ message: string }> => {
    return api.post('/auth/reset-password', payload);
  },

  logout: async (): Promise<{ message: string }> => {
    return api.post('/auth/logout');
  },
};
