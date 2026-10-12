export type UserRole = 'guest' | 'freelancer' | 'employer' | 'admin';
export type AccountStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'RESTRICTED';

export interface BankAccount {
  id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  isDefault?: boolean;
  createdAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  phone?: string;
  companyName?: string;
  taxCode?: string;
  isVerified: boolean; // ID/eKYC verification
  emailVerified: boolean; // Mandatory Email verification
  accountStatus: AccountStatus;
  kycStatus: 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED';
  createdAt?: string;
  lastLogin?: string;
  bio?: string;
  portfolioUrl?: string;
  skills?: string[];
  balance?: number; // Số dư khả dụng
  escrowBalance?: number; // Số dư đang khóa trong Escrow
  bankAccounts?: BankAccount[]; // Danh sách tài khoản ngân hàng đã đăng ký
}

export interface PortfolioItem {
  id: string;
  title: string;
  image: string;
  category: string;
  description: string;
  projectUrl?: string;
}

export interface FreelancerProfile {
  id: string;
  userId: string;
  name: string;
  title: string;
  avatar: string;
  bio: string; // Mô tả năng lực bản thân có thể làm những gì
  location: string;
  rating: number;
  reviewCount: number;
  completedOrders: number;
  hourlyRate?: number;
  skills: string[];
  talentCreditScore: number;
  talentCreditBadge: 'Bronze' | 'Silver' | 'Gold' | 'Top Rated';
  isVerified: boolean;
  portfolioUrl?: string; // Link portfolio chính (Behance / Github / Portfolio cá nhân)
  portfolio: PortfolioItem[];
}

export interface Project {
  id: string;
  title: string;
  category: string;
  employerId: string;
  employerName: string;
  employerAvatar: string;
  employerCompany?: string;
  employerVerified: boolean;
  budget: number; // VND
  budgetType: 'FIXED' | 'MILESTONE';
  deadline: string;
  description: string;
  requiredSkills: string[];
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  proposalsCount: number;
  createdAt: string;
}

export interface Proposal {
  id: string;
  projectId: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar: string;
  freelancerTitle: string;
  freelancerRating: number;
  freelancerCompletedCount: number;
  freelancerBio?: string;
  freelancerPortfolioUrl?: string;
  bidAmount: number; // VND
  estimatedDays: number;
  coverLetter: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'ORDER_IN_PROGRESS'
  | 'DELIVERED'
  | 'REVISION_REQUESTED'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'CANCELLED';

export interface Milestone {
  id: string;
  title: string;
  amount: number;
  status: 'PENDING' | 'ESCROW_FUNDED' | 'IN_PROGRESS' | 'DELIVERED' | 'ACCEPTED';
  dueDate: string;
}

export interface DeliveryFile {
  id: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  note: string;
  demoUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  serviceId?: string;
  serviceTitle: string;
  projectId?: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar: string;
  employerId: string;
  employerName: string;
  employerAvatar: string;
  totalAmount: number; // VND
  platformFee: number; // 10%
  freelancerPayoutAmount: number; // 90%
  status: OrderStatus;
  createdAt: string;
  deadline: string;
  autoAcceptDaysRemaining: number;
  milestones: Milestone[];
  deliveries: DeliveryFile[];
  revisionCount: number;
  maxRevisionsAllowed: number;
  sowRequirements: string[];
  notes?: string;
  paymentMethod?: 'VNPAY_QR' | 'VNPAY_ATM' | 'VNPAY_VISA';
  vnpayTransactionId?: string;
}

export interface Review {
  id: string;
  orderId: string;
  orderTitle?: string;
  reviewerId?: string;
  reviewerName: string;
  reviewerAvatar: string;
  reviewerRole: 'employer' | 'freelancer';
  targetId?: string;
  targetName: string;
  rating: number; // 1 - 5 stars
  qualityRating?: number; // Tiêu chí chất lượng chuyên môn (1-5)
  deadlineRating?: number; // Tiêu chí đúng hạn tiến độ (1-5)
  communicationRating?: number; // Tiêu chí giao tiếp thái độ (1-5)
  comment: string;
  date: string;
  freelancerReply?: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  orderNumber: string;
  openedBy: string;
  openedByName: string;
  reason: string;
  evidenceNotes: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_EMPLOYER' | 'RESOLVED_FREELANCER' | 'PARTIAL_REFUND';
  createdAt: string;
  adminResolutionNote?: string;
}

export interface VNPayTransaction {
  id: string;
  orderId?: string;
  orderNumber?: string;
  amount: number;
  bankCode: string;
  transactionNo: string;
  cardType: string;
  payDate: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  type: 'ESCROW_DEPOSIT' | 'PAYOUT' | 'REFUND';
  description: string;
  userEmail: string;
}

export interface PlatformConfig {
  platformFeePercent: number; // 10%
  autoAcceptHours: number; // 72 hours
  minDepositAmount: number; // 100,000 VND
  disputeResolutionDays: number; // 3 days
}

export interface WithdrawalRequest {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  amount: number;
}

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface ProjectInvitation {
  id: string;
  projectId: string;
  projectTitle: string;
  projectCategory?: string;
  projectBudget: number;
  projectDeadline?: string;
  projectDescription?: string;
  employerId: string;
  employerName: string;
  employerCompany?: string;
  employerAvatar: string;
  freelancerId: string; // e.g. 'free-1'
  freelancerUserId: string; // e.g. 'usr-free-1'
  freelancerName: string;
  message?: string;
  status: InvitationStatus;
  createdAt: string;
  respondedAt?: string;
  declineReason?: string;
}

export interface AppNotification {
  id: string;
  userId: string; // 'all' or specific user id e.g. 'usr-emp-1'
  title: string;
  message: string;
  type: 'ESCROW' | 'PROPOSAL' | 'CONTRACT' | 'WITHDRAWAL' | 'SYSTEM' | 'REVIEW' | 'INVITATION';
  link: string; // URL path to navigate to when clicked
  isRead: boolean;
  createdAt: string;
  timeAgo?: string;
}


