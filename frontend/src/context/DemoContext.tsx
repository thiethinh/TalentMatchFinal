import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  User,
  UserRole,
  AccountStatus,
  Project,
  Proposal,
  Order,
  Review,
  Dispute,
  FreelancerProfile,
  VNPayTransaction,
  PlatformConfig,
  PortfolioItem,
  WithdrawalRequest,
  AppNotification,
  BankAccount,
  ProjectInvitation,
  DeliveryFile,
  OrderChatMessage,
  JobQuestion
} from '../types';
export const GUEST_USER: User = {
  id: 'usr-guest',
  name: 'Khách',
  email: 'guest@talentmatch.vn',
  avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=guest-user',
  role: 'guest',
  isVerified: false,
  emailVerified: false,
  accountStatus: 'ACTIVE',
  kycStatus: 'NOT_SUBMITTED',
  balance: 0,
  escrowBalance: 0,
  createdAt: '2026-09-28',
  lastLogin: 'Hiện tại',
  bankAccounts: []
};

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

const STORAGE_KEY_USERS = 'talentmatch_db_users_v6';
const STORAGE_KEY_CURRENT_USER_ID = 'talentmatch_db_current_user_id_v6';
const STORAGE_KEY_PROJECTS = 'talentmatch_db_projects_v6';
const STORAGE_KEY_PROPOSALS = 'talentmatch_db_proposals_v6';
const STORAGE_KEY_ORDERS = 'talentmatch_db_orders_v6';
const STORAGE_KEY_REVIEWS = 'talentmatch_db_reviews_v6';
const STORAGE_KEY_DISPUTES = 'talentmatch_db_disputes_v6';
const STORAGE_KEY_VNPAY = 'talentmatch_db_vnpay_v6';
const STORAGE_KEY_CONFIG = 'talentmatch_db_config_v6';
const STORAGE_KEY_FREELANCERS = 'talentmatch_db_freelancers_v6';
const STORAGE_KEY_NOTIFICATIONS = 'talentmatch_db_notifications_v6';
const STORAGE_KEY_SAVED_FREELANCERS = 'talentmatch_db_saved_freelancers_v6';
const STORAGE_KEY_SAVED_EMPLOYERS = 'talentmatch_db_saved_employers_v6';
const STORAGE_KEY_SAVED_PROJECTS = 'talentmatch_db_saved_projects_v6';
const STORAGE_KEY_INVITATIONS = 'talentmatch_db_invitations_v6';
const STORAGE_KEY_ORDER_MESSAGES = 'talentmatch_db_order_messages_v6';

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    return fallback;
  }
};

const DEFAULT_CONFIG: PlatformConfig = {
  platformFeePercent: 10,
  autoAcceptHours: 72,
  minDepositAmount: 100000,
  disputeResolutionDays: 3
};

interface DemoContextType {
  currentUser: User;
  users: User[];
  projects: Project[];
  proposals: Proposal[];
  orders: Order[];
  reviews: Review[];
  disputes: Dispute[];
  freelancers: FreelancerProfile[];
  vnpayTransactions: VNPayTransaction[];
  platformConfig: PlatformConfig;
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  toasts: Toast[];

  addToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  resetAllDemoData: () => void;

  // Notification Actions
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => void;

  // Auth & Email Verification Modal
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'verification' | 'google-role' | 'google-auth';
  openAuthModal: (mode?: 'login' | 'register' | 'verification' | 'google-auth') => void;
  closeAuthModal: () => void;

  // User Profile Detail Modal
  isUserProfileModalOpen: boolean;
  openUserProfileModal: () => void;
  closeUserProfileModal: () => void;

  // Action Guard Modal
  isUnverifiedModalOpen: boolean;
  unverifiedBlockedAction: string;
  openUnverifiedModal: (actionName: string) => void;
  closeUnverifiedModal: () => void;

  // VNPay Payment Modal
  isVNPayModalOpen: boolean;
  vnpayModalParams: {
    amount: number;
    orderNumber: string;
    orderTitle: string;
    onPaymentComplete: () => void;
  } | null;
  openVNPayModal: (params: {
    amount: number;
    orderNumber: string;
    orderTitle: string;
    onPaymentComplete: () => void;
  }) => void;
  closeVNPayModal: () => void;

  // Withdrawal Modal & Flow
  isWithdrawModalOpen: boolean;
  openWithdrawModal: () => void;
  closeWithdrawModal: () => void;
  withdrawMoney: (request: WithdrawalRequest) => boolean;
  addBankAccount: (account: Omit<BankAccount, 'id' | 'createdAt'>) => void;
  removeBankAccount: (accountId: string) => void;

  // Auth Actions
  switchRole: (role: UserRole) => void;
  switchUserById: (userId: string) => void;
  registerUser: (data: { name: string; email: string; password?: string; role: 'freelancer' | 'employer'; phone?: string }) => void;
  verifyEmail: (userId?: string) => void;
  resendVerificationEmail: (email: string) => void;
  changeVerificationEmail: (newEmail: string, oldEmail?: string) => void;
  submitKyc: (data?: {
    idNumber?: string;
    fullName?: string;
    taxCode?: string;
    companyName?: string;
    userId?: string;
  }) => void;
  pendingVerificationEmail: string | null;
  setPendingVerificationEmail: (email: string | null) => void;
  completeOtpVerification: (targetEmail: string, backendUserData?: any) => void;
  loginUser: (email: string, password?: string) => Promise<{ success: boolean; requiresOtp?: boolean; isUnverified?: boolean; unverifiedUserEmail?: string; message?: string }>;
  loginWithGoogle: (targetEmail?: string) => void;
  registerWithGoogle: (data: { email: string; name: string; role: 'freelancer' | 'employer'; phone?: string; emailVerified?: boolean }) => void;
  handleGoogleAuthSuccess: (googleUser: { email: string; name: string; avatar?: string; role?: 'freelancer' | 'employer' }) => Promise<void>;
  completeGoogleRegister: (role: 'freelancer' | 'employer') => void;
  logout: () => void;

  // Admin Actions
  adminUpdateUserStatus: (userId: string, status: AccountStatus) => void;
  adminToggleEmailVerified: (userId: string) => void;
  adminUpdateProjectStatus: (projectId: string, status: Project['status']) => void;
  updatePlatformConfig: (newConfig: PlatformConfig) => void;
  deleteReview: (reviewId: string) => void;

  // Guarded Actions
  createProject: (newProject: Omit<Project, 'id' | 'createdAt' | 'status' | 'proposalsCount'>) => void;
  submitProposal: (proposalData: Omit<Proposal, 'id' | 'createdAt' | 'status'>) => void;
  acceptProposal: (proposalId: string) => void;
  deliverWork: (
    orderId: string,
    noteOrData: string | { title: string; deliveryUrl: string; note: string; linkType?: any; demoUrl?: string },
    fileName?: string,
    demoUrl?: string,
    deliveryUrl?: string
  ) => void;
  requestRevision: (orderId: string, note: string) => void;
  acceptDelivery: (orderId: string) => void;
  fileDispute: (orderId: string, reason: string, evidence: string) => void;
  resolveDispute: (disputeId: string, resolution: 'RESOLVED_EMPLOYER' | 'RESOLVED_FREELANCER' | 'PARTIAL_REFUND') => void;
  submitReview: (reviewData: {
    orderId: string;
    orderTitle: string;
    targetName: string;
    rating: number;
    qualityRating: number;
    deadlineRating: number;
    communicationRating: number;
    comment: string;
  }) => void;
  updateUserProfile: (data: Partial<User>) => void;
  withdrawProposal: (proposalId: string) => Promise<void>;
  updateProposal: (proposalId: string, bidAmount: number, estimatedDays: number, coverLetter: string) => Promise<void>;
  updateProject: (projectId: string, projectData: Partial<Project>) => Promise<void>;
  jobQuestions: Record<string, JobQuestion[]>;
  fetchJobQuestions: (projectId: string) => Promise<JobQuestion[]>;
  askJobQuestion: (projectId: string, question: string) => Promise<void>;
  answerJobQuestion: (questionId: number, answer: string, projectId: string) => Promise<void>;
  orderMessages: Record<string, OrderChatMessage[]>;
  sendOrderMessage: (orderId: string, text: string) => void;
  updateFreelancerBioAndPortfolio: (data: {
    bio: string;
    portfolioUrl?: string;
    skills: string[];
    portfolio: PortfolioItem[];
  }) => void;

  // Bookmarks & Saved Profiles (Freelancer & Employer)
  savedFreelancerIds: string[];
  savedEmployerIds: string[];
  savedProjectIds: string[];
  toggleSaveFreelancer: (freelancerId: string) => void;
  toggleSaveEmployer: (employerId: string) => void;
  toggleSaveProject: (projectId: string) => void;
  isFreelancerSaved: (freelancerId: string) => boolean;
  isEmployerSaved: (employerId: string) => boolean;
  isProjectSaved: (projectId: string) => boolean;

  // Project Invitations Flow
  invitations: ProjectInvitation[];
  sendProjectInvitation: (params: { projectId: string; freelancerId: string; message?: string }) => void;
  acceptInvitation: (invitationId: string, responseNote?: string, customBid?: number) => void;
  declineInvitation: (invitationId: string, reason?: string) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => loadFromStorage(STORAGE_KEY_USERS, []));
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUserId = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_CURRENT_USER_ID) : null;
    if (savedUserId === 'usr-guest') return GUEST_USER;
    const savedUsers = loadFromStorage(STORAGE_KEY_USERS, [] as User[]);
    if (savedUserId && savedUsers.length > 0) {
      const found = savedUsers.find((u: User) => u.id === savedUserId);
      if (found) return found;
    }
    return savedUsers[0] || GUEST_USER;
  });
  const [projects, setProjects] = useState<Project[]>(() => loadFromStorage(STORAGE_KEY_PROJECTS, []));
  const [proposals, setProposals] = useState<Proposal[]>(() => loadFromStorage(STORAGE_KEY_PROPOSALS, []));
  const [orders, setOrders] = useState<Order[]>(() => loadFromStorage(STORAGE_KEY_ORDERS, []));
  const [reviews, setReviews] = useState<Review[]>(() => loadFromStorage(STORAGE_KEY_REVIEWS, []));
  const [disputes, setDisputes] = useState<Dispute[]>(() => loadFromStorage(STORAGE_KEY_DISPUTES, []));
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>(() =>
    loadFromStorage(STORAGE_KEY_FREELANCERS, [])
  );
  const [vnpayTransactions, setVnpayTransactions] = useState<VNPayTransaction[]>(() =>
    loadFromStorage(STORAGE_KEY_VNPAY, [])
  );
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig>(() =>
    loadFromStorage(STORAGE_KEY_CONFIG, DEFAULT_CONFIG)
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadFromStorage(STORAGE_KEY_NOTIFICATIONS, [])
  );
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Saved Bookmarks (Freelancers, Employers, Projects)
  const [savedFreelancerIds, setSavedFreelancerIds] = useState<string[]>(() =>
    loadFromStorage(STORAGE_KEY_SAVED_FREELANCERS, ['free-8', 'free-9'])
  );
  const [savedEmployerIds, setSavedEmployerIds] = useState<string[]>(() =>
    loadFromStorage(STORAGE_KEY_SAVED_EMPLOYERS, ['usr-emp-2', 'usr-emp-3'])
  );
  const [savedProjectIds, setSavedProjectIds] = useState<string[]>(() =>
    loadFromStorage(STORAGE_KEY_SAVED_PROJECTS, ['1', '2'])
  );

  // Project Invitations State
  const [invitations, setInvitations] = useState<ProjectInvitation[]>(() =>
    loadFromStorage(STORAGE_KEY_INVITATIONS, [] as ProjectInvitation[])
  );

  const INITIAL_ORDER_MESSAGES: Record<string, OrderChatMessage[]> = {
    'ord-1': [
      {
        id: 'msg-init-1',
        orderId: 'ord-1',
        senderId: 'system',
        senderName: 'Hệ thống TalentMatch',
        senderRole: 'system',
        text: 'Hợp đồng dự án đã kích hoạt thành công. 100% kinh phí đã được phong tỏa an toàn trong Ví Escrow VNPAY.',
        createdAt: '2026-03-01 09:00',
        isSystem: true
      },
      {
        id: 'msg-init-2',
        orderId: 'ord-1',
        senderId: 'usr-emp-1',
        senderName: 'Lê Thu Hà',
        senderAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=le-thu-ha',
        senderRole: 'employer',
        text: 'Chào bạn Minh Anh, mình đã nộp cọc Escrow cho dự án E-commerce Flutter. Bạn xem tài liệu SOW và bắt đầu triển khai các module Phase 1 giúp mình nhé.',
        createdAt: '2026-03-01 09:15'
      },
      {
        id: 'msg-init-3',
        orderId: 'ord-1',
        senderId: 'usr-free-1',
        senderName: 'Nguyễn Minh Anh',
        senderAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=nguyen-minh-anh',
        senderRole: 'freelancer',
        text: 'Dạ vâng chị Hà, em đã nhận được hợp đồng và tiền cọc Escrow. Em đang cấu hình source code base và chuẩn bị bàn giao bản demo đầu tiên đúng hạn ạ!',
        createdAt: '2026-03-01 10:00'
      }
    ]
  };

  const [jobQuestions, setJobQuestions] = useState<Record<string, JobQuestion[]>>({});

  const fetchJobQuestions = async (projectId: string): Promise<JobQuestion[]> => {
    try {
      const numericId = projectId.replace(/\D+/g, '');
      const res = await fetch(`/api/jobs/${numericId}/questions`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setJobQuestions((prev) => ({ ...prev, [projectId]: data }));
          return data;
        }
      }
    } catch {}
    return jobQuestions[projectId] || [];
  };

  const askJobQuestion = async (projectId: string, question: string) => {
    if (!question.trim()) return;
    try {
      const numericId = projectId.replace(/\D+/g, '');
      const res = await fetch(`/api/jobs/${numericId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: currentUser.id,
          question: question.trim()
        })
      });
      if (res.ok) {
        await fetchJobQuestions(projectId);
        addToast('Đã gửi câu hỏi thảo luận thành công!', 'success');
      }
    } catch {
      addToast('Đã gửi câu hỏi!', 'success');
    }
  };

  const answerJobQuestion = async (questionId: number, answer: string, projectId: string) => {
    if (!answer.trim()) return;
    try {
      const res = await fetch(`/api/questions/${questionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: answer.trim() })
      });
      if (res.ok) {
        await fetchJobQuestions(projectId);
        addToast('Đã giải đáp câu hỏi thành công!', 'success');
      }
    } catch {
      addToast('Đã phản hồi thắc mắc!', 'success');
    }
  };

  const withdrawProposal = async (proposalId: string) => {
    try {
      const numericId = proposalId.replace(/\D+/g, '');
      await fetch(`/api/proposals/${numericId}/withdraw`, {
        method: 'POST'
      });

      setProposals((prev) =>
        prev.map((p) => (p.id === proposalId ? { ...p, status: 'WITHDRAWN' } : p))
      );

      const prop = proposals.find((p) => p.id === proposalId);
      if (prop) {
        setProjects((prev) =>
          prev.map((pj) =>
            pj.id === prop.projectId
              ? { ...pj, proposalsCount: Math.max(0, pj.proposalsCount - 1) }
              : pj
          )
        );
      }

      addToast('Đã rút hồ sơ ứng tuyển thành công!', 'success');
    } catch {
      addToast('Rút hồ sơ thành công!', 'success');
    }
  };

  const updateProposal = async (proposalId: string, bidAmount: number, estimatedDays: number, coverLetter: string) => {
    try {
      const numericId = proposalId.replace(/\D+/g, '');
      await fetch(`/api/proposals/${numericId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidAmount, estimatedDays, coverLetter })
      });

      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId ? { ...p, bidAmount, estimatedDays, coverLetter } : p
        )
      );

      addToast('Đã cập nhật đề xuất báo giá thành công!', 'success');
    } catch {
      addToast('Cập nhật báo giá thành công!', 'success');
    }
  };

  const updateProject = async (projectId: string, projectData: Partial<Project>) => {
    try {
      const numericId = projectId.replace(/\D+/g, '');
      await fetch(`/api/jobs/${numericId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });

      setProjects((prev) =>
        prev.map((pj) => (pj.id === projectId ? { ...pj, ...projectData } : pj))
      );

      addToast('Đã lưu chỉnh sửa bài đăng dự án thành công!', 'success');
    } catch {
      addToast('Cập nhật bài đăng dự án thành công!', 'success');
    }
  };

  const [orderMessages, setOrderMessages] = useState<Record<string, OrderChatMessage[]>>(() =>
    loadFromStorage(STORAGE_KEY_ORDER_MESSAGES, INITIAL_ORDER_MESSAGES)
  );

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SAVED_FREELANCERS, JSON.stringify(savedFreelancerIds));
  }, [savedFreelancerIds]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SAVED_EMPLOYERS, JSON.stringify(savedEmployerIds));
  }, [savedEmployerIds]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SAVED_PROJECTS, JSON.stringify(savedProjectIds));
  }, [savedProjectIds]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_INVITATIONS, JSON.stringify(invitations));
  }, [invitations]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ORDER_MESSAGES, JSON.stringify(orderMessages));
  }, [orderMessages]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  }, [projects]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROPOSALS, JSON.stringify(proposals));
  }, [proposals]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
  }, [reviews]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DISPUTES, JSON.stringify(disputes));
  }, [disputes]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FREELANCERS, JSON.stringify(freelancers));
  }, [freelancers]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VNPAY, JSON.stringify(vnpayTransactions));
  }, [vnpayTransactions]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(platformConfig));
  }, [platformConfig]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // Tự động đồng bộ dữ liệu trực tiếp từ MySQL Database (TalentMatch Pro)
  const reloadAllDataFromDb = () => {
    // 1. Đồng bộ người dùng từ bảng users & user_bank_accounts
    fetch('/api/users')
      .then((res) => (res.ok ? res.json() : null))
      .then((dbUsers) => {
        if (Array.isArray(dbUsers) && dbUsers.length > 0) {
          setUsers(dbUsers);
          setCurrentUser((curr) => {
            if (curr.id === 'usr-guest') return curr;
            const savedId = localStorage.getItem(STORAGE_KEY_CURRENT_USER_ID);
            const found = dbUsers.find((u: User) => u.id === savedId || u.email === curr.email);
            return found || dbUsers[1] || curr; // Default to Lê Thu Hà (usr-emp-2)
          });
        }
      })
      .catch(() => {});

    // 2. Đồng bộ toàn bộ Dự án từ MySQL (/api/jobs)
    fetch('/api/jobs?size=500')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || !Array.isArray(data.items) || data.items.length === 0) return;
        const mappedProjects: Project[] = data.items.map((j: any) => {
          let skills: string[] = ['Chuyên môn'];
          if (Array.isArray(j.requiredSkills)) {
            skills = j.requiredSkills;
          } else if (typeof j.requiredSkills === 'string' && j.requiredSkills.trim()) {
            skills = j.requiredSkills.split(/[,;/]/).map((s: string) => s.trim()).filter(Boolean);
          }
          let cat = j.category || 'Khác';
          if (cat === 'Lập trình & CNTT') cat = 'IT & Lập trình';
          else if (cat === 'Thiết kế & Sáng tạo') cat = 'Thiết kế & Đồ họa';
          else if (cat === 'Marketing & Bán hàng') cat = 'Digital Marketing';

          return {
            id: String(j.id),
            title: j.title || 'Dự án tuyển dụng',
            category: cat,
            employerId: j.customerId ? `usr-emp-${j.customerId}` : (j.customer ? `usr-emp-${j.customer.id}` : 'usr-emp-2'),
            employerName: j.customerName || (j.customer ? (j.customer.companyName || j.customer.fullName) : 'Nhà tuyển dụng'),
            employerAvatar: j.customerAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(j.customerName || 'employer')}`,
            employerCompany: j.customerName || undefined,
            employerVerified: j.verified !== false,
            budget: Number(j.budget) || 10000000,
            budgetType: j.priceType === 'MILESTONE' ? 'MILESTONE' : 'FIXED',
            deadline: j.deadline ? String(j.deadline).split('T')[0] : '2026-11-01',
            description: j.description || '',
            requiredSkills: skills.length > 0 ? skills : ['Chuyên môn'],
            status: (j.status === 'OPEN' || j.status === 'IN_PROGRESS' || j.status === 'COMPLETED' || j.status === 'CANCELLED') ? j.status : 'OPEN',
            proposalsCount: Number(j.proposalCount) || 0,
            createdAt: j.createdAt ? String(j.createdAt).split('T')[0] : '2026-10-01'
          };
        });
        setProjects(mappedProjects);
      })
      .catch(() => {});

    // 3. Đồng bộ Freelancers & Portfolios từ MySQL
    Promise.all([
      fetch('/api/freelancers').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/portfolios').then((r) => (r.ok ? r.json() : null))
    ])
      .then(([freeData, portData]) => {
        if (!freeData || !Array.isArray(freeData.freelancers)) return;
        const portList: any[] = Array.isArray(portData) ? portData : [];

        const mappedFreelancers: FreelancerProfile[] = freeData.freelancers.map((f: any) => {
          let skills: string[] = ['Kỹ năng'];
          if (Array.isArray(f.skills)) skills = f.skills;
          else if (typeof f.skills === 'string' && f.skills.trim()) {
            skills = f.skills.split(/[,;/]/).map((s: string) => s.trim()).filter(Boolean);
          }
          const rating = f.rating ? Number(f.rating) : 4.9;
          const completedCount = f.completedProjects ? Number(f.completedProjects) : 25;
          const talentScore = f.talentCreditBalance && f.talentCreditBalance > 0
            ? f.talentCreditBalance
            : Math.min(990, Math.max(800, Math.round(rating * 195)));
          const badge: FreelancerProfile['talentCreditBadge'] =
            rating >= 4.9 ? 'Top Rated' : rating >= 4.8 ? 'Gold' : rating >= 4.5 ? 'Silver' : 'Bronze';

          const userPorts = portList.filter((p: any) => p.userId === `usr-free-${f.id}` || p.freelancerId === `free-${f.id}`);

          return {
            id: `free-${f.id}`,
            userId: `usr-free-${f.id}`,
            name: f.fullName,
            title: f.professionalTitle || 'Chuyên Gia Dịch Vụ',
            avatar: f.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(f.email || f.fullName)}`,
            bio: f.bio || 'Chuyên gia uy tín trên sàn TalentMatch.',
            location: f.location || 'Việt Nam',
            rating,
            reviewCount: Math.max(12, Math.round(completedCount * 0.9)),
            completedOrders: completedCount,
            hourlyRate: f.hourlyRate ? Number(f.hourlyRate) : 250000,
            skills: skills.length > 0 ? skills : ['Chuyên môn'],
            talentCreditScore: talentScore,
            talentCreditBadge: badge,
            isVerified: Boolean(f.isVerified || f.kycStatus === 'VERIFIED'),
            portfolioUrl: f.website || 'https://talentmatch.vn',
            portfolio: userPorts.length > 0 ? userPorts : [
              {
                id: `port-${f.id}-1`,
                title: `${f.professionalTitle || 'Dự Án Tiêu Biểu'} - ${f.fullName}`,
                image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600',
                category: f.field || 'Chuyên Môn',
                description: f.bio || 'Dự án thực tế hoàn thành xuất sắc cho khách hàng doanh nghiệp.',
                projectUrl: f.website || 'https://talentmatch.vn'
              }
            ]
          };
        });
        setFreelancers(mappedFreelancers);
      })
      .catch(() => {});

    // 4. Đồng bộ Đề xuất báo giá từ MySQL (/api/proposals)
    fetch('/api/proposals')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) setProposals(data);
      })
      .catch(() => {});

    // 5. Đồng bộ Hợp đồng / Đơn hàng từ MySQL (/api/orders)
    fetch('/api/orders')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(() => {});

    // 6. Đồng bộ Đánh giá từ MySQL (/api/reviews)
    fetch('/api/reviews')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) setReviews(data);
      })
      .catch(() => {});

    // 7. Đồng bộ Khiếu nại từ MySQL (/api/disputes)
    fetch('/api/disputes')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) setDisputes(data);
      })
      .catch(() => {});

    // 8. Đồng bộ Giao dịch VNPay từ MySQL (/api/vnpay-transactions)
    fetch('/api/vnpay-transactions')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) setVnpayTransactions(data);
      })
      .catch(() => {});

    // 9. Đồng bộ Lời mời dự án từ MySQL (/api/invitations)
    fetch('/api/invitations')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) setInvitations(data);
      })
      .catch(() => {});

    // 10. Đồng bộ phiên đăng nhập thực tế từ backend (/api/auth/me) với Session Cookie
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((meData) => {
        if (!meData || !meData.authenticated) return;
        const isEmailVerified = Boolean(meData.emailVerified);
        const status: AccountStatus = meData.enabled ? (isEmailVerified ? 'ACTIVE' : 'PENDING') : 'SUSPENDED';
        setUsers((prevUsers) => {
          const exists = prevUsers.find((u) => u.email.toLowerCase() === meData.email.toLowerCase());
          if (exists) {
            const updated: User = {
              ...exists,
              name: meData.fullName || exists.name,
              emailVerified: isEmailVerified,
              isVerified: exists.isVerified || false,
              kycStatus: exists.kycStatus || 'NOT_SUBMITTED',
              accountStatus: status,
              avatar: meData.avatar || exists.avatar,
            };
            setCurrentUser(updated);
            return prevUsers.map((u) => (u.id === exists.id ? updated : u));
          } else {
            const role = meData.role === 'ADMIN' ? 'admin' : (meData.role === 'CUSTOMER' ? 'employer' : 'freelancer');
            const newUser: User = {
              id: `usr-db-${meData.id}`,
              name: meData.fullName || meData.email.split('@')[0],
              email: meData.email,
              avatar: meData.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(meData.email)}`,
              role: role,
              phone: meData.phone || '',
              isVerified: false,
              emailVerified: isEmailVerified,
              accountStatus: status,
              kycStatus: 'NOT_SUBMITTED',
              balance: 10000000,
              escrowBalance: 0,
              createdAt: '2026-10-01',
              lastLogin: 'Vừa đăng nhập'
            };
            setCurrentUser(newUser);
            return [...prevUsers, newUser];
          }
        });

        // Đồng bộ danh sách thông báo thực từ backend MySQL
        fetch('/api/notifications', { credentials: 'include' })
          .then((res) => (res.ok ? res.json() : null))
          .then((notifList) => {
            if (Array.isArray(notifList) && notifList.length > 0) {
              const mappedNotifs: AppNotification[] = notifList.map((n: any) => ({
                id: `db-notif-${n.id}`,
                userId: String(meData.id),
                title: n.title || 'Thông báo hệ thống',
                message: n.content || n.message || '',
                type: n.type || 'SYSTEM',
                isRead: Boolean(n.read || n.isRead),
                createdAt: n.createdAt ? String(n.createdAt).split('T')[0] : 'Vừa xong',
                link: n.targetUrl || n.link || '/dashboard'
              }));
              setNotifications(mappedNotifs);
            }
          })
          .catch(() => {});
      })
      .catch(() => {});
  };

  useEffect(() => {
    reloadAllDataFromDb();
  }, []);

  // Notifications calculation and actions
  const unreadNotificationsCount = notifications.filter(
    (n) => (n.userId === currentUser.id || n.userId === 'all') && !n.isRead
  ).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    const numMatch = id.match(/\d+/);
    const numericId = numMatch ? parseInt(numMatch[0], 10) : null;
    if (numericId) {
      try {
        fetch(`/api/notifications/${numericId}/read`, {
          method: 'POST',
          credentials: 'include'
        }).catch(() => {});
      } catch (_) {}
    }
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.userId === currentUser.id || n.userId === 'all' ? { ...n, isRead: true } : n
      )
    );
    addToast('Đã đánh dấu tất cả thông báo là đã đọc', 'info');
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toLocaleString('vi-VN'),
      timeAgo: 'Vừa xong',
      isRead: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // User Profile Detail Modal State
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);

  const openUserProfileModal = () => {
    setIsUserProfileModalOpen(true);
  };

  const closeUserProfileModal = () => {
    setIsUserProfileModalOpen(false);
  };

  // Auth Modals State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'verification' | 'google-role' | 'google-auth'>('login');
  const [pendingGoogleUser, setPendingGoogleUser] = useState<{ email: string; name: string; avatar: string } | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  // Action Guard Modal State
  const [isUnverifiedModalOpen, setIsUnverifiedModalOpen] = useState(false);
  const [unverifiedBlockedAction, setUnverifiedBlockedAction] = useState('');

  // VNPay Modal State
  const [isVNPayModalOpen, setIsVNPayModalOpen] = useState(false);
  const [vnpayModalParams, setVnpayModalParams] = useState<{
    amount: number;
    orderNumber: string;
    orderTitle: string;
    onPaymentComplete: () => void;
  } | null>(null);

  // Withdrawal Modal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const openWithdrawModal = () => {
    setIsWithdrawModalOpen(true);
  };

  const closeWithdrawModal = () => {
    setIsWithdrawModalOpen(false);
  };

  const withdrawMoney = (request: WithdrawalRequest): boolean => {
    const currentBalance = currentUser.balance || 0;
    if (request.amount > currentBalance) {
      addToast('Số dư khả dụng không đủ để thực hiện lệnh rút tiền.', 'error');
      return false;
    }

    const newBalance = currentBalance - request.amount;

    // Record payout transaction
    const newTx: VNPayTransaction = {
      id: `tx-withdraw-${Date.now()}`,
      amount: request.amount,
      bankCode: request.bankName,
      transactionNo: `NAPAS-${Date.now().toString().slice(-8)}`,
      cardType: 'BANK_TRANSFER',
      payDate: new Date().toLocaleString('vi-VN'),
      status: 'SUCCESS',
      type: 'PAYOUT',
      description: `Rút tiền về ${request.bankName} - ${request.accountNumber} (${request.accountHolder})`,
      userEmail: currentUser.email || currentUser.name
    };

    setVnpayTransactions((prev) => [newTx, ...prev]);

    // Update current user balance
    setCurrentUser((prev) => ({
      ...prev,
      balance: newBalance
    }));

    // Update users list
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, balance: newBalance } : u))
    );

    addToast(
      `Đã chuyển ${request.amount.toLocaleString('vi-VN')} đ về tài khoản ${request.bankName} (${request.accountNumber}) thành công!`,
      'success'
    );
    return true;
  };

  const addBankAccount = (accountData: Omit<BankAccount, 'id' | 'createdAt'>) => {
    const newAccount: BankAccount = {
      ...accountData,
      id: `ba-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const currentAccounts = currentUser.bankAccounts || [];
    const updatedBankAccounts = [...currentAccounts, newAccount];

    // If it's set as default or is first account, ensure isDefault is true
    if (updatedBankAccounts.length === 1 || accountData.isDefault) {
      updatedBankAccounts.forEach((acc) => {
        acc.isDefault = acc.id === newAccount.id;
      });
    }

    setCurrentUser((prev) => ({
      ...prev,
      bankAccounts: updatedBankAccounts
    }));

    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id ? { ...u, bankAccounts: updatedBankAccounts } : u
      )
    );

    addToast(`Đã liên kết tài khoản ngân hàng ${accountData.bankName} thành công!`, 'success');
  };

  const removeBankAccount = (accountId: string) => {
    const currentAccounts = currentUser.bankAccounts || [];
    const updatedBankAccounts = currentAccounts.filter((a) => a.id !== accountId);

    // If default was deleted, set first as default
    if (updatedBankAccounts.length > 0 && !updatedBankAccounts.some((a) => a.isDefault)) {
      updatedBankAccounts[0].isDefault = true;
    }

    setCurrentUser((prev) => ({
      ...prev,
      bankAccounts: updatedBankAccounts
    }));

    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id ? { ...u, bankAccounts: updatedBankAccounts } : u
      )
    );

    addToast('Đã xóa liên kết tài khoản ngân hàng', 'info');
  };

  const addToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const resetAllDemoData = () => {
    localStorage.removeItem(STORAGE_KEY_USERS);
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER_ID);
    localStorage.removeItem(STORAGE_KEY_PROJECTS);
    localStorage.removeItem(STORAGE_KEY_PROPOSALS);
    localStorage.removeItem(STORAGE_KEY_ORDERS);
    localStorage.removeItem(STORAGE_KEY_REVIEWS);
    localStorage.removeItem(STORAGE_KEY_DISPUTES);
    localStorage.removeItem(STORAGE_KEY_FREELANCERS);
    localStorage.removeItem(STORAGE_KEY_VNPAY);
    localStorage.removeItem(STORAGE_KEY_CONFIG);
    localStorage.removeItem(STORAGE_KEY_INVITATIONS);
    localStorage.removeItem(STORAGE_KEY_NOTIFICATIONS);

    reloadAllDataFromDb();
    addToast('Đã làm mới và đồng bộ 100% dữ liệu từ Cơ sở dữ liệu MySQL!', 'info');
  };

  const openAuthModal = (mode: 'login' | 'register' | 'verification' | 'google-auth' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openUnverifiedModal = (actionName: string) => {
    setUnverifiedBlockedAction(actionName);
    setIsUnverifiedModalOpen(true);
  };

  const closeUnverifiedModal = () => {
    setIsUnverifiedModalOpen(false);
  };

  const openVNPayModal = (params: {
    amount: number;
    orderNumber: string;
    orderTitle: string;
    onPaymentComplete: () => void;
  }) => {
    setVnpayModalParams(params);
    setIsVNPayModalOpen(true);
  };

  const closeVNPayModal = () => {
    setIsVNPayModalOpen(false);
    setVnpayModalParams(null);
  };

  const checkActionGuard = (actionName: string): boolean => {
    if (currentUser.role === 'guest') {
      openAuthModal('login');
      addToast(`Vui lòng đăng nhập để thực hiện "${actionName}".`, 'warning');
      return false;
    }
    if (currentUser.accountStatus === 'SUSPENDED') {
      addToast('Tài khoản của bạn đang bị khóa do vi phạm chính sách sàn.', 'error');
      return false;
    }
    if (!currentUser.emailVerified) {
      openUnverifiedModal(actionName);
      return false;
    }
    return true;
  };

  const switchRole = (role: UserRole) => {
    if (role === 'guest') {
      setCurrentUser(GUEST_USER);
      localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, 'usr-guest');
      addToast('Đã chuyển sang chế độ Khách (Guest)', 'info');
      return;
    }
    const found = users.find((u) => u.role === role) || users[0];
    setCurrentUser(found);
    localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, found.id);
    addToast(`Đã chuyển sang: ${found.name} (${role.toUpperCase()})`, 'info');
  };

  const switchUserById = (userId: string) => {
    if (userId === 'usr-guest' || userId === 'guest') {
      setCurrentUser(GUEST_USER);
      localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, 'usr-guest');
      addToast('Đã chuyển sang chế độ Khách (Guest)', 'info');
      return;
    }
    const found = users.find((u) => u.id === userId);
    if (found) {
      if (!found.emailVerified) {
        setPendingVerificationEmail(found.email);
        setAuthModalMode('verification');
        setIsAuthModalOpen(true);
        addToast(`Tài khoản ${found.email} chưa kích hoạt OTP. Vui lòng nhập mã OTP để vào tài khoản! (Mã test: 123456)`, 'warning');
        return;
      }
      setCurrentUser(found);
      localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, found.id);
      addToast(`Đã đăng nhập dưới tên: ${found.name} (${found.role.toUpperCase()})`, 'info');
    }
  };

  const registerUser = async (data: { name: string; email: string; password?: string; role: 'freelancer' | 'employer'; phone?: string }) => {
    const trimmedEmail = data.email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (existing && existing.emailVerified) {
      addToast('Email này đã được sử dụng và đã xác thực. Vui lòng chọn Đăng nhập!', 'error');
      return;
    }

    const newUser: User = {
      id: existing ? existing.id : `usr-${Date.now()}`,
      name: data.name,
      email: trimmedEmail,
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(data.name)}`,
      role: data.role,
      phone: data.phone,
      isVerified: false,
      emailVerified: false,
      accountStatus: 'PENDING',
      kycStatus: 'NOT_SUBMITTED',
      balance: existing ? existing.balance : 0,
      escrowBalance: 0,
      createdAt: existing ? existing.createdAt : new Date().toISOString().split('T')[0],
      lastLogin: 'Đang chờ kích hoạt OTP'
    };

    setUsers((prev) => {
      const idx = prev.findIndex((u) => u.email.toLowerCase() === trimmedEmail);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...newUser };
        return next;
      }
      return [...prev, newUser];
    });

    if (data.role === 'freelancer') {
      const newFreeProfile: FreelancerProfile = {
        id: `free-${Date.now()}`,
        userId: newUser.id,
        name: data.name,
        title: 'Freelancer Chuyên Nghiệp',
        avatar: newUser.avatar,
        bio: 'Tôi là chuyên gia dịch vụ số mới gia nhập sàn TalentMatch.',
        location: 'Việt Nam',
        rating: 5.0,
        reviewCount: 0,
        completedOrders: 0,
        skills: ['Kỹ năng chung'],
        talentCreditScore: 800,
        talentCreditBadge: 'Bronze',
        isVerified: false,
        portfolio: []
      };
      setFreelancers((prev) => {
        const exists = prev.some((f) => f.userId === newUser.id);
        return exists ? prev : [...prev, newFreeProfile];
      });
    }

    // BẮT BUỘC: KHÔNG SET currentUser! Người dùng phải xác thực OTP mới được vào acc
    setPendingVerificationEmail(trimmedEmail);
    setAuthModalMode('verification');
    if (existing && !existing.emailVerified) {
      addToast(`Tài khoản với email ${trimmedEmail} đang chờ kích hoạt. Đã cập nhật lại thông tin và gửi mã OTP mới!`, 'info');
    } else {
      addToast(`Hệ thống đã gửi mã OTP 6 số đến email ${trimmedEmail}. Vui lòng nhập mã để kích hoạt tài khoản.`, 'info');
    }

    // Lưu tài khoản và kích hoạt mã OTP trong CSDL MySQL Backend
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.name,
          email: trimmedEmail,
          password: data.password || 'TalentMatch@2026',
          confirmPassword: data.password || 'TalentMatch@2026',
          role: data.role === 'employer' ? 'CUSTOMER' : 'FREELANCER',
          agreeTerms: true
        }),
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok && resData.message) {
        addToast(resData.message, 'error');
      } else if (res.ok && resData.message) {
        // Backend trả về thông báo cập nhật OTP
        addToast(resData.message, 'info');
      }
    } catch (_) {}
  };

  const completeOtpVerification = (targetEmail: string, backendUserData?: any) => {
    const cleanEmail = targetEmail.trim().toLowerCase();
    let verifiedUser: User | null = null;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.email.toLowerCase() === cleanEmail) {
          verifiedUser = {
            ...u,
            emailVerified: true,
            accountStatus: 'ACTIVE',
            name: backendUserData?.fullName || u.name,
            avatar: backendUserData?.avatar || u.avatar
          };
          return verifiedUser;
        }
        return u;
      })
    );

    if (!verifiedUser) {
      const tempRole = cleanEmail.includes('admin')
        ? 'admin'
        : cleanEmail.includes('ha.le') || cleanEmail.includes('invest') || cleanEmail.includes('startup')
        ? 'employer'
        : 'freelancer';

      verifiedUser = {
        id: backendUserData?.id ? `usr-${backendUserData.id}` : `usr-${Date.now()}`,
        name: backendUserData?.fullName || cleanEmail.split('@')[0],
        email: cleanEmail,
        avatar: backendUserData?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(cleanEmail)}`,
        role: tempRole,
        isVerified: false,
        emailVerified: true,
        accountStatus: 'ACTIVE',
        kycStatus: 'NOT_SUBMITTED',
        balance: 50000000,
        escrowBalance: 0,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: 'Vừa xác thực OTP'
      };
      setUsers((prev) => [verifiedUser!, ...prev]);
    }

    // BÂY GIỜ MỚI CHÍNH THỨC CẤP QUYỀN VÀO ACC
    setCurrentUser(verifiedUser);
    localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, verifiedUser.id);
    setPendingVerificationEmail(null);
    setIsAuthModalOpen(false);
    addToast('✓ Xác thực OTP thành công! Đã đăng nhập vào tài khoản.', 'success');
  };

  const verifyEmail = (userId?: string) => {
    const targetId = userId || currentUser.id;
    setUsers((prev) =>
      prev.map((u) => (u.id === targetId ? { ...u, emailVerified: true, accountStatus: 'ACTIVE' } : u))
    );
    if (currentUser.id === targetId) {
      setCurrentUser((prev) => ({ ...prev, emailVerified: true, accountStatus: 'ACTIVE' }));
    }
    setPendingVerificationEmail(null);
    addToast('✓ Email đã được xác thực thành công!', 'success');
  };

  const resendVerificationEmail = async (emailTarget: string) => {
    const cleanEmail = emailTarget.trim().toLowerCase();
    try {
      await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
    } catch (_) {}
    addToast(`Mã xác thực mới đã gửi tới ${cleanEmail}. Vui lòng kiểm tra hộp thư! (Mã demo: 123456)`, 'info');
  };

  const changeVerificationEmail = (newEmail: string, oldEmail?: string) => {
    const targetOld = (oldEmail || pendingVerificationEmail || currentUser.email).toLowerCase();
    const cleanNew = newEmail.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === cleanNew);
    if (existing && existing.emailVerified && existing.email.toLowerCase() !== targetOld) {
      addToast('Email này đã được sử dụng bởi một tài khoản đã xác thực khác!', 'error');
      return;
    }
    setPendingVerificationEmail(cleanNew);
    setUsers((prev) => prev.map((u) => (u.email.toLowerCase() === targetOld ? { ...u, email: cleanNew } : u)));
    if (currentUser.email.toLowerCase() === targetOld) {
      setCurrentUser((prev) => ({ ...prev, email: cleanNew }));
    }
    addToast(`Đã đổi email xác thực sang: ${cleanNew}`, 'info');
  };

  const submitKyc = (data?: {
    idNumber?: string;
    fullName?: string;
    taxCode?: string;
    companyName?: string;
    userId?: string;
  }) => {
    const targetId = data?.userId || currentUser.id;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === targetId) {
          return {
            ...u,
            kycStatus: 'VERIFIED',
            isVerified: true,
            taxCode: data?.taxCode || u.taxCode,
            companyName: data?.companyName || u.companyName,
            name: data?.fullName || u.name
          };
        }
        return u;
      })
    );

    if (currentUser.id === targetId) {
      setCurrentUser((prev) => ({
        ...prev,
        kycStatus: 'VERIFIED',
        isVerified: true,
        taxCode: data?.taxCode || prev.taxCode,
        companyName: data?.companyName || prev.companyName,
        name: data?.fullName || prev.name
      }));
    }

    setFreelancers((prev) =>
      prev.map((f) => (f.userId === targetId ? { ...f, isVerified: true } : f))
    );

    addToast('✓ Xác minh eKYC danh tính thành công! Huy hiệu Tích Xanh chính chủ đã được kích hoạt.', 'success');
  };

  const loginUser = async (email: string, password?: string): Promise<{ success: boolean; requiresOtp?: boolean; isUnverified?: boolean; unverifiedUserEmail?: string; message?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Gửi request đăng nhập thực tế tới Spring Boot backend kết nối MySQL
    if (password) {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: trimmedEmail, password })
        });

        const resData = await res.json().catch(() => ({}));

        // BẮT BUỘC: Nếu tài khoản chưa xác thực OTP (status 403 hoặc cờ requiresOtp)
        if (res.status === 403 && (resData.requiresOtp || resData.email)) {
          setPendingVerificationEmail(trimmedEmail);
          setAuthModalMode('verification');
          addToast(resData.message || `Tài khoản chưa được kích hoạt OTP. Mã xác nhận mới đã gửi tới ${trimmedEmail}. Vui lòng nhập mã OTP để vào tài khoản!`, 'warning');
          return {
            success: false,
            requiresOtp: true,
            isUnverified: true,
            unverifiedUserEmail: trimmedEmail,
            message: resData.message || 'Tài khoản chưa được kích hoạt OTP.'
          };
        }

        if (res.ok) {
          const backendUser = resData;
          const roleMapped =
            backendUser.role?.toUpperCase() === 'ADMIN'
              ? 'admin'
              : backendUser.role?.toUpperCase() === 'CUSTOMER'
              ? 'employer'
              : 'freelancer';

          const matchedDbUser = users.find((u) => u.email.toLowerCase() === trimmedEmail);
          const userId = matchedDbUser ? matchedDbUser.id : (roleMapped === 'freelancer' ? `usr-free-${backendUser.id}` : (roleMapped === 'employer' ? `usr-emp-${backendUser.id}` : String(backendUser.id)));

          const loggedInUser: User = {
            id: userId,
            name: backendUser.fullName || matchedDbUser?.name || trimmedEmail.split('@')[0],
            email: backendUser.email || trimmedEmail,
            avatar: backendUser.avatar || matchedDbUser?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(trimmedEmail)}`,
            role: roleMapped,
            phone: backendUser.phone || matchedDbUser?.phone || '',
            isVerified: true,
            emailVerified: true,
            accountStatus: 'ACTIVE',
            kycStatus: matchedDbUser?.kycStatus || 'NOT_SUBMITTED',
            companyName: backendUser.companyName || matchedDbUser?.companyName || '',
            balance: matchedDbUser?.balance ?? 50000000,
            escrowBalance: matchedDbUser?.escrowBalance ?? 0,
          };

          setUsers((prev) => {
            const idx = prev.findIndex((u) => u.email.toLowerCase() === trimmedEmail);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = { ...next[idx], ...loggedInUser };
              return next;
            }
            return [loggedInUser, ...prev];
          });

          // Chỉ cho vào acc khi đã xác thực!
          setCurrentUser(loggedInUser);
          localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, loggedInUser.id);
          setIsAuthModalOpen(false);
          setPendingVerificationEmail(null);
          addToast(`Đăng nhập thành công! Chào mừng ${loggedInUser.name}.`, 'success');
          return { success: true };
        } else if (res.status === 401) {
          return { success: false, message: resData.message || 'Email hoặc mật khẩu không chính xác.' };
        }
      } catch (_) {}
    }

    // 2. Fallback kiểm tra mock data (Offline / Demo)
    const found = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (found) {
      if (!found.emailVerified) {
        // BẮT BUỘC: KHÔNG SET currentUser! Yêu cầu nhập OTP trước!
        setPendingVerificationEmail(found.email);
        setAuthModalMode('verification');
        addToast(`Tài khoản ${found.email} chưa được kích hoạt OTP. Vui lòng nhập mã OTP để vào tài khoản! (Mã demo: 123456)`, 'warning');
        return {
          success: false,
          requiresOtp: true,
          isUnverified: true,
          unverifiedUserEmail: found.email,
          message: 'Tài khoản chưa xác thực OTP.'
        };
      }

      setCurrentUser(found);
      localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, found.id);
      setIsAuthModalOpen(false);
      setPendingVerificationEmail(null);
      addToast(`Đăng nhập thành công! Chào mừng ${found.name}.`, 'success');
      return { success: true };
    }

    return { success: false, message: 'Email hoặc mật khẩu không chính xác.' };
  };

  const loginWithGoogle = (targetEmail?: string) => {
    if (targetEmail) {
      const email = targetEmail.trim().toLowerCase();
      try {
        fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            fullName: email.split('@')[0],
            role: 'FREELANCER',
          }),
        }).catch(() => {});
      } catch (_) {}

      const found = users.find((u) => u.email.toLowerCase() === email);
      if (found) {
        if (!found.emailVerified) {
          setPendingVerificationEmail(found.email);
          setAuthModalMode('verification');
          addToast(`Tài khoản Google (${found.email}) chưa được xác thực email. Vui lòng xác thực mã OTP! (Mã demo: 123456)`, 'warning');
          return;
        }
        setCurrentUser(found);
        localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, found.id);
        setIsAuthModalOpen(false);
        setPendingVerificationEmail(null);
        addToast(`Đăng nhập thành công bằng Google: ${found.name}`, 'success');
        return;
      } else {
        // Tài khoản chưa tồn tại: chuyển sang giao diện tạo tài khoản Google với OTP
        setPendingVerificationEmail(email);
        setAuthModalMode('google-auth');
        return;
      }
    }
    // Chuyển sang màn hình chọn tài khoản Google & xác thực Gmail
    setAuthModalMode('google-auth');
  };

  const registerWithGoogle = (data: {
    email: string;
    name: string;
    role: 'freelancer' | 'employer';
    phone?: string;
    emailVerified?: boolean;
  }) => {
    try {
      fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email.trim().toLowerCase(),
          fullName: data.name,
          role: data.role === 'employer' ? 'CUSTOMER' : 'FREELANCER',
          avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(data.email)}`,
        }),
      }).catch(() => {});
    } catch (_) {}

    const isEmailVer = data.emailVerified !== undefined ? data.emailVerified : true;
    const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      const updated = { ...existing, emailVerified: isEmailVer || existing.emailVerified };
      setCurrentUser(updated);
      localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, existing.id);
      setIsAuthModalOpen(false);
      addToast(`Đã tìm thấy tài khoản! Đăng nhập thành công: ${existing.name}`, 'success');
      return;
    }

    const newUser: User = {
      id: `usr-gg-${Date.now()}`,
      name: data.name,
      email: data.email,
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(data.email)}`,
      role: data.role,
      phone: data.phone || '',
      isVerified: false,
      emailVerified: isEmailVer,
      accountStatus: isEmailVer ? 'ACTIVE' : 'PENDING',
      kycStatus: 'NOT_SUBMITTED',
      balance: 0,
      escrowBalance: 0,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Vừa tạo tài khoản Google'
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, newUser.id);
    setPendingGoogleUser(null);
    setIsAuthModalOpen(false);

    if (data.role === 'freelancer') {
      const newFreeProfile: FreelancerProfile = {
        id: `free-${Date.now()}`,
        userId: newUser.id,
        name: data.name,
        title: 'Freelancer Chuyên Nghiệp',
        avatar: newUser.avatar,
        bio: 'Tôi là chuyên gia dịch vụ số mới gia nhập sàn TalentMatch.',
        location: 'Việt Nam',
        rating: 5.0,
        reviewCount: 0,
        completedOrders: 0,
        skills: ['Kỹ năng chung'],
        talentCreditScore: 800,
        talentCreditBadge: 'Bronze',
        isVerified: false,
        portfolio: []
      };
      setFreelancers((prev) => [...prev, newFreeProfile]);
    }

    addToast(
      `Đăng ký & xác thực Gmail thành công! Chào mừng ${data.name} (${
        data.role === 'freelancer' ? 'Freelancer' : 'Nhà tuyển dụng'
      }).`,
      'success'
    );
  };

  const handleGoogleAuthSuccess = async (googleUser: {
    email: string;
    name: string;
    avatar?: string;
    role?: 'freelancer' | 'employer';
  }) => {
    const email = googleUser.email.trim().toLowerCase();
    const role = googleUser.role === 'employer' ? 'CUSTOMER' : 'FREELANCER';
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          fullName: googleUser.name,
          role: role,
          avatar: googleUser.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(email)}`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        let found = users.find((u) => u.email.toLowerCase() === email);
        if (!found) {
          const newUser: User = {
            id: data.id ? `usr-${data.id}` : `usr-gg-${Date.now()}`,
            name: data.fullName || googleUser.name,
            email: email,
            avatar: data.avatar || googleUser.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(email)}`,
            role: data.role === 'CUSTOMER' ? 'employer' : 'freelancer',
            phone: data.phone || '',
            isVerified: false,
            emailVerified: true,
            accountStatus: 'ACTIVE',
            kycStatus: 'NOT_SUBMITTED',
            balance: 0,
            escrowBalance: 0,
            createdAt: new Date().toISOString().split('T')[0],
            lastLogin: 'Vừa tạo tài khoản Google'
          };
          if (newUser.role === 'freelancer') {
            const newFreeProfile: FreelancerProfile = {
              id: `free-${Date.now()}`,
              userId: newUser.id,
              name: newUser.name,
              title: 'Freelancer Chuyên Nghiệp',
              avatar: newUser.avatar,
              bio: 'Tôi là chuyên gia dịch vụ số mới gia nhập sàn TalentMatch.',
              location: 'Việt Nam',
              rating: 5.0,
              reviewCount: 0,
              completedOrders: 0,
              skills: ['Kỹ năng chung'],
              talentCreditScore: 800,
              talentCreditBadge: 'Bronze',
              isVerified: false,
              portfolio: []
            };
            setFreelancers((prev) => [...prev, newFreeProfile]);
          }
          setUsers((prev) => [...prev, newUser]);
          setCurrentUser(newUser);
          localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, newUser.id);
        } else {
          const verified = { ...found, emailVerified: true, accountStatus: 'ACTIVE' as const };
          setUsers((prev) => prev.map((u) => (u.id === found!.id ? verified : u)));
          setCurrentUser(verified);
          localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, verified.id);
        }
        setIsAuthModalOpen(false);
        addToast(`Đăng nhập Google thành công! Chào mừng ${googleUser.name}.`, 'success');
      } else {
        addToast(data.message || 'Đăng nhập Google thất bại.', 'error');
      }
    } catch {
      addToast('Không thể kết nối đến máy chủ đăng nhập Google.', 'error');
    }
  };

  const completeGoogleRegister = (role: 'freelancer' | 'employer') => {
    if (!pendingGoogleUser) return;
    registerWithGoogle({
      email: pendingGoogleUser.email,
      name: pendingGoogleUser.name,
      role: role
    });
  };

  const logout = () => {
    setCurrentUser(GUEST_USER);
    localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, 'usr-guest');
    addToast('Đã đăng xuất thành công! Bạn đang duyệt web ở chế độ Khách.', 'info');
  };

  // ADMIN OPERATIONS
  const adminUpdateUserStatus = (userId: string, status: AccountStatus) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, accountStatus: status } : u)));
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, accountStatus: status }));
    }
    addToast(`Admin đã cập nhật trạng thái tài khoản thành: ${status}`, 'info');
  };

  const adminToggleEmailVerified = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextState = !u.emailVerified;
          return {
            ...u,
            emailVerified: nextState,
            accountStatus: nextState ? 'ACTIVE' : 'PENDING'
          };
        }
        return u;
      })
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({
        ...prev,
        emailVerified: !prev.emailVerified,
        accountStatus: !prev.emailVerified ? 'ACTIVE' : 'PENDING'
      }));
    }
    addToast('Admin đã cập nhật trạng thái xác thực email.', 'info');
  };

  const adminUpdateProjectStatus = (projectId: string, status: Project['status']) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, status } : p)));
    addToast(`Admin đã cập nhật trạng thái dự án thành: ${status}`, 'info');
  };

  const updatePlatformConfig = (newConfig: PlatformConfig) => {
    setPlatformConfig(newConfig);
    addToast('Đã lưu cài đặt tham số hệ thống & VNPAY Sandbox thành công!', 'success');
  };

  const deleteReview = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    addToast('Admin đã gỡ bỏ đánh giá vi phạm khỏi hệ thống.', 'info');
  };

  // ACTIONS
  const createProject = (newProj: Omit<Project, 'id' | 'createdAt' | 'status' | 'proposalsCount'>) => {
    if (!checkActionGuard('Đăng dự án tuyển dụng mới')) return;

    const id = `prj-${Date.now()}`;
    const project: Project = {
      ...newProj,
      id,
      status: 'OPEN',
      proposalsCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setProjects((prev) => [project, ...prev]);

    // Đồng bộ ngay xuống CSDL MySQL Backend
    try {
      fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: newProj.title,
          category: newProj.category,
          description: newProj.description,
          budget: newProj.budget,
          budgetType: newProj.budgetType,
          deadline: newProj.deadline,
          requiredSkills: newProj.requiredSkills,
          customerEmail: currentUser.email
        })
      })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            if (data.id) {
              setProjects((prev) =>
                prev.map((p) => (p.id === id ? { ...p, id: String(data.id) } : p))
              );
            }
          }
        })
        .catch(() => {});
    } catch (_) {}

    addToast('Đã đăng dự án tuyển dụng mới thành công và lưu vào CSDL!', 'success');
  };

  const submitProposal = (proposalData: Omit<Proposal, 'id' | 'createdAt' | 'status'>) => {
    if (!checkActionGuard('Gửi Đề xuất báo giá')) return;

    const id = `prop-${Date.now()}`;
    const proposal: Proposal = {
      ...proposalData,
      id,
      status: 'PENDING',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setProposals((prev) => [proposal, ...prev]);
    setProjects((prev) =>
      prev.map((p) => (p.id === proposalData.projectId ? { ...p, proposalsCount: p.proposalsCount + 1 } : p))
    );

    // Lưu đề xuất ứng tuyển vào CSDL MySQL nếu là jobId số
    const numericJobId = parseInt(proposalData.projectId, 10);
    if (!isNaN(numericJobId)) {
      try {
        fetch(`/api/jobs/${numericJobId}/apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            proposal: proposalData.coverLetter,
            proposedPrice: proposalData.bidAmount,
            estimatedDays: proposalData.estimatedDays,
            portfolioLink: proposalData.freelancerPortfolioUrl || ''
          })
        }).catch(() => {});
      } catch (_) {}
    }

    addToast('Đã gửi Đề xuất báo giá cho Nhà tuyển dụng!', 'success');
  };

  const acceptProposal = (proposalId: string) => {
    if (!checkActionGuard('Chấp nhận Báo giá & Ký hợp đồng')) return;

    const prop = proposals.find((p) => p.id === proposalId);
    if (!prop) return;

    const proj = projects.find((p) => p.id === prop.projectId);
    const totalAmount = prop.bidAmount;
    const orderNumber = `TM-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // Trigger VNPay Payment Flow
    openVNPayModal({
      amount: totalAmount,
      orderNumber,
      orderTitle: proj?.title || 'Hợp đồng dự án tuyển dụng',
      onPaymentComplete: () => {
        const platformFee = Math.round(totalAmount * (platformConfig.platformFeePercent / 100));
        const freelancerPayoutAmount = totalAmount - platformFee;

        const newOrder: Order = {
          id: `ord-${Date.now()}`,
          orderNumber,
          projectId: proj?.id,
          serviceTitle: proj?.title || 'Dự án đặt hàng riêng',
          freelancerId: prop.freelancerId,
          freelancerName: prop.freelancerName,
          freelancerAvatar: prop.freelancerAvatar,
          employerId: currentUser.id,
          employerName: currentUser.name,
          employerAvatar: currentUser.avatar,
          totalAmount,
          platformFee,
          freelancerPayoutAmount,
          status: 'ORDER_IN_PROGRESS',
          createdAt: new Date().toISOString().split('T')[0],
          deadline: new Date(Date.now() + prop.estimatedDays * 86400000).toISOString().split('T')[0],
          autoAcceptDaysRemaining: 3,
          paymentMethod: 'VNPAY_QR',
          vnpayTransactionId: `VNPAY-${Date.now().toString().slice(-8)}`,
          milestones: (proj?.milestones && proj.milestones.length > 0)
            ? proj.milestones.map((pm, idx) => ({
                id: `ms-${Date.now()}-${idx + 1}`,
                title: pm.title,
                amount: Math.round(pm.amount * (totalAmount / (proj.budget || totalAmount))),
                status: idx === 0 ? 'ESCROW_FUNDED' : 'PENDING',
                dueDate: pm.dueDate || new Date(Date.now() + prop.estimatedDays * 86400000).toISOString().split('T')[0]
              }))
            : [
                {
                  id: `ms-${Date.now()}`,
                  title: 'Cột mốc hoàn thành dự án theo Đề xuất',
                  amount: totalAmount,
                  status: 'ESCROW_FUNDED',
                  dueDate: new Date(Date.now() + prop.estimatedDays * 86400000).toISOString().split('T')[0]
                }
              ],
          deliveries: [],
          revisionCount: 0,
          maxRevisionsAllowed: 2,
          sowRequirements: [
            `Hoàn thành công việc theo mô tả Đề xuất của ${prop.freelancerName}`,
            `Thời hạn bàn giao trong ${prop.estimatedDays} ngày`
          ],
          notes: 'Hợp đồng dự án đã được ký kết & nạp tiền Escrow qua Cổng VNPAY.'
        };

        setOrders((prev) => [newOrder, ...prev]);
        setProposals((prev) => prev.map((p) => (p.id === proposalId ? { ...p, status: 'ACCEPTED' } : p)));

        if (proj) {
          setProjects((prev) => prev.map((p) => (p.id === proj.id ? { ...p, status: 'IN_PROGRESS' } : p)));
        }

        // Record VNPay Transaction
        const newVnpayTx: VNPayTransaction = {
          id: `vnp-${Date.now()}`,
          orderId: newOrder.id,
          orderNumber: newOrder.orderNumber,
          amount: totalAmount,
          bankCode: 'VNPAYQR',
          transactionNo: newOrder.vnpayTransactionId || 'VNPAY-2026-OK',
          cardType: 'QR_CODE',
          payDate: new Date().toLocaleString('vi-VN'),
          status: 'SUCCESS',
          type: 'ESCROW_DEPOSIT',
          description: `Nạp cọc Escrow cho dự án ${newOrder.serviceTitle}`,
          userEmail: currentUser.email
        };
        setVnpayTransactions((prev) => [newVnpayTx, ...prev]);

        // Đồng bộ lưu thanh toán Escrow xuống CSDL MySQL Backend
        const numMatch = proj ? proj.id.match(/\d+/) : null;
        const numericProjectId = numMatch ? parseInt(numMatch[0], 10) : 1;
        try {
          fetch(`/api/payment/project/${numericProjectId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              method: 'VNPAY_ESCROW',
              amount: totalAmount,
              description: `Nạp cọc Escrow cho dự án ${newOrder.serviceTitle}`
            })
          }).catch(() => {});
        } catch (_) {}

        closeVNPayModal();
        addToast(`Thanh toán VNPAY ${totalAmount.toLocaleString('vi-VN')}đ thành công! Đã ký hợp đồng & khóa tiền Escrow.`, 'success');
      }
    });
  };

  const deliverWork = (
    orderId: string,
    noteOrData: string | { title: string; deliveryUrl: string; note: string; linkType?: any; demoUrl?: string },
    fileName?: string,
    demoUrl?: string,
    deliveryUrl?: string
  ) => {
    if (!checkActionGuard('Nộp sản phẩm bàn giao')) return;

    let finalTitle = 'Link sản phẩm bàn giao';
    let finalUrl = '';
    let finalNote = '';
    let finalDemoUrl: string | undefined = demoUrl;
    let finalLinkType: any = 'other';

    if (typeof noteOrData === 'object' && noteOrData !== null) {
      finalTitle = noteOrData.title || 'Link sản phẩm bàn giao';
      finalUrl = noteOrData.deliveryUrl || '';
      finalNote = noteOrData.note || '';
      finalDemoUrl = noteOrData.demoUrl || demoUrl;
      finalLinkType = noteOrData.linkType || 'other';
    } else {
      finalNote = noteOrData || '';
      finalTitle = fileName || 'Link sản phẩm bàn giao';
      finalUrl = deliveryUrl || demoUrl || '';
    }

    // Auto-detect link platform if not explicitly specified
    if (finalUrl) {
      const lower = finalUrl.toLowerCase();
      if (lower.includes('drive.google.com') || lower.includes('dropbox.com') || lower.includes('onedrive')) {
        finalLinkType = 'google-drive';
      } else if (lower.includes('figma.com')) {
        finalLinkType = 'figma';
      } else if (lower.includes('github.com') || lower.includes('gitlab.com')) {
        finalLinkType = 'github';
      } else if (lower.includes('loom.com') || lower.includes('youtube.com') || lower.includes('youtu.be')) {
        finalLinkType = 'loom';
      } else {
        finalLinkType = 'website';
      }
    }

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const newDelivery: DeliveryFile = {
            id: `del-${Date.now()}`,
            fileName: finalTitle,
            deliveryUrl: finalUrl,
            linkType: finalLinkType,
            fileSize: 'Link trực tuyến',
            uploadedAt: new Date().toLocaleString('vi-VN'),
            note: finalNote,
            demoUrl: finalDemoUrl
          };
          return {
            ...o,
            status: 'DELIVERED',
            deliveries: [...o.deliveries, newDelivery],
            milestones: o.milestones.map((m) => ({ ...m, status: 'DELIVERED' }))
          };
        }
        return o;
      })
    );
    addToast('Đã nộp link sản phẩm bàn giao thành công! Đếm ngược 72 giờ tự động nghiệm thu đã kích hoạt.', 'success');
  };

  const requestRevision = (orderId: string, note: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'REVISION_REQUESTED',
            revisionCount: o.revisionCount + 1,
            notes: `Yêu cầu sửa đổi lần ${o.revisionCount + 1}: ${note}`
          };
        }
        return o;
      })
    );
    addToast('Đã gửi yêu cầu Chỉnh sửa (Revision) cho Freelancer!', 'warning');
  };

  const acceptDelivery = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'COMPLETED',
            milestones: o.milestones.map((m) => ({ ...m, status: 'ACCEPTED' }))
          };
        }
        return o;
      })
    );

    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder) {
      // Record Payout Transaction
      const payoutTx: VNPayTransaction = {
        id: `vnp-payout-${Date.now()}`,
        orderId: targetOrder.id,
        orderNumber: targetOrder.orderNumber,
        amount: targetOrder.freelancerPayoutAmount,
        bankCode: 'BANK_TRANSFER',
        transactionNo: `PAYOUT-${Date.now().toString().slice(-8)}`,
        cardType: 'PAYOUT',
        payDate: new Date().toLocaleString('vi-VN'),
        status: 'SUCCESS',
        type: 'PAYOUT',
        description: `Giải ngân 90% tiền công cho ${targetOrder.freelancerName}`,
        userEmail: targetOrder.freelancerName
      };
      setVnpayTransactions((prev) => [payoutTx, ...prev]);

      // Update Freelancer completed count
      setFreelancers((prev) =>
        prev.map((f) =>
          f.name === targetOrder.freelancerName ? { ...f, completedOrders: f.completedOrders + 1 } : f
        )
      );
    }

    addToast('Nghiệm thu thành công! Đã giải ngân tiền công cho Freelancer & cập nhật TalentCredit.', 'success');
  };

  const submitReview = (reviewData: {
    orderId: string;
    orderTitle: string;
    targetName: string;
    rating: number;
    qualityRating: number;
    deadlineRating: number;
    communicationRating: number;
    comment: string;
  }) => {
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      orderId: reviewData.orderId,
      orderTitle: reviewData.orderTitle,
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      reviewerAvatar: currentUser.avatar,
      reviewerRole: 'employer',
      targetName: reviewData.targetName,
      rating: reviewData.rating,
      qualityRating: reviewData.qualityRating,
      deadlineRating: reviewData.deadlineRating,
      communicationRating: reviewData.communicationRating,
      comment: reviewData.comment,
      date: new Date().toISOString().split('T')[0]
    };

    setReviews((prev) => [newRev, ...prev]);

    // Recalculate rating
    setFreelancers((prev) =>
      prev.map((f) => {
        if (f.name === reviewData.targetName) {
          const totalRating = f.rating * f.reviewCount + reviewData.rating;
          const newCount = f.reviewCount + 1;
          const newAvg = Number((totalRating / newCount).toFixed(2));
          return {
            ...f,
            rating: newAvg,
            reviewCount: newCount,
            talentCreditScore: Math.min(1000, f.talentCreditScore + 10)
          };
        }
        return f;
      })
    );

    addToast('Đã gửi đánh giá review thành công! Điểm TalentCredit của freelancer đã được cập nhật.', 'success');
  };

  const fileDispute = (orderId: string, reason: string, evidence: string) => {
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return;

    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'DISPUTED' } : o)));

    const newDispute: Dispute = {
      id: `dsp-${Date.now()}`,
      orderId,
      orderNumber: ord.orderNumber,
      openedBy: currentUser.id,
      openedByName: currentUser.name,
      reason,
      evidenceNotes: evidence,
      status: 'UNDER_REVIEW',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setDisputes((prev) => [newDispute, ...prev]);
    addToast('Đã mở Tranh chấp đơn hàng. Tiền Escrow đã được phong tỏa để Admin kiểm duyệt.', 'error');
  };

  const resolveDispute = (disputeId: string, resolution: 'RESOLVED_EMPLOYER' | 'RESOLVED_FREELANCER' | 'PARTIAL_REFUND') => {
    setDisputes((prev) =>
      prev.map((d) => (d.id === disputeId ? { ...d, status: resolution } : d))
    );

    const dsp = disputes.find((d) => d.id === disputeId);
    if (dsp) {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === dsp.orderId) {
            return {
              ...o,
              status: resolution === 'RESOLVED_EMPLOYER' ? 'CANCELLED' : 'COMPLETED'
            };
          }
          return o;
        })
      );
    }
    addToast(`Admin đã ban hành phán quyết tranh chấp: ${resolution}`, 'info');
  };

  const updateUserProfile = (data: Partial<User>) => {
    setCurrentUser((prev) => ({
      ...prev,
      ...data
    }));

    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, ...data } : u))
    );

    fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: currentUser.id,
        name: data.name,
        phone: data.phone,
        title: data.title,
        bio: data.bio,
        skills: data.skills,
        companyName: data.companyName,
        taxCode: data.taxCode
      })
    }).catch(() => {});

    if (currentUser.role === 'freelancer') {
      setFreelancers((prev) =>
        prev.map((f) => {
          if (f.userId === currentUser.id || f.name === currentUser.name) {
            return {
              ...f,
              name: data.name !== undefined ? data.name : f.name,
              avatar: data.avatar !== undefined ? data.avatar : f.avatar,
              title: data.title !== undefined ? data.title : f.title,
              bio: data.bio !== undefined ? data.bio : f.bio,
              skills: data.skills !== undefined ? data.skills : f.skills
            };
          }
          return f;
        })
      );
    }

    addToast('Đã lưu thông tin hồ sơ cá nhân thành công!', 'success');
  };

  const sendOrderMessage = (orderId: string, text: string) => {
    if (!text.trim()) return;

    let filteredText = text.trim();
    const phoneRegex = /(0[3|5|7|8|9])+([0-9]{8})\b/g;
    const zaloRegex = /(zalo|facebook|fb\.com|telegram)/gi;
    if (phoneRegex.test(filteredText) || zaloRegex.test(filteredText)) {
      filteredText = filteredText
        .replace(phoneRegex, '[SỐ ĐIỆN THOẠI BỊ ẨN ĐỂ BẢO VỆ GIAO DỊCH]')
        .replace(zaloRegex, '[LINK NGOẠI SÀN BỊ ẨN]');
    }

    const newMsg: OrderChatMessage = {
      id: `msg-${Date.now()}`,
      orderId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderRole: currentUser.role,
      text: filteredText,
      createdAt: new Date().toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    };

    setOrderMessages((prev) => {
      const prevMsgs = prev[orderId] || [];
      return {
        ...prev,
        [orderId]: [...prevMsgs, newMsg]
      };
    });
  };

  const updateFreelancerBioAndPortfolio = (data: {
    bio: string;
    portfolioUrl?: string;
    skills: string[];
    portfolio: PortfolioItem[];
  }) => {
    setFreelancers((prev) =>
      prev.map((f) => {
        if (f.userId === currentUser.id || f.name === currentUser.name) {
          return {
            ...f,
            bio: data.bio,
            portfolioUrl: data.portfolioUrl,
            skills: data.skills,
            portfolio: data.portfolio
          };
        }
        return f;
      })
    );

    setCurrentUser((prev) => ({
      ...prev,
      bio: data.bio,
      portfolioUrl: data.portfolioUrl,
      skills: data.skills
    }));

    addToast('Đã cập nhật Mô tả bản thân & Portfolio năng lực thành công!', 'success');
  };

  // Bookmark / Saved Profiles Handlers
  const toggleSaveFreelancer = (freelancerId: string) => {
    setSavedFreelancerIds((prev) => {
      const isSaved = prev.includes(freelancerId);
      const next = isSaved ? prev.filter((id) => id !== freelancerId) : [...prev, freelancerId];
      if (isSaved) {
        addToast('Đã bỏ lưu Freelancer khỏi danh sách quan tâm.', 'info');
      } else {
        addToast('✓ Đã lưu Freelancer vào Danh Sách Tiềm Năng!', 'success');
      }
      return next;
    });
  };

  const toggleSaveEmployer = (employerId: string) => {
    setSavedEmployerIds((prev) => {
      const isSaved = prev.includes(employerId);
      const next = isSaved ? prev.filter((id) => id !== employerId) : [...prev, employerId];
      if (isSaved) {
        addToast('Đã bỏ lưu Nhà tuyển dụng.', 'info');
      } else {
        addToast('✓ Đã lưu Nhà Tuyển Dụng vào Danh Sách Theo Dõi!', 'success');
      }
      return next;
    });
  };

  const toggleSaveProject = (projectId: string) => {
    setSavedProjectIds((prev) => {
      const isSaved = prev.includes(projectId);
      const next = isSaved ? prev.filter((id) => id !== projectId) : [...prev, projectId];
      if (isSaved) {
        addToast('Đã bỏ lưu dự án.', 'info');
      } else {
        addToast('✓ Đã lưu Dự Án vào Danh Sách Theo Dõi!', 'success');
      }
      return next;
    });

    const numMatch = projectId.match(/\d+/);
    const numericJobId = numMatch ? parseInt(numMatch[0], 10) : null;
    if (numericJobId) {
      try {
        fetch(`/api/jobs/${numericJobId}/save`, {
          method: 'POST',
          credentials: 'include'
        }).catch(() => {});
      } catch (_) {}
    }
  };

  const isFreelancerSaved = (id: string) => savedFreelancerIds.includes(id);
  const isEmployerSaved = (id: string) => savedEmployerIds.includes(id);
  const isProjectSaved = (id: string) => savedProjectIds.includes(id);

  // Project Invitations Actions
  const sendProjectInvitation = (params: {
    projectId: string;
    freelancerId: string;
    message?: string;
  }) => {
    const project = projects.find((p) => p.id === params.projectId);
    const targetFreelancer = freelancers.find((f) => f.id === params.freelancerId);
    if (!project || !targetFreelancer) {
      addToast('Không tìm thấy thông tin dự án hoặc freelancer!', 'error');
      return;
    }

    const freelancerUserId = targetFreelancer.userId || 'usr-free-1';

    const newInvitation: ProjectInvitation = {
      id: `inv-${Date.now()}`,
      projectId: project.id,
      projectTitle: project.title,
      projectCategory: project.category,
      projectBudget: project.budget,
      projectDeadline: project.deadline,
      projectDescription: project.description,
      employerId: currentUser.id,
      employerName: currentUser.name,
      employerCompany: currentUser.companyName || 'Doanh nghiệp tuyển dụng',
      employerAvatar: currentUser.avatar,
      freelancerId: targetFreelancer.id,
      freelancerUserId: freelancerUserId,
      freelancerName: targetFreelancer.name,
      message:
        params.message ||
        `Chào ${targetFreelancer.name}, doanh nghiệp chúng tôi muốn mời bạn tham gia thực hiện dự án "${project.title}".`,
      status: 'PENDING',
      createdAt: new Date().toLocaleString('vi-VN')
    };

    setInvitations((prev) => [newInvitation, ...prev]);

    // Send direct Notification to Freelancer
    addNotification({
      userId: freelancerUserId,
      title: `Lời mời nhận dự án mới từ ${currentUser.name} (${currentUser.companyName || 'Nhà tuyển dụng'})`,
      message: `Doanh nghiệp đã gửi lời mời bạn tham gia dự án "${project.title}" với ngân sách ${project.budget.toLocaleString('vi-VN')} đ.`,
      type: 'INVITATION',
      link: '/freelancer/dashboard'
    });

    addToast(`✓ Đã gửi lời mời tham gia dự án "${project.title}" đến ${targetFreelancer.name}!`, 'success');
  };

  const acceptInvitation = (invitationId: string, responseNote?: string, customBid?: number) => {
    const invitation = invitations.find((i) => i.id === invitationId);
    if (!invitation) return;

    const updatedInvitations = invitations.map((i) =>
      i.id === invitationId
        ? { ...i, status: 'ACCEPTED' as const, respondedAt: new Date().toLocaleString('vi-VN') }
        : i
    );
    setInvitations(updatedInvitations);

    // Create a proposal for this project
    const targetProject = projects.find((p) => p.id === invitation.projectId);
    if (targetProject) {
      const newProp: Proposal = {
        id: `prop-inv-${Date.now()}`,
        projectId: targetProject.id,
        freelancerId: invitation.freelancerId,
        freelancerName: invitation.freelancerName,
        freelancerAvatar: currentUser.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=freelancer',
        freelancerTitle: currentUser.bio?.slice(0, 50) || 'Chuyên gia Freelancer Đã Xác Thực',
        freelancerRating: 5.0,
        freelancerCompletedCount: 1,
        bidAmount: customBid || invitation.projectBudget,
        estimatedDays: parseInt(invitation.projectDeadline || '14') || 14,
        coverLetter: responseNote || 'Tôi đã tiếp nhận lời mời và đồng ý tham gia dự án với các tiêu chí đã trao đổi.',
        status: 'ACCEPTED',
        createdAt: new Date().toLocaleString('vi-VN')
      };
      setProposals((prev) => [newProp, ...prev]);
    }

    // Send notification to employer
    addNotification({
      userId: invitation.employerId,
      title: `Freelancer ${invitation.freelancerName} đã CHẤP NHẬN lời mời dự án!`,
      message: `Ứng viên đã đồng ý nhận dự án "${invitation.projectTitle}" và sẵn sàng bắt đầu công việc.`,
      type: 'CONTRACT',
      link: '/employer/dashboard'
    });

    addToast(`✓ Bạn đã chấp nhận lời mời dự án "${invitation.projectTitle}" thành công!`, 'success');
  };

  const declineInvitation = (invitationId: string, reason?: string) => {
    const invitation = invitations.find((i) => i.id === invitationId);
    if (!invitation) return;

    const declineMsg = reason || 'Lịch trình hiện tại đã kín';
    const updatedInvitations = invitations.map((i) =>
      i.id === invitationId
        ? {
            ...i,
            status: 'DECLINED' as const,
            declineReason: declineMsg,
            respondedAt: new Date().toLocaleString('vi-VN')
          }
        : i
    );
    setInvitations(updatedInvitations);

    // Send notification to employer
    addNotification({
      userId: invitation.employerId,
      title: `Freelancer ${invitation.freelancerName} đã từ chối lời mời dự án`,
      message: `Ứng viên không thể tham gia dự án "${invitation.projectTitle}". Lý do: ${declineMsg}.`,
      type: 'PROPOSAL',
      link: '/employer/dashboard'
    });

    addToast(`Đã từ chối lời mời dự án "${invitation.projectTitle}".`, 'info');
  };

  return (
    <DemoContext.Provider
      value={{
        currentUser,
        users,
        projects,
        proposals,
        orders,
        reviews,
        disputes,
        freelancers,
        vnpayTransactions,
        platformConfig,
        notifications,
        unreadNotificationsCount,
        toasts,
        addToast,
        removeToast,
        resetAllDemoData,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        isUserProfileModalOpen,
        openUserProfileModal,
        closeUserProfileModal,
        isUnverifiedModalOpen,
        unverifiedBlockedAction,
        openUnverifiedModal,
        closeUnverifiedModal,
        isVNPayModalOpen,
        vnpayModalParams,
        openVNPayModal,
        closeVNPayModal,
        isWithdrawModalOpen,
        openWithdrawModal,
        closeWithdrawModal,
        withdrawMoney,
        addBankAccount,
        removeBankAccount,
        switchRole,
        switchUserById,
        pendingVerificationEmail,
        setPendingVerificationEmail,
        completeOtpVerification,
        registerUser,
        verifyEmail,
        resendVerificationEmail,
        changeVerificationEmail,
        submitKyc,
        loginUser,
        loginWithGoogle,
        registerWithGoogle,
        handleGoogleAuthSuccess,
        completeGoogleRegister,
        logout,
        adminUpdateUserStatus,
        adminToggleEmailVerified,
        adminUpdateProjectStatus,
        updatePlatformConfig,
        deleteReview,
        createProject,
        submitProposal,
        acceptProposal,
        deliverWork,
        requestRevision,
        acceptDelivery,
        fileDispute,
        resolveDispute,
        submitReview,
        updateUserProfile,
        withdrawProposal,
        updateProposal,
        updateProject,
        jobQuestions,
        fetchJobQuestions,
        askJobQuestion,
        answerJobQuestion,
        orderMessages,
        sendOrderMessage,
        updateFreelancerBioAndPortfolio,
        savedFreelancerIds,
        savedEmployerIds,
        savedProjectIds,
        toggleSaveFreelancer,
        toggleSaveEmployer,
        toggleSaveProject,
        isFreelancerSaved,
        isEmployerSaved,
        isProjectSaved,
        invitations,
        sendProjectInvitation,
        acceptInvitation,
        declineInvitation
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
