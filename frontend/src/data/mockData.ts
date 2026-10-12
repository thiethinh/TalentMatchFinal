import type {
  User,
  FreelancerProfile,
  Project,
  Proposal,
  Order,
  Review,
  Dispute,
  VNPayTransaction,
  AppNotification,
  ProjectInvitation
} from '../types';

export const GUEST_USER: User = {
  id: 'usr-guest',
  name: 'Khách Vãng Lai',
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

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-emp-1',
    name: 'Lê Thu Hà',
    email: 'ha.le@techstartup.vn',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=le-thu-ha',
    role: 'employer',
    companyName: 'Công ty Cổ phần TechStartup Việt Nam',
    taxCode: '0101234567',
    phone: '0987654321',
    isVerified: true,
    emailVerified: true,
    accountStatus: 'ACTIVE',
    kycStatus: 'VERIFIED',
    balance: 50000000,
    escrowBalance: 9500000,
    createdAt: '2026-01-15',
    lastLogin: '2026-09-28 05:40',
    bankAccounts: [
      {
        id: 'ba-1',
        bankName: 'Vietcombank (Ngoại Thương Việt Nam)',
        bankCode: 'VCB',
        accountNumber: '1028394857',
        accountHolder: 'LE THU HA',
        isDefault: true,
        createdAt: '2026-01-16'
      }
    ]
  },
  {
    id: 'usr-emp-2',
    name: 'Phạm Tuấn Anh',
    email: 'tuan.pham@invest.vn',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=pham-tuan-anh',
    role: 'employer',
    companyName: 'Invest Growth Vietnam',
    taxCode: '0319876543',
    phone: '0903332211',
    isVerified: true,
    emailVerified: true,
    accountStatus: 'ACTIVE',
    kycStatus: 'VERIFIED',
    balance: 32000000,
    escrowBalance: 0,
    createdAt: '2026-02-20',
    lastLogin: '2026-09-27 18:20',
    bankAccounts: [
      {
        id: 'ba-2',
        bankName: 'Techcombank (Kỹ Thương Việt Nam)',
        bankCode: 'TCB',
        accountNumber: '190384759281',
        accountHolder: 'PHAM TUAN ANH',
        isDefault: true,
        createdAt: '2026-02-21'
      }
    ]
  },
  {
    id: 'usr-unverified-emp',
    name: 'Hoàng Thị Yến (Chưa xác thực)',
    email: 'yen.hoang.demo@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=hoang-thi-yen',
    role: 'employer',
    companyName: 'Công ty TNHH Yến Fashion',
    phone: '0944556677',
    isVerified: false,
    emailVerified: false,
    accountStatus: 'PENDING',
    kycStatus: 'NOT_SUBMITTED',
    balance: 0,
    escrowBalance: 0,
    createdAt: '2026-09-27',
    lastLogin: '2026-09-27 19:30',
    bankAccounts: []
  },
  {
    id: 'usr-free-1',
    name: 'Nguyễn Minh Anh',
    email: 'minhanh.dev@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=nguyen-minh-anh',
    role: 'freelancer',
    phone: '0901234567',
    isVerified: true,
    emailVerified: true,
    accountStatus: 'ACTIVE',
    kycStatus: 'VERIFIED',
    balance: 18500000,
    escrowBalance: 4500000,
    bio: 'Chuyên gia Full-Stack Web & Mobile App với hơn 6 năm kinh nghiệm thực chiến phát triển các giải pháp thương mại điện tử, ReactJS, Next.js, Node.js và Flutter cho các doanh nghiệp SME tại Việt Nam.',
    portfolioUrl: 'https://github.com/minhanh-dev/portfolio-vietnam',
    skills: ['ReactJS', 'Next.js', 'Node.js', 'TypeScript', 'Flutter', 'Tailwind CSS', 'REST API', 'MySQL'],
    createdAt: '2026-01-10',
    lastLogin: '2026-09-28 05:15',
    bankAccounts: [
      {
        id: 'ba-3',
        bankName: 'MB Bank (Quân Đội)',
        bankCode: 'MBB',
        accountNumber: '090123456789',
        accountHolder: 'NGUYEN MINH ANH',
        isDefault: true,
        createdAt: '2026-01-12'
      }
    ]
  },
  {
    id: 'usr-free-2',
    name: 'Trần Hoàng Nam',
    email: 'hoangnam.design@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=tran-hoang-nam',
    role: 'freelancer',
    phone: '0912345678',
    isVerified: true,
    emailVerified: true,
    accountStatus: 'ACTIVE',
    kycStatus: 'VERIFIED',
    balance: 24000000,
    escrowBalance: 4050000,
    bio: 'Lead Designer sáng tạo với hơn 5 năm kinh nghiệm thiết kế UI/UX Mobile & Web App, Design System và xây dựng Bộ nhận diện thương hiệu số chuẩn chuyển đổi cho các startup.',
    portfolioUrl: 'https://behance.net/hoangnam_uxui_vietnam',
    skills: ['UI/UX Design', 'Figma', 'Branding', 'Design System', 'Logo Design', 'Adobe Illustrator'],
    createdAt: '2026-02-05',
    lastLogin: '2026-09-27 22:10',
    bankAccounts: [
      {
        id: 'ba-4',
        bankName: 'VietinBank (Công Thương Việt Nam)',
        bankCode: 'CTG',
        accountNumber: '108829384756',
        accountHolder: 'TRAN HOANG NAM',
        isDefault: true,
        createdAt: '2026-02-06'
      }
    ]
  },
  {
    id: 'usr-free-3',
    name: 'Phạm Quốc Huy',
    email: 'huy.media@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=pham-quoc-huy',
    role: 'freelancer',
    phone: '0933445566',
    isVerified: true,
    emailVerified: true,
    accountStatus: 'ACTIVE',
    kycStatus: 'VERIFIED',
    balance: 8200000,
    escrowBalance: 0,
    bio: 'Video Editor & Motion Graphic Creator chuyên sản xuất video quảng cáo ngắn TikTok Ads, Reels, Shorts và YouTube chuyên nghiệp, chuẩn phong cách thịnh hành giới trẻ.',
    portfolioUrl: 'https://youtube.com/@huy_media_portfolio',
    skills: ['Premiere Pro', 'After Effects', 'TikTok Ads', 'Motion Graphics', 'Color Grading'],
    createdAt: '2026-03-12',
    lastLogin: '2026-09-26 16:30'
  },
  {
    id: 'usr-free-4',
    name: 'Vũ Linh Đan',
    email: 'linhdan.marketing@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=vu-linh-dan',
    role: 'freelancer',
    phone: '0977112233',
    isVerified: true,
    emailVerified: true,
    accountStatus: 'ACTIVE',
    kycStatus: 'VERIFIED',
    balance: 14600000,
    escrowBalance: 0,
    bio: 'Senior Performance Marketer & SEO Specialist với 4 năm kinh nghiệm tối ưu chiến dịch Facebook Ads, Google Ads và xây dựng chiến lược Content chuyển đổi cao cho các nhãn hàng F&B, thời trang.',
    portfolioUrl: 'https://linhdan-marketing.myportfolio.com',
    skills: ['Facebook Ads', 'Google Ads', 'SEO Google', 'Content Marketing', 'Copywriting'],
    createdAt: '2026-03-01',
    lastLogin: '2026-09-27 14:10'
  },
  {
    id: 'usr-free-5',
    name: 'Đỗ Bảo Long',
    email: 'baolong.ai@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=do-bao-long',
    role: 'freelancer',
    phone: '0966884422',
    isVerified: true,
    emailVerified: true,
    accountStatus: 'ACTIVE',
    kycStatus: 'VERIFIED',
    balance: 31000000,
    escrowBalance: 0,
    bio: 'Senior Python & AI Engineer với 7 năm kinh nghiệm xây dựng hệ thống xử lý dữ liệu lớn, tích hợp OpenAI/Gemini API, OCR tiếng Việt và phát triển backend FastAPI/Django hiệu năng cao.',
    portfolioUrl: 'https://github.com/baolong-ai-engineer',
    skills: ['Python', 'FastAPI', 'AI/LLM', 'PostgreSQL', 'Docker', 'REST API'],
    createdAt: '2026-01-20',
    lastLogin: '2026-09-28 04:30'
  },
  {
    id: 'usr-unverified-free',
    name: 'Phạm Đức Minh (Chưa xác thực)',
    email: 'ducminh.demo@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=pham-duc-minh',
    role: 'freelancer',
    phone: '0988776655',
    isVerified: false,
    emailVerified: false,
    accountStatus: 'PENDING',
    kycStatus: 'NOT_SUBMITTED',
    balance: 0,
    escrowBalance: 0,
    bio: 'Lập trình viên Frontend mới tốt nghiệp, đam mê công nghệ React và Tailwind CSS.',
    portfolioUrl: 'https://github.com/ducminh-demo',
    skills: ['ReactJS', 'HTML/CSS', 'JavaScript'],
    createdAt: '2026-09-27',
    lastLogin: '2026-09-27 20:00'
  },
  {
    id: 'usr-banned',
    name: 'Nguyễn Văn Vi Phạm (Bị khóa)',
    email: 'banned.user@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=nguyen-van-vi-pham',
    role: 'freelancer',
    phone: '0977889900',
    isVerified: false,
    emailVerified: true,
    accountStatus: 'SUSPENDED',
    kycStatus: 'NOT_SUBMITTED',
    balance: 0,
    escrowBalance: 0,
    bio: 'Tài khoản đã bị tạm khóa do vi phạm chính sách giao dịch ngoài sàn.',
    createdAt: '2026-08-01',
    lastLogin: '2026-09-10'
  },
  {
    id: 'usr-admin-1',
    name: 'Quản Trị Viên TalentMatch',
    email: 'admin@talentmatch.vn',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=admin-talentmatch',
    role: 'admin',
    phone: '19008888',
    isVerified: true,
    emailVerified: true,
    accountStatus: 'ACTIVE',
    kycStatus: 'VERIFIED',
    balance: 95000000,
    escrowBalance: 13550000,
    createdAt: '2026-01-01',
    lastLogin: '2026-09-28 05:50'
  }
];

export const FREELANCERS: FreelancerProfile[] = [
  {
    id: 'free-1',
    userId: 'usr-free-1',
    name: 'Nguyễn Minh Anh',
    title: 'Senior Full-Stack & Mobile App Developer',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=nguyen-minh-anh',
    bio: 'Chuyên gia Full-Stack Web & Mobile App với hơn 6 năm kinh nghiệm thực chiến phát triển các giải pháp thương mại điện tử, ReactJS, Next.js, Node.js và Flutter cho các doanh nghiệp SME tại Việt Nam. Cam kết đúng tiến độ, viết code chuẩn Clean Architecture.',
    location: 'Hà Nội, Việt Nam',
    rating: 4.92,
    reviewCount: 48,
    completedOrders: 52,
    hourlyRate: 350000,
    skills: ['ReactJS', 'Next.js', 'Node.js', 'TypeScript', 'Flutter', 'Tailwind CSS', 'REST API', 'MySQL'],
    talentCreditScore: 940,
    talentCreditBadge: 'Top Rated',
    isVerified: true,
    portfolioUrl: 'https://github.com/minhanh-dev/portfolio-vietnam',
    portfolio: [
      {
        id: 'port-1',
        title: 'Hệ thống E-Commerce Bán lẻ Nông sản Sạch',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600',
        category: 'IT & Lập trình',
        description: 'Xây dựng toàn bộ giao diện Web ReactJS và API Backend Node.js cho hệ thống bán lẻ nông sản sạch, tích hợp thanh toán VNPay.',
        projectUrl: 'https://nongsan-demo.vercel.app'
      },
      {
        id: 'port-2',
        title: 'Ứng dụng Quản lý Tài chính Doanh nghiệp',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600',
        category: 'IT & Lập trình',
        description: 'Lập trình App di động Flutter với giao diện tối giản, tích hợp biểu đồ thống kê chi tiêu và báo cáo tự động.',
        projectUrl: 'https://finance-app-demo.flutter.dev'
      }
    ]
  },
  {
    id: 'free-2',
    userId: 'usr-free-2',
    name: 'Trần Hoàng Nam',
    title: 'UI/UX & Brand Identity Lead Designer',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=tran-hoang-nam',
    bio: 'Designer sáng tạo có 5 năm thiết kế Bộ nhận diện thương hiệu, UI/UX Web/Mobile App hiện đại cho hơn 80 startup và doanh nghiệp Việt Nam. Tôi luôn đặt trải nghiệm người dùng và tỷ lệ chuyển đổi sản phẩm lên hàng đầu.',
    location: 'TP. Hồ Chí Minh, Việt Nam',
    rating: 4.95,
    reviewCount: 65,
    completedOrders: 70,
    hourlyRate: 300000,
    skills: ['UI/UX Design', 'Figma', 'Branding', 'Logo Design', 'Design System', 'Adobe Illustrator'],
    talentCreditScore: 965,
    talentCreditBadge: 'Top Rated',
    isVerified: true,
    portfolioUrl: 'https://behance.net/hoangnam_uxui_vietnam',
    portfolio: [
      {
        id: 'port-3',
        title: 'Bộ Nhận Diện Thương Hiệu Chuỗi Cà Phê The Garden',
        image: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=600',
        category: 'Thiết kế & Đồ họa',
        description: 'Thiết kế Logo, Guideline màu sắc, Bao bì sản phẩm và Menu định dạng số chuẩn in ấn và hiển thị di động.',
        projectUrl: 'https://behance.net/gallery/thegarden-coffee-branding'
      },
      {
        id: 'port-4',
        title: 'Giao diện Mobile App E-Commerce Thời Trang',
        image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=600',
        category: 'Thiết kế & Đồ họa',
        description: 'Hơn 45 màn hình Figma chuẩn iOS/Android kèm prototype tương tác mượt mà.',
        projectUrl: 'https://figma.com/@hoangnam_fashion_ui'
      }
    ]
  },
  {
    id: 'free-3',
    userId: 'usr-free-3',
    name: 'Phạm Quốc Huy',
    title: 'Video Editor & Motion Graphics Specialist',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=pham-quoc-huy',
    bio: 'Dựng video quảng cáo TikTok/Reels/YouTube chuyên nghiệp. Hơn 4 năm làm việc với các agency truyền thông uy tín tại Việt Nam. Chuyên sâu về hiệu ứng Motion Graphics cuốn hút và âm thanh kích thích mua hàng.',
    location: 'Đà Nẵng, Việt Nam',
    rating: 4.88,
    reviewCount: 32,
    completedOrders: 36,
    hourlyRate: 250000,
    skills: ['Premiere Pro', 'After Effects', 'Video Editing', 'Motion Graphics', 'TikTok Ads', 'Color Grading'],
    talentCreditScore: 890,
    talentCreditBadge: 'Gold',
    isVerified: true,
    portfolioUrl: 'https://youtube.com/@huy_media_portfolio',
    portfolio: [
      {
        id: 'port-5',
        title: 'Chuỗi Video Quảng Cáo Mỹ Phẩm TikTok Ads',
        image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=600',
        category: 'Video & Animation',
        description: 'Dựng 10 video ngắn đạt hơn 2 triệu lượt xem tự nhiên trên nền tảng TikTok.',
        projectUrl: 'https://tiktok.com/@portfolio_samples'
      }
    ]
  },
  {
    id: 'free-4',
    userId: 'usr-free-4',
    name: 'Vũ Linh Đan',
    title: 'Performance Marketing & SEO Expert',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=vu-linh-dan',
    bio: 'Tối ưu hóa chiến dịch quảng cáo và SEO Organic với ROI thực tế. Đã triển khai hơn 50 chiến dịch quảng cáo đa kênh và đưa hơn 200 từ khóa lên Top 1 Google cho các doanh nghiệp TMĐT.',
    location: 'Hà Nội, Việt Nam',
    rating: 4.85,
    reviewCount: 28,
    completedOrders: 30,
    hourlyRate: 220000,
    skills: ['Facebook Ads', 'Google Ads', 'SEO Google', 'Content Marketing', 'Copywriting'],
    talentCreditScore: 875,
    talentCreditBadge: 'Gold',
    isVerified: true,
    portfolioUrl: 'https://linhdan-marketing.myportfolio.com',
    portfolio: [
      {
        id: 'port-6',
        title: 'Chiến dịch Performance Ads F&B Doanh số +320%',
        image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=600',
        category: 'Digital Marketing',
        description: 'Tối ưu hóa phễu chuyển đổi và chi phí quảng cáo ROAS đạt 4.8x.',
        projectUrl: 'https://linhdan-marketing.myportfolio.com/case-study-fb'
      }
    ]
  },
  {
    id: 'free-5',
    userId: 'usr-free-5',
    name: 'Đỗ Bảo Long',
    title: 'Senior Python & AI/LLM Engineer',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=do-bao-long',
    bio: 'Kỹ sư AI và Backend Python với 7 năm kinh nghiệm thực chiến phát triển API FastAPI/Django hiệu năng cao, tích hợp mô hình ngôn ngữ lớn LLM và xử lý dữ liệu thông minh cho doanh nghiệp.',
    location: 'TP. Hồ Chí Minh, Việt Nam',
    rating: 4.96,
    reviewCount: 42,
    completedOrders: 45,
    hourlyRate: 450000,
    skills: ['Python', 'FastAPI', 'AI/LLM', 'PostgreSQL', 'Docker', 'REST API'],
    talentCreditScore: 970,
    talentCreditBadge: 'Top Rated',
    isVerified: true,
    portfolioUrl: 'https://github.com/baolong-ai-engineer',
    portfolio: [
      {
        id: 'port-7',
        title: 'Hệ thống Trợ lý AI Chăm sóc Khách hàng Tự động',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
        category: 'IT & Lập trình',
        description: 'Tích hợp mô hình AI LLM phân loại thắc mắc và tự động phản hồi khách hàng theo ngữ cảnh.',
        projectUrl: 'https://github.com/baolong-ai-engineer/rag-chatbot'
      }
    ]
  }
];

export const PROJECTS: Project[] = [
  {
    id: 'prj-1',
    title: 'Tuyển Freelancer Lập trình Ứng dụng Di động Quản lý Kho Hàng cho SME',
    category: 'IT & Lập trình',
    employerId: 'usr-emp-1',
    employerName: 'Lê Thu Hà',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=le-thu-ha',
    employerCompany: 'Công ty Cổ phần TechStartup Việt Nam',
    employerVerified: true,
    budget: 15000000,
    budgetType: 'MILESTONE',
    deadline: '2026-10-30',
    description: 'Doanh nghiệp chúng tôi cần tìm 1 Senior Mobile Developer làm việc theo Hợp đồng Dự án để phát triển App Android/iOS quản lý xuất nhập kho hàng. App cần quét mã QR Code, chụp ảnh chứng từ và đồng bộ dữ liệu với Server Node.js sẵn có. Toàn bộ tiền cọc dự án được thanh toán vào Escrow qua cổng VNPAY.',
    requiredSkills: ['Flutter', 'REST API', 'QR Code Scan', 'Node.js', 'PostgreSQL'],
    status: 'OPEN',
    proposalsCount: 6,
    createdAt: '2026-09-25'
  },
  {
    id: 'prj-2',
    title: 'Thiết kế Bộ Nhận Diện Thương Hiệu & Logo Cho Chuỗi Nhà Hàng Chay',
    category: 'Thiết kế & Đồ họa',
    employerId: 'usr-emp-1',
    employerName: 'Lê Thu Hà',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=le-thu-ha',
    employerCompany: 'Công ty Cổ phần TechStartup Việt Nam',
    employerVerified: true,
    budget: 6000000,
    budgetType: 'FIXED',
    deadline: '2026-10-15',
    description: 'Cần thuê Designer chuyên nghiệp thiết kế Logo, Guideline phối màu, Mẫu Menu nhà hàng và Bảng hiệu mặt tiền cho chuỗi thực phẩm chay mới tại Hà Nội. Yêu cầu bàn giao đầy đủ file gốc Illustrator/Figma vector.',
    requiredSkills: ['Branding', 'Logo Design', 'Adobe Illustrator', 'Figma'],
    status: 'OPEN',
    proposalsCount: 4,
    createdAt: '2026-09-26'
  },
  {
    id: 'prj-3',
    title: 'Lập trình Landing Page Giới Thiệu Khóa Học Đầu Tư Chuẩn Tốc Độ Cao',
    category: 'IT & Lập trình',
    employerId: 'usr-emp-2',
    employerName: 'Phạm Tuấn Anh',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=pham-tuan-anh',
    employerCompany: 'Invest Growth Vietnam',
    employerVerified: true,
    budget: 4500000,
    budgetType: 'FIXED',
    deadline: '2026-10-10',
    description: 'Cần lập trình viên cắt giao diện từ Figma sang ReactJS + Tailwind CSS cho Landing Page giới thiệu khóa học tài chính cá nhân. Yêu cầu chuẩn SEO, tốc độ Google PageSpeed > 90 điểm.',
    requiredSkills: ['ReactJS', 'Tailwind CSS', 'Responsive UI', 'SEO Google'],
    status: 'OPEN',
    proposalsCount: 3,
    createdAt: '2026-09-27'
  },
  {
    id: 'prj-4',
    title: 'Sản xuất Chuỗi 15 Video Ngắn TikTok Ads & Reels Chuyên Nghiệp',
    category: 'Video & Animation',
    employerId: 'usr-emp-1',
    employerName: 'Lê Thu Hà',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=le-thu-ha',
    employerCompany: 'Công ty Cổ phần TechStartup Việt Nam',
    employerVerified: true,
    budget: 8500000,
    budgetType: 'MILESTONE',
    deadline: '2026-10-20',
    description: 'Tìm kiếm Video Editor có kinh nghiệm làm việc với TikTok Ads, thành thạo Premiere & After Effects. Chúng tôi đã có sẵn kịch bản và source quay thô, cần cắt dựng kèm hiệu ứng bắt trend, âm thanh bản quyền và text subtitle chuyển động.',
    requiredSkills: ['TikTok Ads', 'Premiere Pro', 'After Effects', 'Motion Graphics', 'Color Grading'],
    status: 'OPEN',
    proposalsCount: 5,
    createdAt: '2026-09-26'
  },
  {
    id: 'prj-5',
    title: 'Triển khai Chiến Dịch SEO Website Bất Động Sản Nghỉ Dưỡng Lên Top 5 Google',
    category: 'Digital Marketing',
    employerId: 'usr-emp-2',
    employerName: 'Phạm Tuấn Anh',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=pham-tuan-anh',
    employerCompany: 'Invest Growth Vietnam',
    employerVerified: true,
    budget: 12000000,
    budgetType: 'MILESTONE',
    deadline: '2026-11-15',
    description: 'Cần chuyên gia SEO tổng thể Onpage & Offpage tối ưu cho portal bất động sản nghỉ dưỡng cao cấp. Đảm bảo cam kết Top từ khóa chính xác và báo cáo traffic hàng tuần qua Google Search Console.',
    requiredSkills: ['SEO Google', 'Content Marketing', 'Google Analytics', 'Backlinks', 'Technical SEO'],
    status: 'OPEN',
    proposalsCount: 2,
    createdAt: '2026-09-24'
  },
  {
    id: 'prj-6',
    title: 'Phát triển Hệ Thống Quản Lý Đơn Hàng & Dashboard CRM Realtime',
    category: 'IT & Lập trình',
    employerId: 'usr-emp-1',
    employerName: 'Lê Thu Hà',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=le-thu-ha',
    employerCompany: 'Công ty Cổ phần TechStartup Việt Nam',
    employerVerified: true,
    budget: 28000000,
    budgetType: 'MILESTONE',
    deadline: '2026-11-30',
    description: 'Cần tìm đối tác / freelancer senior full-stack xây dựng Dashboard CRM nội bộ quản lý 10,000 khách hàng, tích hợp biểu đồ doanh thu realtime, phân quyền nhân viên đa cấp và xuất file Excel/PDF tự động.',
    requiredSkills: ['ReactJS', 'Node.js', 'PostgreSQL', 'TypeScript', 'REST API', 'Docker'],
    status: 'OPEN',
    proposalsCount: 7,
    createdAt: '2026-09-22'
  },
  {
    id: 'prj-7',
    title: 'Thiết kế UI/UX Trọn Gói Ứng Dụng Đặt Lịch Spa & Làm Đẹp',
    category: 'Thiết kế & Đồ họa',
    employerId: 'usr-emp-2',
    employerName: 'Phạm Tuấn Anh',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=pham-tuan-anh',
    employerCompany: 'Invest Growth Vietnam',
    employerVerified: true,
    budget: 7500000,
    budgetType: 'FIXED',
    deadline: '2026-10-25',
    description: 'Cần thiết kế bộ giao diện Figma hoàn chỉnh cho Mobile App (iOS & Android) gồm 35 màn hình: Đặt lịch hẹn theo khung giờ, chọn nhân viên chăm sóc, thanh toán ví điện tử và tích điểm thành viên.',
    requiredSkills: ['UI/UX Design', 'Figma', 'Design System', 'Mobile UI'],
    status: 'OPEN',
    proposalsCount: 4,
    createdAt: '2026-09-27'
  },
  {
    id: 'prj-8',
    title: 'Thiết Kế Banner Quảng Cáo & POSM Khai Trương Siêu Thị Mini',
    category: 'Thiết kế & Đồ họa',
    employerId: 'usr-emp-1',
    employerName: 'Lê Thu Hà',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=le-thu-ha',
    employerCompany: 'Công ty Cổ phần TechStartup Việt Nam',
    employerVerified: true,
    budget: 2500000,
    budgetType: 'FIXED',
    deadline: '2026-10-08',
    description: 'Thiết kế Standee, Backdrop sân khấu và 8 banner Facebook Ads cho sự kiện khai trương siêu thị thực phẩm sạch. Bàn giao file in ấn chuẩn CMYK.',
    requiredSkills: ['Adobe Illustrator', 'Photoshop', 'Branding', 'Banner Design'],
    status: 'OPEN',
    proposalsCount: 6,
    createdAt: '2026-09-28'
  },
  {
    id: 'prj-9',
    title: 'Tích hợp Mô hình AI Chatbot Tư Vấn Bán Hàng Tự Động Vào Website',
    category: 'IT & Lập trình',
    employerId: 'usr-emp-1',
    employerName: 'Lê Thu Hà',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=le-thu-ha',
    employerCompany: 'Công ty Cổ phần TechStartup Việt Nam',
    employerVerified: true,
    budget: 18000000,
    budgetType: 'MILESTONE',
    deadline: '2026-11-10',
    description: 'Xây dựng module Chatbot thông minh sử dụng OpenAI/Gemini API, nạp tài liệu sản phẩm PDF nội bộ qua kỹ thuật RAG để trả lời khách hàng 24/7 một cách chuẩn xác.',
    requiredSkills: ['Python', 'FastAPI', 'AI/LLM', 'PostgreSQL', 'REST API'],
    status: 'OPEN',
    proposalsCount: 3,
    createdAt: '2026-09-28'
  }
];

export const PROPOSALS: Proposal[] = [
  {
    id: 'prop-1',
    projectId: 'prj-1',
    freelancerId: 'free-1',
    freelancerName: 'Nguyễn Minh Anh',
    freelancerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=nguyen-minh-anh',
    freelancerTitle: 'Senior Full-Stack & Mobile Developer',
    freelancerRating: 4.92,
    freelancerCompletedCount: 52,
    freelancerBio: '6 năm kinh nghiệm phát triển App Flutter và Node.js chuyên sâu về kho vận.',
    freelancerPortfolioUrl: 'https://github.com/minhanh-dev/portfolio-vietnam',
    bidAmount: 14500000,
    estimatedDays: 14,
    coverLetter: 'Chào chị Hà, em đã hoàn thành nhiều dự án App Flutter quét mã QR kết nối Node.js cho kho vận. Em xin đề xuất chia dự án thành 2 Milestone: Milestone 1 (UI + Scan QR) 7,000,000đ và Milestone 2 (Đồng bộ Server + Testing) 7,500,000đ. Đã xem kỹ yêu cầu và cam kết hoàn thành đúng hẹn.',
    status: 'PENDING',
    createdAt: '2026-09-26'
  },
  {
    id: 'prop-2',
    projectId: 'prj-2',
    freelancerId: 'free-2',
    freelancerName: 'Trần Hoàng Nam',
    freelancerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=tran-hoang-nam',
    freelancerTitle: 'UI/UX & Brand Identity Lead Designer',
    freelancerRating: 4.95,
    freelancerCompletedCount: 70,
    freelancerBio: '5 năm kinh nghiệm thiết kế nhận diện thương hiệu cho hơn 80 thương hiệu ẩm thực và startup.',
    freelancerPortfolioUrl: 'https://behance.net/hoangnam_uxui_vietnam',
    bidAmount: 6000000,
    estimatedDays: 7,
    coverLetter: 'Chào chị Hà, em đã từng thiết kế branding cho 3 chuỗi nhà hàng ẩm thực sạch tại TP.HCM. Em gửi kèm link Behance để chị xem phong cách thiết kế tối giản, sang trọng.',
    status: 'PENDING',
    createdAt: '2026-09-27'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'TM-2026-8891',
    projectId: 'prj-2',
    serviceTitle: 'Thiết kế Bộ Nhận Diện Thương Hiệu & Logo Cho Chuỗi Nhà Hàng Chay',
    freelancerId: 'free-2',
    freelancerName: 'Trần Hoàng Nam',
    freelancerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=tran-hoang-nam',
    employerId: 'usr-emp-1',
    employerName: 'Lê Thu Hà',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=le-thu-ha',
    totalAmount: 4500000,
    platformFee: 450000,
    freelancerPayoutAmount: 4050000,
    status: 'ORDER_IN_PROGRESS',
    createdAt: '2026-09-24',
    deadline: '2026-09-29',
    autoAcceptDaysRemaining: 3,
    paymentMethod: 'VNPAY_QR',
    vnpayTransactionId: 'VNPAY-2026-8891-QR',
    milestones: [
      {
        id: 'ms-1',
        title: 'Cột mốc 1: Phác thảo 3 mẫu Logo & Moodboard màu sắc',
        amount: 2250000,
        status: 'ESCROW_FUNDED',
        dueDate: '2026-09-26'
      },
      {
        id: 'ms-2',
        title: 'Cột mốc 2: Hoàn thiện Guideline & Bàn giao File gốc Vector',
        amount: 2250000,
        status: 'ESCROW_FUNDED',
        dueDate: '2026-09-29'
      }
    ],
    deliveries: [],
    revisionCount: 0,
    maxRevisionsAllowed: 3,
    sowRequirements: [
      'Thiết kế 3 định hướng Logo chuẩn Vector Illustrator',
      'Xây dựng Brand Guidelines đầy đủ font chữ và màu sắc',
      'Bàn giao đầy đủ file gốc AI, EPS, SVG, PNG hi-res'
    ],
    notes: 'Tiền cọc đã nạp 100% an toàn tại Ví Tạm Giữ Escrow TalentMatch qua cổng VNPAY.'
  },
  {
    id: 'ord-102',
    orderNumber: 'TM-2026-7732',
    projectId: 'prj-1',
    serviceTitle: 'Lập trình Website Doanh nghiệp bằng ReactJS & Node.js',
    freelancerId: 'free-1',
    freelancerName: 'Nguyễn Minh Anh',
    freelancerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=nguyen-minh-anh',
    employerId: 'usr-emp-1',
    employerName: 'Lê Thu Hà',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=le-thu-ha',
    totalAmount: 5000000,
    platformFee: 500000,
    freelancerPayoutAmount: 4500000,
    status: 'DELIVERED',
    createdAt: '2026-09-20',
    deadline: '2026-09-25',
    autoAcceptDaysRemaining: 2,
    paymentMethod: 'VNPAY_ATM',
    vnpayTransactionId: 'VNPAY-2026-7732-ATM',
    milestones: [
      {
        id: 'ms-3',
        title: 'Cột mốc trọn gói: Lập trình & Deploy Vercel',
        amount: 5000000,
        status: 'DELIVERED',
        dueDate: '2026-09-25'
      }
    ],
    deliveries: [
      {
        id: 'del-1',
        fileName: 'SourceCode_Website_TechStartup_v1.0.zip',
        fileSize: '14.2 MB',
        uploadedAt: '2026-09-25 15:30',
        note: 'Em đã nộp đủ Source Code và Link Demo chạy thực tế tại: https://demo-techstartup.vercel.app. Chị Hà xem và bấm Nghiệm thu giúp em nhé!',
        demoUrl: 'https://demo-techstartup.vercel.app'
      }
    ],
    revisionCount: 0,
    maxRevisionsAllowed: 2,
    sowRequirements: [
      '5 trang giao diện ReactJS chuẩn SEO',
      'Đã cấu hình Domain & Deploy Vercel thành công'
    ]
  },
  {
    id: 'ord-100',
    orderNumber: 'TM-2026-6621',
    serviceTitle: 'Thiết kế Bộ Banner Quảng Cáo Khuyến Mãi Mùa Thu',
    freelancerId: 'free-2',
    freelancerName: 'Trần Hoàng Nam',
    freelancerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=tran-hoang-nam',
    employerId: 'usr-emp-1',
    employerName: 'Lê Thu Hà',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=le-thu-ha',
    totalAmount: 3000000,
    platformFee: 300000,
    freelancerPayoutAmount: 2700000,
    status: 'COMPLETED',
    createdAt: '2026-09-10',
    deadline: '2026-09-15',
    autoAcceptDaysRemaining: 0,
    paymentMethod: 'VNPAY_QR',
    vnpayTransactionId: 'VNPAY-2026-6621-QR',
    milestones: [
      {
        id: 'ms-0',
        title: 'Bàn giao 10 mẫu banner',
        amount: 3000000,
        status: 'ACCEPTED',
        dueDate: '2026-09-15'
      }
    ],
    deliveries: [
      {
        id: 'del-0',
        fileName: 'Autumn_Campaign_Banners_Final.zip',
        fileSize: '25.6 MB',
        uploadedAt: '2026-09-14 10:00',
        note: 'Đã hoàn thiện đầy đủ 10 kích thước banner.'
      }
    ],
    revisionCount: 1,
    maxRevisionsAllowed: 2,
    sowRequirements: ['10 Banner định dạng chuẩn Facebook & Google Ads']
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    orderId: 'ord-100',
    orderTitle: 'Thiết kế Bộ Banner Quảng Cáo Khuyến Mãi Mùa Thu',
    reviewerId: 'usr-emp-1',
    reviewerName: 'Lê Thu Hà',
    reviewerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=le-thu-ha',
    reviewerRole: 'employer',
    targetId: 'free-2',
    targetName: 'Trần Hoàng Nam',
    rating: 5,
    qualityRating: 5,
    deadlineRating: 5,
    communicationRating: 5,
    comment: 'Nam làm việc rất chuyên nghiệp, giao file đúng tiến độ và hỗ trợ chỉnh sửa rất nhiệt tình. Rất an tâm khi giao dịch qua sàn TalentMatch có Escrow giữ tiền và cổng VNPay thanh toán cực nhanh!',
    date: '2026-09-16',
    freelancerReply: 'Cảm ơn chị Hà và TechStartup rất nhiều! Rất hy vọng được tiếp tục đồng hành cùng chị trong các dự án tiếp theo.'
  },
  {
    id: 'rev-2',
    orderId: 'ord-098',
    orderTitle: 'Xây dựng API Backend Node.js cho Ứng dụng Bán lẻ',
    reviewerId: 'usr-emp-2',
    reviewerName: 'Phạm Tuấn Anh',
    reviewerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=pham-tuan-anh',
    reviewerRole: 'employer',
    targetId: 'free-1',
    targetName: 'Nguyễn Minh Anh',
    rating: 5,
    qualityRating: 5,
    deadlineRating: 4.8,
    communicationRating: 5,
    comment: 'Minh Anh code rất chắc tay, viết API có swagger docs đầy đủ, hỗ trợ team test rất chu đáo.',
    date: '2026-09-12'
  }
];

export const INITIAL_DISPUTES: Dispute[] = [
  {
    id: 'dsp-1',
    orderId: 'ord-088',
    orderNumber: 'TM-2026-5510',
    openedBy: 'usr-emp-2',
    openedByName: 'Invest Growth Vietnam',
    reason: 'Freelancer chậm hạn 5 ngày và giao bài không khớp Scope of Work ban đầu',
    evidenceNotes: 'Hợp đồng thỏa thuận giao 3 video trước ngày 15/9 nhưng đến 20/9 mới gửi 1 video thô chưa có phụ đề.',
    status: 'UNDER_REVIEW',
    createdAt: '2026-09-21'
  }
];

export const INITIAL_VNPAY_TRANSACTIONS: VNPayTransaction[] = [
  {
    id: 'vnp-101',
    orderId: 'ord-101',
    orderNumber: 'TM-2026-8891',
    amount: 4500000,
    bankCode: 'VNPAYQR',
    transactionNo: 'VNPAY-2026-8891-QR',
    cardType: 'QR_CODE',
    payDate: '2026-09-24 14:20:05',
    status: 'SUCCESS',
    type: 'ESCROW_DEPOSIT',
    description: 'Nạp cọc Escrow dự án Branding chuỗi nhà hàng qua VNPAY-QR',
    userEmail: 'ha.le@techstartup.vn'
  },
  {
    id: 'vnp-102',
    orderId: 'ord-102',
    orderNumber: 'TM-2026-7732',
    amount: 5000000,
    bankCode: 'NCB',
    transactionNo: 'VNPAY-2026-7732-ATM',
    cardType: 'ATM_CARD',
    payDate: '2026-09-20 09:15:30',
    status: 'SUCCESS',
    type: 'ESCROW_DEPOSIT',
    description: 'Nạp cọc Escrow dự án Website ReactJS qua thẻ ATM nội địa',
    userEmail: 'ha.le@techstartup.vn'
  },
  {
    id: 'vnp-100',
    orderId: 'ord-100',
    orderNumber: 'TM-2026-6621',
    amount: 3000000,
    bankCode: 'VNPAYQR',
    transactionNo: 'VNPAY-2026-6621-QR',
    payDate: '2026-09-10 16:45:12',
    cardType: 'QR_CODE',
    status: 'SUCCESS',
    type: 'ESCROW_DEPOSIT',
    description: 'Nạp cọc Escrow thiết kế Banner quảng cáo',
    userEmail: 'ha.le@techstartup.vn'
  },
  {
    id: 'vnp-payout-1',
    orderId: 'ord-100',
    orderNumber: 'TM-2026-6621',
    amount: 2700000,
    bankCode: 'TECHCOMBANK',
    transactionNo: 'VNPAY-PAYOUT-9912',
    payDate: '2026-09-16 11:00:00',
    cardType: 'BANK_TRANSFER',
    status: 'SUCCESS',
    type: 'PAYOUT',
    description: 'Giải ngân tiền công (90%) cho Freelancer Trần Hoàng Nam',
    userEmail: 'hoangnam.design@gmail.com'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  // For Employer Lê Thu Hà (usr-emp-1)
  {
    id: 'notif-1',
    userId: 'usr-emp-1',
    title: 'Báo giá mới cho dự án Thiết Kế Banner',
    message: 'Freelancer Trần Hoàng Nam vừa gửi báo giá 6.000.000 đ kèm Portfolio mẫu thiết kế nhà hàng.',
    type: 'PROPOSAL',
    link: '/employer/dashboard',
    isRead: false,
    createdAt: '2026-09-28 11:20:00',
    timeAgo: '10 phút trước'
  },
  {
    id: 'notif-2',
    userId: 'usr-emp-1',
    title: 'Tạm giữ tiền Escrow VNPAY thành công',
    message: 'Đã phong tỏa 9.500.000 đ qua Cổng VNPAY vào Ví Tạm Giữ Escrow cho Hợp đồng TM-2026-8891.',
    type: 'ESCROW',
    link: '/employer/dashboard',
    isRead: false,
    createdAt: '2026-09-28 10:15:00',
    timeAgo: '1 giờ trước'
  },
  {
    id: 'notif-3',
    userId: 'usr-emp-1',
    title: 'Freelancer đã nộp sản phẩm hoàn thiện',
    message: 'Nguyễn Minh Anh đã upload bản dựng APK & source code App Quản lý Kho Hàng để chờ bạn nghiệm thu.',
    type: 'CONTRACT',
    link: '/employer/dashboard',
    isRead: true,
    createdAt: '2026-09-27 16:30:00',
    timeAgo: 'Hôm qua'
  },
  {
    id: 'notif-4',
    userId: 'usr-emp-1',
    title: 'Rút tiền Napas 24/7 thành công',
    message: 'Lệnh chuyển 5.000.000 đ về tài khoản Vietcombank 1028394857 đã hoàn tất tất toán.',
    type: 'WITHDRAWAL',
    link: '/employer/dashboard',
    isRead: true,
    createdAt: '2026-09-27 09:00:00',
    timeAgo: '1 ngày trước'
  },

  // For Freelancer Nguyễn Minh Anh (usr-free-1)
  {
    id: 'notif-inv-1',
    userId: 'usr-free-1',
    title: 'Lời mời nhận dự án mới từ Lê Thu Hà (TechStartup VN)',
    message: 'Doanh nghiệp đã gửi lời mời bạn tham gia dự án "Xây dựng Website Thương mại điện tử B2B Nông sản" với ngân sách 15.000.000 đ.',
    type: 'INVITATION',
    link: '/freelancer/dashboard',
    isRead: false,
    createdAt: '2026-09-28 11:30:00',
    timeAgo: 'Vừa xong'
  },
  {
    id: 'notif-5',
    userId: 'usr-free-1',
    title: 'Nhà tuyển dụng đã duyệt báo giá của bạn!',
    message: 'Lê Thu Hà (TechStartup Việt Nam) đã chấp nhận báo giá cho dự án AI Chatbot và nạp cọc 100% vào Escrow.',
    type: 'CONTRACT',
    link: '/freelancer/dashboard',
    isRead: false,
    createdAt: '2026-09-28 11:10:00',
    timeAgo: '20 phút trước'
  },
  {
    id: 'notif-6',
    userId: 'usr-free-1',
    title: 'Giải ngân thù lao Escrow thành công',
    message: 'Số tiền 12.000.000 đ từ Hợp đồng TM-CTR-2026-001 đã được cộng trực tiếp vào Số dư Ví của bạn.',
    type: 'ESCROW',
    link: '/freelancer/dashboard',
    isRead: false,
    createdAt: '2026-09-28 08:30:00',
    timeAgo: '3 giờ trước'
  },
  {
    id: 'notif-7',
    userId: 'usr-free-1',
    title: 'Đánh giá 5.0★ mới & +20 Điểm TalentCredit',
    message: 'Khách hàng vừa để lại nhận xét xuất sắc về thái độ làm việc chuyên nghiệp và tiến độ chuẩn.',
    type: 'REVIEW',
    link: '/freelancer/dashboard',
    isRead: true,
    createdAt: '2026-09-27 18:00:00',
    timeAgo: 'Hôm qua'
  },
  {
    id: 'notif-8',
    userId: 'usr-free-1',
    title: 'Dự án mới phù hợp với kỹ năng Flutter',
    message: 'Có 2 dự án mới đăng tuyển thuộc ngành IT & Lập trình Web/App đang tìm kiếm chuyên gia như bạn.',
    type: 'SYSTEM',
    link: '/projects',
    isRead: true,
    createdAt: '2026-09-27 14:00:00',
    timeAgo: 'Hôm qua'
  },

  // For Freelancer Trần Hoàng Nam (usr-free-2)
  {
    id: 'notif-inv-2',
    userId: 'usr-free-2',
    title: 'Lời mời nhận dự án mới từ Phạm Tuấn Anh (Invest Growth)',
    message: 'Doanh nghiệp đã gửi lời mời bạn tham gia dự án "Thiết kế Bộ nhận diện thương hiệu & UI/UX Mobile App" với ngân sách 8.500.000 đ.',
    type: 'INVITATION',
    link: '/freelancer/dashboard',
    isRead: false,
    createdAt: '2026-09-28 09:00:00',
    timeAgo: '2 giờ trước'
  },
  {
    id: 'notif-9',
    userId: 'usr-free-2',
    title: 'Báo giá dự án Chuỗi Nhà Hàng Chay được quan tâm',
    message: 'Nhà tuyển dụng đã xem hồ sơ Portfolio Behance của bạn và gửi phản hồi trao đổi chi tiết.',
    type: 'PROPOSAL',
    link: '/freelancer/dashboard',
    isRead: false,
    createdAt: '2026-09-28 10:45:00',
    timeAgo: '45 phút trước'
  },

  // For Admin (usr-admin-1)
  {
    id: 'notif-10',
    userId: 'usr-admin-1',
    title: 'Yêu cầu Trọng tài Tranh chấp mới',
    message: 'Hợp đồng TM-2026-8891 có khiếu nại yêu cầu Admin vào phân xử hoàn tiền Escrow.',
    type: 'SYSTEM',
    link: '/admin/dashboard',
    isRead: false,
    createdAt: '2026-09-28 09:15:00',
    timeAgo: '2 giờ trước'
  }
];

export const INITIAL_INVITATIONS: ProjectInvitation[] = [
  {
    id: 'inv-1',
    projectId: 'prj-1',
    projectTitle: 'Xây dựng Website Thương mại điện tử B2B Nông sản (Next.js + Tailwind + Node.js)',
    projectCategory: 'IT & Lập trình Web',
    projectBudget: 15000000,
    projectDeadline: '30 ngày',
    projectDescription: 'Cần tìm chuyên gia Fullstack phát triển cổng giao dịch B2B kết nối nhà vườn với doanh nghiệp xuất khẩu, tích hợp thanh toán VNPay và bảo mật 2 lớp.',
    employerId: 'usr-emp-1',
    employerName: 'Lê Thu Hà',
    employerCompany: 'Công ty Cổ phần TechStartup Việt Nam',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=le-thu-ha',
    freelancerId: 'free-1',
    freelancerUserId: 'usr-free-1',
    freelancerName: 'Nguyễn Minh Anh',
    message: 'Chào Minh Anh, mình ấn tượng với dự án E-Commerce Nông sản Sạch trong Portfolio của bạn. Team mình muốn mời bạn trực tiếp phụ trách dự án B2B này!',
    status: 'PENDING',
    createdAt: '2026-09-28 11:30:00'
  },
  {
    id: 'inv-2',
    projectId: 'prj-2',
    projectTitle: 'Thiết kế Bộ nhận diện thương hiệu & UI/UX Mobile App Giao hàng siêu tốc',
    projectCategory: 'Thiết kế & Đồ họa',
    projectBudget: 8500000,
    projectDeadline: '20 ngày',
    projectDescription: 'Cần thiết kế Design System trên Figma, trọn bộ hơn 40 màn hình chuẩn UX mobile app giao vận tốc hành.',
    employerId: 'usr-emp-2',
    employerName: 'Phạm Tuấn Anh',
    employerCompany: 'Invest Growth Vietnam',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=pham-tuan-anh',
    freelancerId: 'free-2',
    freelancerUserId: 'usr-free-2',
    freelancerName: 'Trần Hoàng Nam',
    message: 'Chào bạn, bên mình đang cần chuẩn hóa bộ nhận diện thương hiệu và hoàn thiện UI Mobile App, rất mong có cơ hội hợp tác cùng bạn.',
    status: 'PENDING',
    createdAt: '2026-09-28 09:00:00'
  }
];

