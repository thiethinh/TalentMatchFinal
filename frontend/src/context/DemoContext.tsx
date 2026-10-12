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
  ProjectInvitation
} from '../types';
import {
  GUEST_USER,
  INITIAL_USERS,
  FREELANCERS,
  PROJECTS,
  PROPOSALS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  INITIAL_DISPUTES,
  INITIAL_VNPAY_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_INVITATIONS
} from '../data/mockData';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

const STORAGE_KEY_USERS = 'talentmatch_demo_users_v4';
const STORAGE_KEY_CURRENT_USER_ID = 'talentmatch_demo_current_user_id_v4';
const STORAGE_KEY_PROJECTS = 'talentmatch_demo_projects_v4';
const STORAGE_KEY_PROPOSALS = 'talentmatch_demo_proposals_v4';
const STORAGE_KEY_ORDERS = 'talentmatch_demo_orders_v4';
const STORAGE_KEY_REVIEWS = 'talentmatch_demo_reviews_v4';
const STORAGE_KEY_DISPUTES = 'talentmatch_demo_disputes_v4';
const STORAGE_KEY_VNPAY = 'talentmatch_demo_vnpay_v4';
const STORAGE_KEY_CONFIG = 'talentmatch_demo_config_v4';
const STORAGE_KEY_FREELANCERS = 'talentmatch_demo_freelancers_v4';
const STORAGE_KEY_NOTIFICATIONS = 'talentmatch_demo_notifications_v4';
const STORAGE_KEY_SAVED_FREELANCERS = 'talentmatch_demo_saved_freelancers_v4';
const STORAGE_KEY_SAVED_EMPLOYERS = 'talentmatch_demo_saved_employers_v4';
const STORAGE_KEY_SAVED_PROJECTS = 'talentmatch_demo_saved_projects_v4';
const STORAGE_KEY_INVITATIONS = 'talentmatch_demo_invitations_v4';

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
  authModalMode: 'login' | 'register' | 'verification' | 'google-role';
  openAuthModal: (mode?: 'login' | 'register' | 'verification') => void;
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
  changeVerificationEmail: (newEmail: string) => void;
  submitKyc: (data?: {
    idNumber?: string;
    fullName?: string;
    taxCode?: string;
    companyName?: string;
    userId?: string;
  }) => void;
  loginUser: (email: string, password?: string) => { success: boolean; isUnverified?: boolean; message?: string };
  loginWithGoogle: () => void;
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
  deliverWork: (orderId: string, note: string, fileName: string, demoUrl?: string) => void;
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
  const [users, setUsers] = useState<User[]>(() => loadFromStorage(STORAGE_KEY_USERS, INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUserId = localStorage.getItem(STORAGE_KEY_CURRENT_USER_ID);
    if (savedUserId === 'usr-guest') return GUEST_USER;
    const savedUsers = loadFromStorage(STORAGE_KEY_USERS, INITIAL_USERS);
    if (savedUserId) {
      const found = savedUsers.find((u: User) => u.id === savedUserId);
      if (found) return found;
    }
    return savedUsers[0] || INITIAL_USERS[0];
  });
  const [projects, setProjects] = useState<Project[]>(() => loadFromStorage(STORAGE_KEY_PROJECTS, PROJECTS));
  const [proposals, setProposals] = useState<Proposal[]>(() => loadFromStorage(STORAGE_KEY_PROPOSALS, PROPOSALS));
  const [orders, setOrders] = useState<Order[]>(() => loadFromStorage(STORAGE_KEY_ORDERS, INITIAL_ORDERS));
  const [reviews, setReviews] = useState<Review[]>(() => loadFromStorage(STORAGE_KEY_REVIEWS, INITIAL_REVIEWS));
  const [disputes, setDisputes] = useState<Dispute[]>(() => loadFromStorage(STORAGE_KEY_DISPUTES, INITIAL_DISPUTES));
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>(() =>
    loadFromStorage(STORAGE_KEY_FREELANCERS, FREELANCERS)
  );
  const [vnpayTransactions, setVnpayTransactions] = useState<VNPayTransaction[]>(() =>
    loadFromStorage(STORAGE_KEY_VNPAY, INITIAL_VNPAY_TRANSACTIONS)
  );
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig>(() =>
    loadFromStorage(STORAGE_KEY_CONFIG, DEFAULT_CONFIG)
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadFromStorage(STORAGE_KEY_NOTIFICATIONS, INITIAL_NOTIFICATIONS)
  );
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Saved Bookmarks (Freelancers, Employers, Projects)
  const [savedFreelancerIds, setSavedFreelancerIds] = useState<string[]>(() =>
    loadFromStorage(STORAGE_KEY_SAVED_FREELANCERS, ['free-1', 'free-2'])
  );
  const [savedEmployerIds, setSavedEmployerIds] = useState<string[]>(() =>
    loadFromStorage(STORAGE_KEY_SAVED_EMPLOYERS, ['usr-emp-1', 'usr-emp-2'])
  );
  const [savedProjectIds, setSavedProjectIds] = useState<string[]>(() =>
    loadFromStorage(STORAGE_KEY_SAVED_PROJECTS, ['prj-1', 'prj-2'])
  );

  // Project Invitations State
  const [invitations, setInvitations] = useState<ProjectInvitation[]>(() =>
    loadFromStorage(STORAGE_KEY_INVITATIONS, INITIAL_INVITATIONS)
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

  // Notifications calculation and actions
  const unreadNotificationsCount = notifications.filter(
    (n) => (n.userId === currentUser.id || n.userId === 'all') && !n.isRead
  ).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
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
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'verification' | 'google-role'>('login');
  const [pendingGoogleUser, setPendingGoogleUser] = useState<{ email: string; name: string; avatar: string } | null>(null);

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

    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, INITIAL_USERS[0].id);
    setProjects(PROJECTS);
    setProposals(PROPOSALS);
    setOrders(INITIAL_ORDERS);
    setReviews(INITIAL_REVIEWS);
    setDisputes(INITIAL_DISPUTES);
    setFreelancers(FREELANCERS);
    setVnpayTransactions(INITIAL_VNPAY_TRANSACTIONS);
    setPlatformConfig(DEFAULT_CONFIG);
    setInvitations(INITIAL_INVITATIONS);

    addToast('Đã khôi phục toàn bộ dữ liệu mẫu TalentMatch ban đầu!', 'info');
  };

  const openAuthModal = (mode: 'login' | 'register' | 'verification' = 'login') => {
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
      setCurrentUser(found);
      localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, found.id);
      addToast(`Đã đăng nhập dưới tên: ${found.name} (${found.role.toUpperCase()})`, 'info');
    }
  };

  const registerUser = (data: { name: string; email: string; password?: string; role: 'freelancer' | 'employer'; phone?: string }) => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email,
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(data.name)}`,
      role: data.role,
      phone: data.phone,
      isVerified: false,
      emailVerified: false,
      accountStatus: 'PENDING',
      kycStatus: 'NOT_SUBMITTED',
      balance: 0,
      escrowBalance: 0,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Vừa tạo tài khoản'
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, newUser.id);

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

    setAuthModalMode('verification');
    addToast('Đăng ký thành công! Vui lòng xác thực email để hoàn tất kích hoạt.', 'warning');
  };

  const verifyEmail = (userId?: string) => {
    const targetId = userId || currentUser.id;
    setUsers((prev) =>
      prev.map((u) => (u.id === targetId ? { ...u, emailVerified: true, accountStatus: 'ACTIVE' } : u))
    );
    if (currentUser.id === targetId) {
      setCurrentUser((prev) => ({ ...prev, emailVerified: true, accountStatus: 'ACTIVE' }));
    }
    addToast('✓ Email đã được xác thực thành công! Bạn có thể thực hiện mọi thao tác.', 'success');
  };

  const resendVerificationEmail = (emailTarget: string) => {
    addToast(`Mã xác thực mới đã gửi tới ${emailTarget}. Vui lòng kiểm tra hộp thư.`, 'info');
  };

  const changeVerificationEmail = (newEmail: string) => {
    setCurrentUser((prev) => ({ ...prev, email: newEmail }));
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? { ...u, email: newEmail } : u)));
    addToast(`Đã cập nhật email xác thực mới: ${newEmail}`, 'success');
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

  const loginUser = (email: string) => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      return { success: false, message: 'Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại.' };
    }
    setCurrentUser(found);
    localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, found.id);
    if (!found.emailVerified) {
      return { success: false, isUnverified: true, message: 'Tài khoản chưa xác thực email.' };
    }
    addToast(`Đăng nhập thành công! Chào mừng ${found.name}.`, 'success');
    return { success: true };
  };

  const loginWithGoogle = () => {
    const googleEmail = 'google.user@gmail.com';
    const found = users.find((u) => u.email === googleEmail);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, found.id);
      setIsAuthModalOpen(false);
      addToast(`Đăng nhập thành công bằng Google: ${found.name}`, 'success');
    } else {
      setPendingGoogleUser({
        email: googleEmail,
        name: 'Trần Google User',
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(googleEmail)}`
      });
      setAuthModalMode('google-role');
    }
  };

  const completeGoogleRegister = (role: 'freelancer' | 'employer') => {
    if (!pendingGoogleUser) return;
    const newUser: User = {
      id: `usr-gg-${Date.now()}`,
      name: pendingGoogleUser.name,
      email: pendingGoogleUser.email,
      avatar: pendingGoogleUser.avatar,
      role: role,
      isVerified: true,
      emailVerified: true,
      accountStatus: 'ACTIVE',
      kycStatus: 'NOT_SUBMITTED',
      balance: 10000000,
      escrowBalance: 0,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Vừa đăng nhập Google'
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, newUser.id);
    setPendingGoogleUser(null);
    setIsAuthModalOpen(false);
    addToast(`Tạo tài khoản ${role.toUpperCase()} thành công bằng Google!`, 'success');
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
    addToast('Đã đăng dự án tuyển dụng mới thành công!', 'success');
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
          milestones: [
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

        closeVNPayModal();
        addToast(`Thanh toán VNPAY ${totalAmount.toLocaleString('vi-VN')}đ thành công! Đã ký hợp đồng & khóa tiền Escrow.`, 'success');
      }
    });
  };

  const deliverWork = (orderId: string, note: string, fileName: string, demoUrl?: string) => {
    if (!checkActionGuard('Nộp sản phẩm bàn giao')) return;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const newDelivery = {
            id: `del-${Date.now()}`,
            fileName,
            fileSize: '18.5 MB',
            uploadedAt: new Date().toLocaleString('vi-VN'),
            note,
            demoUrl
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
    addToast('Đã nộp sản phẩm bàn giao thành công! Đếm ngược 72 giờ tự động nghiệm thu đã kích hoạt.', 'success');
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
        registerUser,
        verifyEmail,
        resendVerificationEmail,
        changeVerificationEmail,
        submitKyc,
        loginUser,
        loginWithGoogle,
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
