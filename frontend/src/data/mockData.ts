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
  // ===================== NHÀ TUYỂN DỤNG (EMPLOYERS) =====================
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
    lastLogin: '2026-10-13 08:30',
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
    escrowBalance: 4500000,
    createdAt: '2026-02-20',
    lastLogin: '2026-10-13 07:45',
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
    id: 'usr-emp-3',
    name: 'Nguyễn Mai Lan',
    email: 'lan.nguyen@edusparks.edu.vn',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=nguyen-mai-lan',
    role: 'employer',
    companyName: 'Học viện Giáo dục Trực tuyến EduSparks',
    taxCode: '0108765432',
    phone: '0912998877',
    isVerified: true,
    emailVerified: true,
    accountStatus: 'ACTIVE',
    kycStatus: 'VERIFIED',
    balance: 28000000,
    escrowBalance: 6000000,
    createdAt: '2026-03-10',
    lastLogin: '2026-10-12 16:20',
    bankAccounts: [
      {
        id: 'ba-emp-3',
        bankName: 'Á Châu (ACB)',
        bankCode: 'ACB',
        accountNumber: '2345678901',
        accountHolder: 'NGUYEN MAI LAN',
        isDefault: true,
        createdAt: '2026-03-11'
      }
    ]
  },
  {
    id: 'usr-emp-4',
    name: 'Trần Việt Hoàng',
    email: 'hoang.tran@foodies.vn',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=tran-viet-hoang',
    role: 'employer',
    companyName: 'Chuỗi Ẩm thực & Nhà hàng Foodies Delight',
    taxCode: '0315678901',
    phone: '0938112233',
    isVerified: true,
    emailVerified: true,
    accountStatus: 'ACTIVE',
    kycStatus: 'VERIFIED',
    balance: 45000000,
    escrowBalance: 8500000,
    createdAt: '2026-02-18',
    lastLogin: '2026-10-13 09:15',
    bankAccounts: [
      {
        id: 'ba-emp-4',
        bankName: 'VPBank (Việt Nam Thịnh Vượng)',
        bankCode: 'VPB',
        accountNumber: '98765432101',
        accountHolder: 'TRAN VIET HOANG',
        isDefault: true,
        createdAt: '2026-02-19'
      }
    ]
  },
  {
    id: 'usr-emp-5',
    name: 'Đặng Ngọc Mai',
    email: 'mai.dang@fashionhouse.vn',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=dang-ngoc-mai',
    role: 'employer',
    companyName: 'Thời trang Thiết kế Bella Mode Vietnam',
    taxCode: '0401234567',
    phone: '0905667788',
    isVerified: true,
    emailVerified: true,
    accountStatus: 'ACTIVE',
    kycStatus: 'VERIFIED',
    balance: 19500000,
    escrowBalance: 3500000,
    createdAt: '2026-03-25',
    lastLogin: '2026-10-12 19:40',
    bankAccounts: [
      {
        id: 'ba-emp-5',
        bankName: 'MB Bank (Quân Đội)',
        bankCode: 'MBB',
        accountNumber: '888809056677',
        accountHolder: 'DANG NGOC MAI',
        isDefault: true,
        createdAt: '2026-03-26'
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
    lastLogin: '2026-10-12 21:00',
    bankAccounts: []
  },

  // ===================== ỨNG VIÊN / CHUYÊN GIA (FREELANCERS) =====================
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
    lastLogin: '2026-10-13 10:15',
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
    lastLogin: '2026-10-13 09:50',
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
    lastLogin: '2026-10-12 18:30',
    bankAccounts: [
      {
        id: 'ba-5',
        bankName: 'Techcombank (Kỹ Thương Việt Nam)',
        bankCode: 'TCB',
        accountNumber: '190283746519',
        accountHolder: 'PHAM QUOC HUY',
        isDefault: true,
        createdAt: '2026-03-13'
      }
    ]
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
    skills: ['Facebook Ads', 'Google Ads', 'SEO Google', 'Content Marketing', 'Copywriting', 'Google Analytics'],
    createdAt: '2026-03-01',
    lastLogin: '2026-10-13 08:10',
    bankAccounts: [
      {
        id: 'ba-6',
        bankName: 'Vietcombank (Ngoại Thương Việt Nam)',
        bankCode: 'VCB',
        accountNumber: '0071001234567',
        accountHolder: 'VU LINH DAN',
        isDefault: true,
        createdAt: '2026-03-02'
      }
    ]
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
    skills: ['Python', 'FastAPI', 'AI/LLM', 'PostgreSQL', 'Docker', 'REST API', 'PyTorch', 'LangChain'],
    createdAt: '2026-01-20',
    lastLogin: '2026-10-13 11:00',
    bankAccounts: [
      {
        id: 'ba-7',
        bankName: 'Á Châu (ACB)',
        bankCode: 'ACB',
        accountNumber: '189283749',
        accountHolder: 'DO BAO LONG',
        isDefault: true,
        createdAt: '2026-01-21'
      }
    ]
  },
  {
    id: 'usr-free-6',
    name: 'Ngô Phương Thanh',
    email: 'thanh.writer@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=ngo-phuong-thanh',
    role: 'freelancer',
    phone: '0981223344',
    isVerified: true,
    emailVerified: true,
    accountStatus: 'ACTIVE',
    kycStatus: 'VERIFIED',
    balance: 11800000,
    escrowBalance: 1800000,
    bio: 'Content Strategist & Creative Copywriter chuyên nghiệp với 5 năm kinh nghiệm viết bài chuẩn SEO, bài PR báo chí, kịch bản video và storytelling cho hơn 60 thương hiệu lớn nhỏ.',
    portfolioUrl: 'https://phuongthanh-content.myportfolio.com',
    skills: ['Content Strategy', 'SEO Writing', 'Copywriting', 'Social Media', 'Storytelling', 'PR Article'],
    createdAt: '2026-02-14',
    lastLogin: '2026-10-13 09:30',
    bankAccounts: [
      {
        id: 'ba-8',
        bankName: 'Vietcombank (Ngoại Thương Việt Nam)',
        bankCode: 'VCB',
        accountNumber: '0451009876543',
        accountHolder: 'NGO PHUONG THANH',
        isDefault: true,
        createdAt: '2026-02-15'
      }
    ]
  },
  {
    id: 'usr-free-7',
    name: 'Bùi Hoàng Đức',
    email: 'duc.architect@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=bui-hoang-duc',
    role: 'freelancer',
    phone: '0918776655',
    isVerified: true,
    emailVerified: true,
    accountStatus: 'ACTIVE',
    kycStatus: 'VERIFIED',
    balance: 22400000,
    escrowBalance: 5400000,
    bio: 'Kiến trúc sư 3D & BIM Revit Specialist có 6 năm kinh nghiệm thiết kế quy hoạch, phối cảnh nội ngoại thất nhà phố, biệt thự, resort và bóc tách hồ sơ thi công chuẩn kỹ thuật.',
    portfolioUrl: 'https://behance.net/duc_architect_vietnam',
    skills: ['AutoCAD', 'Revit BIM', '3Ds Max', 'SketchUp', 'V-Ray', 'Phối cảnh 3D nội thất'],
    createdAt: '2026-02-01',
    lastLogin: '2026-10-12 20:15',
    bankAccounts: [
      {
        id: 'ba-9',
        bankName: 'BIDV (Đầu Tư & Phát Triển Việt Nam)',
        bankCode: 'BIDV',
        accountNumber: '2151000889922',
        accountHolder: 'BUI HOANG DUC',
        isDefault: true,
        createdAt: '2026-02-02'
      }
    ]
  },
  {
    id: 'usr-free-8',
    name: 'Trịnh Hoài Thu',
    email: 'thu.translator@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=trinh-hoai-thu',
    role: 'freelancer',
    phone: '0936554433',
    isVerified: true,
    emailVerified: true,
    accountStatus: 'ACTIVE',
    kycStatus: 'VERIFIED',
    balance: 16200000,
    escrowBalance: 0,
    bio: 'Biên phiên dịch viên song ngữ Anh - Nhật (JLPT N1, IELTS 8.0) chuyên dịch thuật tài liệu kỹ thuật CNTT, hợp đồng thương mại, hồ sơ thầu và bản địa hóa ứng dụng phần mềm.',
    portfolioUrl: 'https://proz.com/profile/trinh-hoai-thu-translator',
    skills: ['Dịch thuật Anh - Việt', 'Nhật - Việt', 'Biên dịch hợp đồng', 'Tài liệu kỹ thuật IT', 'Localization'],
    createdAt: '2026-01-25',
    lastLogin: '2026-10-13 10:45',
    bankAccounts: [
      {
        id: 'ba-10',
        bankName: 'Techcombank (Kỹ Thương Việt Nam)',
        bankCode: 'TCB',
        accountNumber: '190345678912',
        accountHolder: 'TRINH HOAI THU',
        isDefault: true,
        createdAt: '2026-01-26'
      }
    ]
  },
  {
    id: 'usr-free-9',
    name: 'Lê Minh Quang',
    email: 'quang.fin@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=le-minh-quang',
    role: 'freelancer',
    phone: '0979887766',
    isVerified: true,
    emailVerified: true,
    accountStatus: 'ACTIVE',
    kycStatus: 'VERIFIED',
    balance: 27500000,
    escrowBalance: 3600000,
    bio: 'Chuyên gia Kế toán Trưởng & Tư vấn Thuế Doanh nghiệp với hơn 8 năm kinh nghiệm thực chiến. Chuyên soát xét sổ sách, lập báo cáo tài chính, quyết toán thuế và tối ưu chi phí thuế hợp pháp cho SME.',
    portfolioUrl: 'https://linkedin.com/in/quangle-finance-cpa',
    skills: ['Kế toán tài chính', 'Báo cáo tài chính', 'Quyết toán thuế', 'MISA', 'ERP', 'Kiểm soát dòng tiền'],
    createdAt: '2026-01-18',
    lastLogin: '2026-10-13 08:50',
    bankAccounts: [
      {
        id: 'ba-11',
        bankName: 'MB Bank (Quân Đội)',
        bankCode: 'MBB',
        accountNumber: '079012345678',
        accountHolder: 'LE MINH QUANG',
        isDefault: true,
        createdAt: '2026-01-19'
      }
    ]
  },
  {
    id: 'usr-free-10',
    name: 'Đoàn Bảo Ngọc',
    email: 'ngoc.game3d@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=doan-bao-ngoc',
    role: 'freelancer',
    phone: '0962334455',
    isVerified: true,
    emailVerified: true,
    accountStatus: 'ACTIVE',
    kycStatus: 'VERIFIED',
    balance: 13500000,
    escrowBalance: 0,
    bio: '3D Character & Game Animator chuyên nghiệp, thành thạo Blender, Maya, ZBrush và dựng cảnh Unreal Engine 5. Đã đóng góp asset và hoạt họa cho 8 tựa game mobile indie thành công.',
    portfolioUrl: 'https://artstation.com/baongoc_3dgame',
    skills: ['Blender', 'Maya', 'ZBrush', 'Unity 3D', 'Character Rigging', 'Unreal Engine 5'],
    createdAt: '2026-03-05',
    lastLogin: '2026-10-12 17:15',
    bankAccounts: [
      {
        id: 'ba-12',
        bankName: 'VietinBank (Công Thương Việt Nam)',
        bankCode: 'CTG',
        accountNumber: '103847592819',
        accountHolder: 'DOAN BAO NGOC',
        isDefault: true,
        createdAt: '2026-03-06'
      }
    ]
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
    lastLogin: '2026-10-12 22:00',
    bankAccounts: []
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
    lastLogin: '2026-09-10',
    bankAccounts: []
  },

  // ===================== QUẢN TRỊ VIÊN HỆ THỐNG (ADMIN) =====================
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
    lastLogin: '2026-10-13 11:30',
    bankAccounts: [
      {
        id: 'ba-admin',
        bankName: 'Vietcombank Trụ Sở Chính',
        bankCode: 'VCB',
        accountNumber: '999988887777',
        accountHolder: 'CONG TY CP TALENTMATCH VIETNAM',
        isDefault: true,
        createdAt: '2026-01-02'
      }
    ]
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
    skills: ['UI/UX Design', 'Figma', 'Branding', 'Design System', 'Logo Design', 'Adobe Illustrator'],
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
    skills: ['Facebook Ads', 'Google Ads', 'SEO Google', 'Content Marketing', 'Copywriting', 'Google Analytics'],
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
    skills: ['Python', 'FastAPI', 'AI/LLM', 'PostgreSQL', 'Docker', 'REST API', 'PyTorch', 'LangChain'],
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
  },
  {
    id: 'free-6',
    userId: 'usr-free-6',
    name: 'Ngô Phương Thanh',
    title: 'Content Strategist & Creative Copywriter',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=ngo-phuong-thanh',
    bio: 'Chuyên gia ngôn từ và chiến lược nội dung số với 5 năm kinh nghiệm. Xây dựng content pillar, viết bài chuẩn SEO, bài PR báo chí và kịch bản viral video cho các nhãn hàng F&B, giáo dục và làm đẹp.',
    location: 'Hà Nội, Việt Nam',
    rating: 4.91,
    reviewCount: 39,
    completedOrders: 44,
    hourlyRate: 200000,
    skills: ['Content Strategy', 'SEO Writing', 'Copywriting', 'Social Media', 'Storytelling', 'PR Article'],
    talentCreditScore: 920,
    talentCreditBadge: 'Top Rated',
    isVerified: true,
    portfolioUrl: 'https://phuongthanh-content.myportfolio.com',
    portfolio: [
      {
        id: 'port-8',
        title: 'E-Book Hướng Dẫn Chuyển Đổi Số Cho Doanh Nghiệp Nhỏ',
        image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=600',
        category: 'Viết lách & Nội dung',
        description: 'Soạn thảo trọn bộ E-book 80 trang và chuỗi 20 bài viết lead generation thu hút 15,000 lượt tải.',
        projectUrl: 'https://phuongthanh-content.myportfolio.com/ebook-sme'
      }
    ]
  },
  {
    id: 'free-7',
    userId: 'usr-free-7',
    name: 'Bùi Hoàng Đức',
    title: 'Kiến trúc sư 3D & BIM Revit Specialist',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=bui-hoang-duc',
    bio: 'Kiến trúc sư giàu kinh nghiệm thiết kế quy hoạch, phối cảnh 3D nội ngoại thất và lập mô hình BIM Revit chuẩn thi công. Từng chủ trì thiết kế cho hơn 50 công trình nhà phố, biệt thự và quán cafe tại Việt Nam.',
    location: 'Hải Phòng, Việt Nam',
    rating: 4.89,
    reviewCount: 35,
    completedOrders: 40,
    hourlyRate: 320000,
    skills: ['AutoCAD', 'Revit BIM', '3Ds Max', 'SketchUp', 'V-Ray', 'Phối cảnh 3D nội thất'],
    talentCreditScore: 935,
    talentCreditBadge: 'Top Rated',
    isVerified: true,
    portfolioUrl: 'https://behance.net/duc_architect_vietnam',
    portfolio: [
      {
        id: 'port-9',
        title: 'Phối Cảnh 3D Biệt Thự Nghỉ Dưỡng Sinh Thái EcoHouse',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600',
        category: 'Kỹ thuật & Kiến trúc',
        description: 'Dựng phối cảnh 3D ngoại thất, sân vườn và hồ bơi vô cực bằng 3Ds Max + V-Ray.',
        projectUrl: 'https://behance.net/gallery/ecohouse-villa-render'
      }
    ]
  },
  {
    id: 'free-8',
    userId: 'usr-free-8',
    name: 'Trịnh Hoài Thu',
    title: 'Biên Phiên Dịch Song Ngữ Anh - Nhật N1',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=trinh-hoai-thu',
    bio: 'Biên dịch viên chuyên nghiệp đạt chứng chỉ JLPT N1 và IELTS 8.0 với 5 năm kinh nghiệm. Chuyên dịch thuật hợp đồng pháp lý, tài liệu kỹ thuật IT, y tế và bản địa hóa game, phần mềm.',
    location: 'TP. Hồ Chí Minh, Việt Nam',
    rating: 4.94,
    reviewCount: 50,
    completedOrders: 58,
    hourlyRate: 230000,
    skills: ['Dịch thuật Anh - Việt', 'Nhật - Việt', 'Biên dịch hợp đồng', 'Tài liệu kỹ thuật IT', 'Localization'],
    talentCreditScore: 945,
    talentCreditBadge: 'Top Rated',
    isVerified: true,
    portfolioUrl: 'https://proz.com/profile/trinh-hoai-thu-translator',
    portfolio: [
      {
        id: 'port-10',
        title: 'Bản Địa Hóa Tựa Game Nhập Vai Mobile 200,000 Từ',
        image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=600',
        category: 'Dịch thuật & Đào tạo',
        description: 'Dịch thuật và kiểm thử ngôn ngữ (LQA) toàn bộ hội thoại game từ tiếng Nhật sang tiếng Việt chuẩn văn hóa.',
        projectUrl: 'https://proz.com/profile/trinh-hoai-thu-translator'
      }
    ]
  },
  {
    id: 'free-9',
    userId: 'usr-free-9',
    name: 'Lê Minh Quang',
    title: 'Chuyên Viên Kế Toán Trưởng & Tư Vấn Thuế',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=le-minh-quang',
    bio: 'Kế toán trưởng có chứng chỉ hành nghề dịch vụ làm thủ tục về thuế (CPA Vietnam). 8 năm hỗ trợ soát xét chứng từ, lập báo cáo tài chính, quyết toán thuế TNDN, TNCN, GTGT và xây dựng quy trình kế toán cho doanh nghiệp SME.',
    location: 'Hà Nội, Việt Nam',
    rating: 4.97,
    reviewCount: 44,
    completedOrders: 48,
    hourlyRate: 380000,
    skills: ['Kế toán tài chính', 'Báo cáo tài chính', 'Quyết toán thuế', 'MISA', 'ERP', 'Kiểm soát dòng tiền'],
    talentCreditScore: 960,
    talentCreditBadge: 'Top Rated',
    isVerified: true,
    portfolioUrl: 'https://linkedin.com/in/quangle-finance-cpa',
    portfolio: [
      {
        id: 'port-11',
        title: 'Tối Ưu Chi Phí Thuế & Soát Xét Sổ Sách Cho Chuỗi 12 Cửa Hàng',
        image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600',
        category: 'Tài chính & Kế toán',
        description: 'Hoàn thiện hồ sơ quyết toán thuế 3 năm liên tiếp, tiết kiệm hơn 300 triệu đồng chi phí phạt và truy thu.',
        projectUrl: 'https://linkedin.com/in/quangle-finance-cpa'
      }
    ]
  },
  {
    id: 'free-10',
    userId: 'usr-free-10',
    name: 'Đoàn Bảo Ngọc',
    title: '3D Character & Game Animator',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=doan-bao-ngoc',
    bio: 'Nghệ sĩ 3D chuyên tạo hình nhân vật, vũ khí và hoạt họa chuyển động trong game. Thành thạo pipeline từ dựng base mesh trong Blender/ZBrush đến rig xương, animation và import vào Unity / Unreal Engine 5.',
    location: 'Cần Thơ, Việt Nam',
    rating: 4.87,
    reviewCount: 26,
    completedOrders: 29,
    hourlyRate: 280000,
    skills: ['Blender', 'Maya', 'ZBrush', 'Unity 3D', 'Character Rigging', 'Unreal Engine 5'],
    talentCreditScore: 885,
    talentCreditBadge: 'Gold',
    isVerified: true,
    portfolioUrl: 'https://artstation.com/baongoc_3dgame',
    portfolio: [
      {
        id: 'port-12',
        title: 'Bộ Gói 20 Nhân Vật 3D Phong Cách Fantasy Trong Game Mobile',
        image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=600',
        category: 'Thiết kế & Đồ họa',
        description: 'Tạo hình nhân vật low-poly chuẩn tối ưu mobile, kèm trọn bộ 15 animation di chuyển, tấn công, phòng thủ.',
        projectUrl: 'https://artstation.com/baongoc_3dgame'
      }
    ]
  }
];

export const PROJECTS: Project[] = [
  // IT & LẬP TRÌNH
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
    title: 'Lập trình Landing Page Giới Thiệu Khóa Học Đầu Tư Chuẩn Tốc Độ Cao',
    category: 'IT & Lập trình',
    employerId: 'usr-emp-2',
    employerName: 'Phạm Tuấn Anh',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=pham-tuan-anh',
    employerCompany: 'Invest Growth Vietnam',
    employerVerified: true,
    budget: 4500000,
    budgetType: 'FIXED',
    deadline: '2026-10-15',
    description: 'Cần lập trình viên cắt giao diện từ Figma sang ReactJS + Tailwind CSS cho Landing Page giới thiệu khóa học tài chính cá nhân. Yêu cầu chuẩn SEO, tốc độ Google PageSpeed > 90 điểm và tương thích hoàn hảo mọi thiết bị di động.',
    requiredSkills: ['ReactJS', 'Tailwind CSS', 'Responsive UI', 'SEO Google'],
    status: 'OPEN',
    proposalsCount: 4,
    createdAt: '2026-09-27'
  },
  {
    id: 'prj-3',
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
    id: 'prj-4',
    title: 'Tích hợp Trợ lý AI Chatbot RAG Hỗ trợ Tư vấn Tuyển sinh 24/7',
    category: 'IT & Lập trình',
    employerId: 'usr-emp-3',
    employerName: 'Nguyễn Mai Lan',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=nguyen-mai-lan',
    employerCompany: 'Học viện Giáo dục Trực tuyến EduSparks',
    employerVerified: true,
    budget: 18000000,
    budgetType: 'MILESTONE',
    deadline: '2026-11-10',
    description: 'Học viện EduSparks tìm kiếm kỹ sư AI triển khai Chatbot thông minh dựa trên kiến trúc RAG (Retrieval-Augmented Generation), kết nối kho dữ liệu học liệu và tư vấn học viên tự động trên Website & Fanpage.',
    requiredSkills: ['Python', 'FastAPI', 'AI/LLM', 'LangChain', 'PostgreSQL', 'Docker'],
    status: 'OPEN',
    proposalsCount: 5,
    createdAt: '2026-09-28'
  },

  // THIẾT KẾ & ĐỒ HỌA
  {
    id: 'prj-5',
    title: 'Thiết kế Bộ Nhận Diện Thương Hiệu & Logo Cho Chuỗi Nhà Hàng Chay',
    category: 'Thiết kế & Đồ họa',
    employerId: 'usr-emp-4',
    employerName: 'Trần Việt Hoàng',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=tran-viet-hoang',
    employerCompany: 'Chuỗi Ẩm thực & Nhà hàng Foodies Delight',
    employerVerified: true,
    budget: 6000000,
    budgetType: 'FIXED',
    deadline: '2026-10-25',
    description: 'Cần thuê Designer chuyên nghiệp thiết kế Logo, Guideline phối màu, Mẫu Menu nhà hàng và Bảng hiệu mặt tiền cho chuỗi thực phẩm chay mới tại TP.HCM. Yêu cầu bàn giao đầy đủ file gốc Illustrator/Figma vector.',
    requiredSkills: ['Branding', 'Logo Design', 'Adobe Illustrator', 'Figma'],
    status: 'OPEN',
    proposalsCount: 5,
    createdAt: '2026-09-26'
  },
  {
    id: 'prj-6',
    title: 'Thiết kế UI/UX Trọn Gói Ứng Dụng Đặt Lịch Spa & Làm Đẹp',
    category: 'Thiết kế & Đồ họa',
    employerId: 'usr-emp-5',
    employerName: 'Đặng Ngọc Mai',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=dang-ngoc-mai',
    employerCompany: 'Thời trang Thiết kế Bella Mode Vietnam',
    employerVerified: true,
    budget: 14000000,
    budgetType: 'MILESTONE',
    deadline: '2026-11-05',
    description: 'Cần thiết kế Design System và hơn 35 màn hình Figma chuẩn iOS/Android cho ứng dụng đặt lịch hẹn chăm sóc da, spa và mua sắm mỹ phẩm cao cấp. Ưu tiên phong cách thanh lịch, tối giản.',
    requiredSkills: ['UI/UX Design', 'Figma', 'Mobile UI', 'Design System', 'Prototype'],
    status: 'OPEN',
    proposalsCount: 4,
    createdAt: '2026-09-29'
  },
  {
    id: 'prj-7',
    title: 'Thiết kế Bao Bì & Nhãn Hộp Trà Thảo Mộc Cao Cấp Xuất Khẩu',
    category: 'Thiết kế & Đồ họa',
    employerId: 'usr-emp-4',
    employerName: 'Trần Việt Hoàng',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=tran-viet-hoang',
    employerCompany: 'Chuỗi Ẩm thực & Nhà hàng Foodies Delight',
    employerVerified: true,
    budget: 8000000,
    budgetType: 'FIXED',
    deadline: '2026-10-20',
    description: 'Tìm kiếm Designer thiết kế bao bì hộp thiếc, nhãn dán túi zip cho dòng sản phẩm trà thảo mộc xuất khẩu đi Nhật Bản và EU. Cần file thiết kế chuẩn chế bản in offset 4 màu và mockup 3D.',
    requiredSkills: ['Bao bì', 'Packaging', 'Adobe Illustrator', 'Photoshop', '3D Mockup'],
    status: 'OPEN',
    proposalsCount: 3,
    createdAt: '2026-09-28'
  },

  // VIDEO & ANIMATION
  {
    id: 'prj-8',
    title: 'Sản xuất Chuỗi 15 Video Ngắn TikTok Ads & Reels Bán Hàng Mỹ Phẩm',
    category: 'Video & Animation',
    employerId: 'usr-emp-5',
    employerName: 'Đặng Ngọc Mai',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=dang-ngoc-mai',
    employerCompany: 'Thời trang Thiết kế Bella Mode Vietnam',
    employerVerified: true,
    budget: 8500000,
    budgetType: 'MILESTONE',
    deadline: '2026-10-22',
    description: 'Tìm kiếm Video Editor có kinh nghiệm làm việc với TikTok Ads, thành thạo Premiere & After Effects. Chúng tôi đã có sẵn kịch bản và source quay thô, cần cắt dựng kèm hiệu ứng bắt trend, âm thanh bản quyền và text subtitle chuyển động.',
    requiredSkills: ['TikTok Ads', 'Premiere Pro', 'After Effects', 'Motion Graphics', 'Color Grading'],
    status: 'OPEN',
    proposalsCount: 5,
    createdAt: '2026-09-26'
  },
  {
    id: 'prj-9',
    title: 'Dựng Video Hoạt Hình 3D Trailer Giới Thiệu Game Mobile 60 Giây',
    category: 'Video & Animation',
    employerId: 'usr-emp-1',
    employerName: 'Lê Thu Hà',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=le-thu-ha',
    employerCompany: 'Công ty Cổ phần TechStartup Việt Nam',
    employerVerified: true,
    budget: 16000000,
    budgetType: 'MILESTONE',
    deadline: '2026-11-15',
    description: 'Cần 3D Animator thực hiện đoạn cinematic trailer 60 giây cho tựa game phiêu lưu mới. Nhân vật và bối cảnh đã có sẵn model 3D, cần diễn hoạt chuyển động mượt mà, hiệu ứng ánh sáng và hiệu ứng âm thanh hoành tráng.',
    requiredSkills: ['Blender', 'Maya', '3D Animation', 'Sound Effects', 'Unreal Engine 5'],
    status: 'OPEN',
    proposalsCount: 3,
    createdAt: '2026-09-30'
  },

  // DIGITAL MARKETING
  {
    id: 'prj-10',
    title: 'Triển khai Chiến Dịch SEO Tổng Thể Portal Bất Động Sản Lên Top Google',
    category: 'Digital Marketing',
    employerId: 'usr-emp-2',
    employerName: 'Phạm Tuấn Anh',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=pham-tuan-anh',
    employerCompany: 'Invest Growth Vietnam',
    employerVerified: true,
    budget: 12000000,
    budgetType: 'MILESTONE',
    deadline: '2026-11-20',
    description: 'Cần chuyên gia SEO tổng thể Onpage & Offpage tối ưu cho portal bất động sản nghỉ dưỡng cao cấp. Đảm bảo cam kết Top từ khóa chính xác và báo cáo traffic hàng tuần qua Google Search Console.',
    requiredSkills: ['SEO Google', 'Content Marketing', 'Google Analytics', 'Backlinks', 'Technical SEO'],
    status: 'OPEN',
    proposalsCount: 4,
    createdAt: '2026-09-24'
  },
  {
    id: 'prj-11',
    title: 'Quản trị & Tối ưu Chiến Dịch Quảng Cáo Meta Ads Chuỗi Thời Trang',
    category: 'Digital Marketing',
    employerId: 'usr-emp-5',
    employerName: 'Đặng Ngọc Mai',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=dang-ngoc-mai',
    employerCompany: 'Thời trang Thiết kế Bella Mode Vietnam',
    employerVerified: true,
    budget: 10000000,
    budgetType: 'MILESTONE',
    deadline: '2026-10-31',
    description: 'Tìm kiếm Media Buyer / Performance Marketer quản trị ngân sách chạy Facebook/Instagram Ads 50 triệu/tháng cho BST Thu Đông, cam kết ROAS tối thiểu 4.0 và chi phí trên mỗi đơn hàng CPA hợp lý.',
    requiredSkills: ['Facebook Ads', 'Meta Pixel', 'A/B Testing', 'Copywriting', 'Conversion Rate'],
    status: 'OPEN',
    proposalsCount: 6,
    createdAt: '2026-09-27'
  },

  // VIẾT LÁCH & NỘI DUNG
  {
    id: 'prj-12',
    title: 'Xây dựng Bộ 30 Bài Viết Chuyên Sâu Chuẩn SEO Ngành Dược Mỹ Phẩm',
    category: 'Viết lách & Nội dung',
    employerId: 'usr-emp-5',
    employerName: 'Đặng Ngọc Mai',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=dang-ngoc-mai',
    employerCompany: 'Thời trang Thiết kế Bella Mode Vietnam',
    employerVerified: true,
    budget: 6500000,
    budgetType: 'FIXED',
    deadline: '2026-10-28',
    description: 'Cần tìm Content Writer có kiến thức chuyên sâu về da liễu, mỹ phẩm để viết bộ 30 bài chuẩn SEO (1,200 - 1,500 từ/bài). Yêu cầu nội dung chính xác y khoa, hành văn lôi cuốn và không sao chép.',
    requiredSkills: ['SEO Writing', 'Content Marketing', 'Copywriting', 'Skincare', 'Yoast SEO'],
    status: 'OPEN',
    proposalsCount: 4,
    createdAt: '2026-09-29'
  },

  // KỸ THUẬT & KIẾN TRÚC
  {
    id: 'prj-13',
    title: 'Thiết kế Phối Cảnh 3D & Bản Vẽ Thi Công Nội Thất Quán Cafe Acoustic',
    category: 'Kỹ thuật & Kiến trúc',
    employerId: 'usr-emp-4',
    employerName: 'Trần Việt Hoàng',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=tran-viet-hoang',
    employerCompany: 'Chuỗi Ẩm thực & Nhà hàng Foodies Delight',
    employerVerified: true,
    budget: 18000000,
    budgetType: 'MILESTONE',
    deadline: '2026-11-12',
    description: 'Cần kiến trúc sư thiết kế nội thất trọn gói cho mặt bằng quán cafe 200m2 phong cách Industrial kết hợp mộc ấm cúng. Gồm concept moodboard, phối cảnh 3D các góc và hồ sơ kỹ thuật thi công bóc tách vật liệu.',
    requiredSkills: ['AutoCAD', 'SketchUp', '3Ds Max', 'Nội thất', 'Bóc tách dự toán'],
    status: 'OPEN',
    proposalsCount: 3,
    createdAt: '2026-09-25'
  },

  // TÀI CHÍNH & KẾ TOÁN
  {
    id: 'prj-14',
    title: 'Soát Xét Sổ Sách & Quyết Toán Thuế Doanh Nghiệp Cuối Năm',
    category: 'Tài chính & Kế toán',
    employerId: 'usr-emp-1',
    employerName: 'Lê Thu Hà',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=le-thu-ha',
    employerCompany: 'Công ty Cổ phần TechStartup Việt Nam',
    employerVerified: true,
    budget: 12000000,
    budgetType: 'FIXED',
    deadline: '2026-11-25',
    description: 'Doanh nghiệp cần thuê chuyên gia Kế toán Thuế rà soát hóa đơn chứng từ năm tài chính 2025-2026, đối chiếu tờ khai GTGT, tính toán thuế TNDN và hoàn thiện báo cáo tài chính nội bộ lẫn cơ quan thuế.',
    requiredSkills: ['Kế toán thuế', 'Báo cáo tài chính', 'MISA', 'Quyết toán thuế', 'Hóa đơn điện tử'],
    status: 'OPEN',
    proposalsCount: 4,
    createdAt: '2026-09-28'
  },

  // DỊCH THUẬT & ĐÀO TẠO
  {
    id: 'prj-15',
    title: 'Dịch thuật & Bản Địa Hóa Phần Mềm Quản Trị Nhân Sự Nhật - Việt',
    category: 'Dịch thuật & Đào tạo',
    employerId: 'usr-emp-1',
    employerName: 'Lê Thu Hà',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=le-thu-ha',
    employerCompany: 'Công ty Cổ phần TechStartup Việt Nam',
    employerVerified: true,
    budget: 15000000,
    budgetType: 'MILESTONE',
    deadline: '2026-11-18',
    description: 'Dự án hợp tác với doanh nghiệp Nhật Bản cần bản dịch chuẩn xác toàn bộ giao diện phần mềm HRM (khoảng 80,000 từ) và tài liệu hướng dẫn sử dụng từ tiếng Nhật sang tiếng Việt chuẩn ngữ cảnh văn phòng.',
    requiredSkills: ['Dịch thuật Nhật - Việt', 'JLPT N1', 'HRM', 'IT Localization', 'Trados'],
    status: 'OPEN',
    proposalsCount: 3,
    createdAt: '2026-09-30'
  },

  // LUẬT & PHÁP LÝ
  {
    id: 'prj-16',
    title: 'Tư Vấn & Soạn Thảo Bộ Hợp Đồng Chuyển Nhượng Cổ Phần Khởi Nghiệp',
    category: 'Luật & Pháp lý',
    employerId: 'usr-emp-2',
    employerName: 'Phạm Tuấn Anh',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=pham-tuan-anh',
    employerCompany: 'Invest Growth Vietnam',
    employerVerified: true,
    budget: 9000000,
    budgetType: 'FIXED',
    deadline: '2026-10-25',
    description: 'Quỹ đầu tư cần luật sư chuyên về M&A và doanh nghiệp khởi nghiệp để rà soát thỏa thuận đầu tư (Term Sheet), hợp đồng mua bán cổ phần (SPA) và thỏa thuận cổ đông (SHA) bảo vệ quyền lợi hai bên.',
    requiredSkills: ['Luật Doanh nghiệp', 'Hợp đồng đầu tư', 'SPA / SHA', 'Tư vấn pháp lý', 'M&A'],
    status: 'OPEN',
    proposalsCount: 2,
    createdAt: '2026-09-27'
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
    freelancerBio: 'Tôi đã có hơn 6 năm phát triển ứng dụng di động Flutter và Web App thương mại điện tử. Đã từng làm module QR Code Scan offline và đồng bộ REST API cho chuỗi cửa hàng tiện lợi.',
    freelancerPortfolioUrl: 'https://github.com/minhanh-dev/portfolio-vietnam',
    bidAmount: 14000000,
    estimatedDays: 25,
    coverLetter: 'Chào chị Hà, tôi đã đọc kỹ yêu cầu hệ thống quản lý kho hàng cho SME. Với thế mạnh Flutter + REST API, tôi cam kết bàn giao ứng dụng đúng hạn, code sạch, có tài liệu hướng dẫn và hỗ trợ bảo hành 3 tháng sau bàn giao.',
    status: 'ACCEPTED',
    createdAt: '2026-09-26'
  },
  {
    id: 'prop-2',
    projectId: 'prj-5',
    freelancerId: 'free-2',
    freelancerName: 'Trần Hoàng Nam',
    freelancerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=tran-hoang-nam',
    freelancerTitle: 'UI/UX & Brand Identity Lead Designer',
    freelancerRating: 4.95,
    freelancerCompletedCount: 70,
    freelancerBio: 'Designer chuyên thiết kế bộ nhận diện thương hiệu F&B và nhà hàng với hơn 5 năm kinh nghiệm.',
    freelancerPortfolioUrl: 'https://behance.net/hoangnam_uxui_vietnam',
    bidAmount: 5500000,
    estimatedDays: 14,
    coverLetter: 'Chào anh Hoàng, chuỗi ẩm thực chay là đề tài rất giàu cảm hứng. Tôi xin gửi kèm portfolio chuỗi Cafe The Garden mà tôi vừa thực hiện. Tôi sẽ lên 3 phương án logo ban đầu trong vòng 4 ngày để anh duyệt concept trước khi phát triển toàn diện.',
    status: 'ACCEPTED',
    createdAt: '2026-09-27'
  },
  {
    id: 'prop-3',
    projectId: 'prj-8',
    freelancerId: 'free-3',
    freelancerName: 'Phạm Quốc Huy',
    freelancerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=pham-quoc-huy',
    freelancerTitle: 'Video Editor & Motion Graphics Specialist',
    freelancerRating: 4.88,
    freelancerCompletedCount: 36,
    freelancerBio: 'Dựng video TikTok Ads triệu view cho hơn 40 thương hiệu mỹ phẩm, thời trang.',
    freelancerPortfolioUrl: 'https://youtube.com/@huy_media_portfolio',
    bidAmount: 8000000,
    estimatedDays: 18,
    coverLetter: 'Chào chị Mai, tôi chuyên dựng video quảng cáo ngắn TikTok Ads cho mỹ phẩm. Tôi nắm rất rõ nhịp điệu hook 3 giây đầu, text animation chuyển động và thư viện âm thanh thịnh hành giúp tối ưu tỷ lệ nhấp CTR quảng cáo.',
    status: 'PENDING',
    createdAt: '2026-09-28'
  },
  {
    id: 'prop-4',
    projectId: 'prj-10',
    freelancerId: 'free-4',
    freelancerName: 'Vũ Linh Đan',
    freelancerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=vu-linh-dan',
    freelancerTitle: 'Performance Marketing & SEO Expert',
    freelancerRating: 4.85,
    freelancerCompletedCount: 30,
    bidAmount: 11500000,
    estimatedDays: 45,
    coverLetter: 'Chào anh Tuấn Anh, với kinh nghiệm đẩy Top 1 cho hơn 200 từ khóa cạnh tranh cao ngành Bất động sản, tôi cam kết quy trình SEO Whitehat bền vững, audit technical toàn diện và báo cáo minh bạch hàng tuần.',
    status: 'PENDING',
    createdAt: '2026-09-26'
  },
  {
    id: 'prop-5',
    projectId: 'prj-4',
    freelancerId: 'free-5',
    freelancerName: 'Đỗ Bảo Long',
    freelancerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=do-bao-long',
    freelancerTitle: 'Senior Python & AI/LLM Engineer',
    freelancerRating: 4.96,
    freelancerCompletedCount: 45,
    bidAmount: 17500000,
    estimatedDays: 28,
    coverLetter: 'Chào chị Lan, giải pháp Chatbot RAG cho giáo dục là chuyên môn sâu của tôi. Tôi sẽ xây dựng hệ thống embedding với pgvector trên PostgreSQL, kết hợp FastAPI và mô hình tiếng Việt chuẩn xác để hạn chế tối đa hiện tượng ảo giác (hallucination).',
    status: 'PENDING',
    createdAt: '2026-09-29'
  },
  {
    id: 'prop-6',
    projectId: 'prj-12',
    freelancerId: 'free-6',
    freelancerName: 'Ngô Phương Thanh',
    freelancerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=ngo-phuong-thanh',
    freelancerTitle: 'Content Strategist & Creative Copywriter',
    freelancerRating: 4.91,
    freelancerCompletedCount: 44,
    bidAmount: 6000000,
    estimatedDays: 20,
    coverLetter: 'Chào chị Mai, tôi từng viết hơn 150 bài chuyên sâu cho các nhãn hàng dược mỹ phẩm chuẩn y khoa. Bộ 30 bài sẽ được nghiên cứu từ khóa cẩn thận, hành văn dễ hiểu, giữ chân độc giả và thúc đẩy mua hàng.',
    status: 'PENDING',
    createdAt: '2026-09-30'
  },
  {
    id: 'prop-7',
    projectId: 'prj-13',
    freelancerId: 'free-7',
    freelancerName: 'Bùi Hoàng Đức',
    freelancerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=bui-hoang-duc',
    freelancerTitle: 'Kiến trúc sư 3D & BIM Revit Specialist',
    freelancerRating: 4.89,
    freelancerCompletedCount: 40,
    bidAmount: 17000000,
    estimatedDays: 22,
    coverLetter: 'Chào anh Hoàng, tôi rất ấn tượng với ý tưởng quán cafe Acoustic. Tôi cam kết bàn giao moodboard chi tiết, 10 góc view 3D chất lượng cao và trọn bộ hồ sơ kỹ thuật thi công chuẩn xác để nhà thầu thi công ngay.',
    status: 'PENDING',
    createdAt: '2026-09-27'
  },
  {
    id: 'prop-8',
    projectId: 'prj-14',
    freelancerId: 'free-9',
    freelancerName: 'Lê Minh Quang',
    freelancerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=le-minh-quang',
    freelancerTitle: 'Chuyên Viên Kế Toán Trưởng & Tư Vấn Thuế',
    freelancerRating: 4.97,
    freelancerCompletedCount: 48,
    bidAmount: 11000000,
    estimatedDays: 15,
    coverLetter: 'Chào chị Hà, tôi có chứng chỉ hành nghề dịch vụ thuế CPA và 8 năm hỗ trợ các công ty công nghệ SME. Tôi sẽ rà soát rủi ro thuế, hoàn thiện báo cáo tài chính và trực tiếp hỗ trợ giải trình khi có thanh tra thuế.',
    status: 'ACCEPTED',
    createdAt: '2026-09-29'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'TM-2026-8891',
    serviceTitle: 'Thiết kế Bộ Nhận Diện Thương Hiệu & Logo Cho Chuỗi Nhà Hàng Chay',
    projectId: 'prj-5',
    freelancerId: 'free-2',
    freelancerName: 'Trần Hoàng Nam',
    freelancerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=tran-hoang-nam',
    employerId: 'usr-emp-4',
    employerName: 'Trần Việt Hoàng',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=tran-viet-hoang',
    totalAmount: 5500000,
    platformFee: 550000,
    freelancerPayoutAmount: 4950000,
    status: 'ORDER_IN_PROGRESS',
    createdAt: '2026-09-28',
    deadline: '2026-10-12',
    autoAcceptDaysRemaining: 3,
    milestones: [
      {
        id: 'ms-1',
        title: 'Giai đoạn 1: Lên Concept & 3 Mẫu Logo Phác Thảo',
        amount: 2500000,
        status: 'ACCEPTED',
        dueDate: '2026-10-02'
      },
      {
        id: 'ms-2',
        title: 'Giai đoạn 2: Hoàn Thiện Brand Guideline & Menu',
        amount: 3000000,
        status: 'IN_PROGRESS',
        dueDate: '2026-10-12'
      }
    ],
    deliveries: [
      {
        id: 'del-1',
        fileName: 'Foodies_Chay_Logo_Concepts_V1.pdf',
        fileSize: '14.2 MB',
        uploadedAt: '2026-10-02 15:30:00',
        note: 'Đã gửi 3 concept logo kèm phân tích phong thủy và ý nghĩa màu sắc.',
        demoUrl: 'https://behance.net/sample-foodies-chay'
      }
    ],
    revisionCount: 1,
    maxRevisionsAllowed: 3,
    sowRequirements: [
      'Bàn giao file vector gốc .AI, .EPS, .SVG, .PDF',
      'Guideline hệ màu CMYK cho in ấn và RGB cho hiển thị web',
      'Mẫu thiết kế Menu khổ A4 gập 3',
      'Thiết kế bảng hiệu mặt tiền'
    ],
    paymentMethod: 'VNPAY_QR',
    vnpayTransactionId: 'VNPAY-2026-8891-QR'
  },
  {
    id: 'ord-102',
    orderNumber: 'TM-2026-7732',
    serviceTitle: 'Lập trình Ứng dụng Di động Quản lý Kho Hàng cho SME',
    projectId: 'prj-1',
    freelancerId: 'free-1',
    freelancerName: 'Nguyễn Minh Anh',
    freelancerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=nguyen-minh-anh',
    employerId: 'usr-emp-1',
    employerName: 'Lê Thu Hà',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=le-thu-ha',
    totalAmount: 14000000,
    platformFee: 1400000,
    freelancerPayoutAmount: 12600000,
    status: 'ORDER_IN_PROGRESS',
    createdAt: '2026-09-27',
    deadline: '2026-10-22',
    autoAcceptDaysRemaining: 3,
    milestones: [
      {
        id: 'ms-201',
        title: 'Cột mốc 1: Giao diện App Flutter & Quét QR Code',
        amount: 6000000,
        status: 'ACCEPTED',
        dueDate: '2026-10-05'
      },
      {
        id: 'ms-202',
        title: 'Cột mốc 2: Kết nối API Backend, Đồng bộ dữ liệu & Nghiệm thu',
        amount: 8000000,
        status: 'IN_PROGRESS',
        dueDate: '2026-10-22'
      }
    ],
    deliveries: [
      {
        id: 'del-201',
        fileName: 'KhoHang_App_Build_v1.0.apk',
        fileSize: '38.5 MB',
        uploadedAt: '2026-10-05 16:45:00',
        note: 'Bản APK test trên điện thoại Android, tính năng quét mã QR đạt độ nhạy <0.3s.',
        demoUrl: 'https://drive.google.com/sample-apk'
      }
    ],
    revisionCount: 0,
    maxRevisionsAllowed: 3,
    sowRequirements: [
      'Giao diện thân thiện thủ kho, hỗ trợ chế độ Offline',
      'Đồng bộ dữ liệu Realtime với REST API Node.js',
      'Tài liệu hướng dẫn cài đặt và source code GitHub private'
    ],
    paymentMethod: 'VNPAY_ATM',
    vnpayTransactionId: 'VNPAY-2026-7732-ATM'
  },
  {
    id: 'ord-100',
    orderNumber: 'TM-2026-6621',
    serviceTitle: 'Thiết kế Banner Quảng Cáo Meta & Google Display',
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
    milestones: [
      {
        id: 'ms-100',
        title: 'Trọn gói thiết kế 12 Banner đa kích thước',
        amount: 3000000,
        status: 'ACCEPTED',
        dueDate: '2026-09-15'
      }
    ],
    deliveries: [
      {
        id: 'del-100',
        fileName: 'Final_Banners_Package.zip',
        fileSize: '45.8 MB',
        uploadedAt: '2026-09-15 14:00:00',
        note: 'Đã hoàn thiện đầy đủ 12 kích thước banner theo đúng guideline.',
        demoUrl: 'https://drive.google.com/sample-banners'
      }
    ],
    revisionCount: 1,
    maxRevisionsAllowed: 3,
    sowRequirements: ['Bàn giao file PSD và PNG chuẩn nén'],
    paymentMethod: 'VNPAY_QR',
    vnpayTransactionId: 'VNPAY-2026-6621-QR'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    orderId: 'ord-100',
    orderTitle: 'Thiết kế Banner Quảng Cáo Meta & Google Display',
    reviewerId: 'usr-emp-1',
    reviewerName: 'Lê Thu Hà',
    reviewerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=le-thu-ha',
    reviewerRole: 'employer',
    targetId: 'free-2',
    targetName: 'Trần Hoàng Nam',
    rating: 5.0,
    qualityRating: 5.0,
    deadlineRating: 5.0,
    communicationRating: 5.0,
    comment: 'Hoàng Nam làm việc cực kỳ chuyên nghiệp và tận tâm! Banner thiết kế rất bắt mắt, chuẩn kích thước và bàn giao đúng hẹn. Chắc chắn sẽ tiếp tục hợp tác các dự án tiếp theo!',
    date: '2026-09-16',
    freelancerReply: 'Cảm ơn chị Hà và TechStartup đã tin tưởng lựa chọn tôi. Rất mong được tiếp tục đồng hành cùng công ty trong các chiến dịch tới ạ!'
  },
  {
    id: 'rev-2',
    orderId: 'ord-099',
    orderTitle: 'Xây dựng Website E-Commerce Nông Sản Sạch',
    reviewerId: 'usr-emp-2',
    reviewerName: 'Phạm Tuấn Anh',
    reviewerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=pham-tuan-anh',
    reviewerRole: 'employer',
    targetId: 'free-1',
    targetName: 'Nguyễn Minh Anh',
    rating: 4.9,
    qualityRating: 5.0,
    deadlineRating: 4.8,
    communicationRating: 5.0,
    comment: 'Minh Anh là một fullstack developer rất có tâm. Code sạch, tối ưu tốc độ tải trang cực nhanh và hướng dẫn bàn giao hệ thống rất chi tiết.',
    date: '2026-09-18',
    freelancerReply: 'Cảm ơn anh Tuấn Anh đã hỗ trợ phản hồi nhanh chóng trong suốt quá trình triển khai dự án ạ!'
  },
  {
    id: 'rev-3',
    orderId: 'ord-098',
    orderTitle: 'Dựng Chuỗi Video TikTok Ads Mỹ Phẩm',
    reviewerId: 'usr-emp-5',
    reviewerName: 'Đặng Ngọc Mai',
    reviewerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=dang-ngoc-mai',
    reviewerRole: 'employer',
    targetId: 'free-3',
    targetName: 'Phạm Quốc Huy',
    rating: 5.0,
    qualityRating: 5.0,
    deadlineRating: 5.0,
    communicationRating: 4.9,
    comment: 'Huy dựng video rất có gu, hiệu ứng mượt mà và nhịp điệu kích thích mua hàng tốt. Video chạy quảng cáo mang lại lượng đơn hàng rất ấn tượng!',
    date: '2026-09-22'
  }
];

export const INITIAL_DISPUTES: Dispute[] = [
  {
    id: 'disp-1',
    orderId: 'ord-101',
    orderNumber: 'TM-2026-8891',
    openedBy: 'usr-emp-4',
    openedByName: 'Trần Việt Hoàng',
    reason: 'Freelancer chậm tiến độ giao bản sửa lần 2 quá 3 ngày cam kết',
    evidenceNotes: 'Theo cam kết ban đầu bản sửa menu sẽ hoàn thiện vào ngày 05/10 nhưng đến nay vẫn chưa thấy phản hồi dù đã nhắn tin nhắc nhở nhiều lần.',
    status: 'UNDER_REVIEW',
    createdAt: '2026-10-06 10:00:00',
    adminResolutionNote: 'Admin đã liên hệ hai bên qua hotline. Freelancer đã cập nhật bản chỉnh sửa hoàn tất vào 15:00 cùng ngày. Hai bên thống nhất gia hạn thêm 2 ngày hoàn thiện.'
  }
];

export const INITIAL_VNPAY_TRANSACTIONS: VNPayTransaction[] = [
  {
    id: 'vnp-101',
    orderId: 'ord-101',
    orderNumber: 'TM-2026-8891',
    amount: 5500000,
    bankCode: 'VNPAYQR',
    transactionNo: 'VNPAY-2026-8891-QR',
    cardType: 'QR_CODE',
    payDate: '2026-09-28 14:20:05',
    status: 'SUCCESS',
    type: 'ESCROW_DEPOSIT',
    description: 'Nạp cọc Escrow dự án Branding chuỗi nhà hàng qua VNPAY-QR',
    userEmail: 'hoang.tran@foodies.vn'
  },
  {
    id: 'vnp-102',
    orderId: 'ord-102',
    orderNumber: 'TM-2026-7732',
    amount: 14000000,
    bankCode: 'NCB',
    transactionNo: 'VNPAY-2026-7732-ATM',
    cardType: 'ATM_CARD',
    payDate: '2026-09-27 09:15:30',
    status: 'SUCCESS',
    type: 'ESCROW_DEPOSIT',
    description: 'Nạp cọc Escrow dự án App Mobile Quản lý Kho Hàng qua thẻ ATM nội địa',
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
    bankCode: 'VIETINBANK',
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
  // ===================== DÀNH CHO LÊ THU HÀ (usr-emp-1) =====================
  {
    id: 'notif-1',
    userId: 'usr-emp-1',
    title: 'Báo giá mới cho dự án Quản lý Kho Hàng',
    message: 'Freelancer Nguyễn Minh Anh vừa gửi báo giá 14.000.000 đ kèm Portfolio mẫu App Quản lý Kho Hàng.',
    type: 'PROPOSAL',
    link: '/employer/dashboard',
    isRead: false,
    createdAt: '2026-10-13 11:20:00',
    timeAgo: '10 phút trước'
  },
  {
    id: 'notif-2',
    userId: 'usr-emp-1',
    title: 'Tạm giữ tiền Escrow VNPAY thành công',
    message: 'Đã phong tỏa 14.000.000 đ qua Cổng VNPAY vào Ví Tạm Giữ Escrow cho Hợp đồng TM-2026-7732.',
    type: 'ESCROW',
    link: '/employer/dashboard',
    isRead: false,
    createdAt: '2026-10-13 10:15:00',
    timeAgo: '1 giờ trước'
  },
  {
    id: 'notif-3',
    userId: 'usr-emp-1',
    title: 'Freelancer đã nộp bản thử nghiệm APK',
    message: 'Nguyễn Minh Anh đã upload file KhoHang_App_Build_v1.0.apk (38.5 MB) để chờ bạn nghiệm thu Cột mốc 1.',
    type: 'CONTRACT',
    link: '/employer/dashboard',
    isRead: true,
    createdAt: '2026-10-12 16:30:00',
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
    createdAt: '2026-10-11 09:00:00',
    timeAgo: '2 ngày trước'
  },

  // ===================== DÀNH CHO PHẠM TUẤN ANH (usr-emp-2) =====================
  {
    id: 'notif-emp2-1',
    userId: 'usr-emp-2',
    title: 'Có 4 ứng viên nộp đề xuất cho dự án Landing Page Đầu Tư',
    message: 'Nhiều lập trình viên ReactJS giỏi vừa gửi báo giá, ngân sách trung bình 4.200.000 đ.',
    type: 'PROPOSAL',
    link: '/employer/dashboard',
    isRead: false,
    createdAt: '2026-10-13 09:30:00',
    timeAgo: '2 giờ trước'
  },
  {
    id: 'notif-emp2-2',
    userId: 'usr-emp-2',
    title: 'Lời mời dự án đã được Freelancer chấp nhận',
    message: 'Trần Hoàng Nam đã đồng ý trao đổi chi tiết về dự án Thiết kế Landing Page & UI Mobile.',
    type: 'INVITATION',
    link: '/employer/dashboard',
    isRead: true,
    createdAt: '2026-10-12 14:00:00',
    timeAgo: 'Hôm qua'
  },

  // ===================== DÀNH CHO NGUYỄN MAI LAN (usr-emp-3) =====================
  {
    id: 'notif-emp3-1',
    userId: 'usr-emp-3',
    title: 'Đề xuất mới từ Kỹ sư AI Đỗ Bảo Long',
    message: 'Đỗ Bảo Long đề xuất xây dựng kiến trúc Chatbot RAG với FastAPI và pgvector cho học viện EduSparks.',
    type: 'PROPOSAL',
    link: '/employer/dashboard',
    isRead: false,
    createdAt: '2026-10-13 08:45:00',
    timeAgo: '3 giờ trước'
  },

  // ===================== DÀNH CHO TRẦN VIỆT HOÀNG (usr-emp-4) =====================
  {
    id: 'notif-emp4-1',
    userId: 'usr-emp-4',
    title: 'Bàn giao thiết kế Cột mốc 1: Phác thảo Logo',
    message: 'Trần Hoàng Nam đã gửi 3 concept logo Foodies Chay dạng vector PDF để bạn đánh giá.',
    type: 'CONTRACT',
    link: '/employer/dashboard',
    isRead: false,
    createdAt: '2026-10-13 08:15:00',
    timeAgo: '3 giờ trước'
  },
  {
    id: 'notif-emp4-2',
    userId: 'usr-emp-4',
    title: 'Cập nhật từ Trung tâm Trọng tài Tranh chấp',
    message: 'Admin TalentMatch đã phản hồi yêu cầu khiếu nại tiến độ của bạn. Hai bên đã thống nhất gia hạn thêm 2 ngày.',
    type: 'SYSTEM',
    link: '/employer/dashboard',
    isRead: true,
    createdAt: '2026-10-12 11:00:00',
    timeAgo: 'Hôm qua'
  },

  // ===================== DÀNH CHO ĐẶNG NGỌC MAI (usr-emp-5) =====================
  {
    id: 'notif-emp5-1',
    userId: 'usr-emp-5',
    title: '5 Freelancer ứng tuyển dự án Sản xuất Video TikTok Ads',
    message: 'Phạm Quốc Huy và 4 ứng viên khác đã gửi portfolio video triệu view để bạn lựa chọn.',
    type: 'PROPOSAL',
    link: '/employer/dashboard',
    isRead: false,
    createdAt: '2026-10-13 10:30:00',
    timeAgo: '1 giờ trước'
  },

  // ===================== DÀNH CHO NGUYỄN MINH ANH (usr-free-1) =====================
  {
    id: 'notif-inv-1',
    userId: 'usr-free-1',
    title: 'Lời mời nhận dự án mới từ Lê Thu Hà (TechStartup VN)',
    message: 'Doanh nghiệp đã gửi lời mời bạn tham gia dự án "Xây dựng Website Thương mại điện tử B2B Nông sản" với ngân sách 15.000.000 đ.',
    type: 'INVITATION',
    link: '/freelancer/dashboard',
    isRead: false,
    createdAt: '2026-10-13 11:30:00',
    timeAgo: 'Vừa xong'
  },
  {
    id: 'notif-5',
    userId: 'usr-free-1',
    title: 'Nhà tuyển dụng đã duyệt báo giá dự án App Quản lý Kho!',
    message: 'Lê Thu Hà (TechStartup Việt Nam) đã chấp nhận báo giá 14.000.000 đ và nạp cọc 100% vào Escrow.',
    type: 'CONTRACT',
    link: '/freelancer/dashboard',
    isRead: false,
    createdAt: '2026-10-13 11:10:00',
    timeAgo: '20 phút trước'
  },
  {
    id: 'notif-6',
    userId: 'usr-free-1',
    title: 'Giải ngân Cột mốc 1 thành công: +6.000.000 đ',
    message: 'Số tiền 5.400.000 đ (sau khấu trừ 10% phí sàn) đã được cộng trực tiếp vào Số dư Ví khả dụng của bạn.',
    type: 'ESCROW',
    link: '/freelancer/dashboard',
    isRead: false,
    createdAt: '2026-10-13 08:30:00',
    timeAgo: '3 giờ trước'
  },
  {
    id: 'notif-7',
    userId: 'usr-free-1',
    title: 'Đánh giá 4.9★ mới & +20 Điểm TalentCredit',
    message: 'Phạm Tuấn Anh vừa để lại nhận xét xuất sắc về website Nông sản Sạch. Điểm tín nhiệm của bạn hiện đạt 940/1000.',
    type: 'REVIEW',
    link: '/freelancer/dashboard',
    isRead: true,
    createdAt: '2026-10-12 18:00:00',
    timeAgo: 'Hôm qua'
  },
  {
    id: 'notif-8',
    userId: 'usr-free-1',
    title: 'Dự án mới phù hợp với kỹ năng Flutter & ReactJS',
    message: 'Có 3 dự án mới đăng tuyển thuộc ngành IT & Lập trình Web/App đang tìm kiếm chuyên gia như bạn.',
    type: 'SYSTEM',
    link: '/projects',
    isRead: true,
    createdAt: '2026-10-12 14:00:00',
    timeAgo: 'Hôm qua'
  },

  // ===================== DÀNH CHO TRẦN HOÀNG NAM (usr-free-2) =====================
  {
    id: 'notif-inv-2',
    userId: 'usr-free-2',
    title: 'Lời mời nhận dự án mới từ Phạm Tuấn Anh (Invest Growth)',
    message: 'Doanh nghiệp đã gửi lời mời bạn tham gia dự án "Thiết kế Bộ nhận diện thương hiệu & UI/UX Mobile App" với ngân sách 8.500.000 đ.',
    type: 'INVITATION',
    link: '/freelancer/dashboard',
    isRead: false,
    createdAt: '2026-10-13 09:00:00',
    timeAgo: '2 giờ trước'
  },
  {
    id: 'notif-9',
    userId: 'usr-free-2',
    title: 'Doanh nghiệp đã duyệt Cột mốc 1 dự án Foodies Chay',
    message: 'Trần Việt Hoàng đã bấm nghiệm thu Cột mốc 1. Thù lao 2.250.000 đ đã giải ngân vào ví của bạn.',
    type: 'ESCROW',
    link: '/freelancer/dashboard',
    isRead: false,
    createdAt: '2026-10-13 10:45:00',
    timeAgo: '45 phút trước'
  },
  {
    id: 'notif-free2-3',
    userId: 'usr-free-2',
    title: 'Đánh giá 5.0★ & Lời khen xuất sắc từ Lê Thu Hà',
    message: '"Hoàng Nam làm việc cực kỳ chuyên nghiệp và tận tâm!" - Điểm TalentCredit của bạn tăng lên 965/1000.',
    type: 'REVIEW',
    link: '/freelancer/dashboard',
    isRead: true,
    createdAt: '2026-10-11 15:20:00',
    timeAgo: '2 ngày trước'
  },

  // ===================== DÀNH CHO PHẠM QUỐC HUY (usr-free-3) =====================
  {
    id: 'notif-free3-1',
    userId: 'usr-free-3',
    title: 'Dự án mới: Chuỗi 15 Video Ngắn TikTok Ads Mỹ Phẩm',
    message: 'Khách hàng Bella Mode Vietnam đang tìm Video Editor chuyên Premiere & After Effects. Hãy gửi báo giá ngay!',
    type: 'SYSTEM',
    link: '/projects',
    isRead: false,
    createdAt: '2026-10-13 10:00:00',
    timeAgo: '1 giờ trước'
  },

  // ===================== DÀNH CHO VŨ LINH ĐAN (usr-free-4) =====================
  {
    id: 'notif-free4-1',
    userId: 'usr-free-4',
    title: 'Cơ hội nhận dự án SEO Bất Động Sản Nghỉ Dưỡng',
    message: 'Dự án "SEO Portal Bất Động Sản" ngân sách 12.000.000 đ đang rất cần chuyên gia như bạn.',
    type: 'SYSTEM',
    link: '/projects',
    isRead: false,
    createdAt: '2026-10-13 08:30:00',
    timeAgo: '3 giờ trước'
  },

  // ===================== DÀNH CHO ĐỖ BẢO LONG (usr-free-5) =====================
  {
    id: 'notif-free5-1',
    userId: 'usr-free-5',
    title: 'Lời mời dự án Trợ lý AI Chatbot RAG từ EduSparks Academy',
    message: 'Nguyễn Mai Lan đã xem portfolio RAG Chatbot của bạn trên Github và gửi lời mời báo giá dự án 18.000.000 đ.',
    type: 'INVITATION',
    link: '/freelancer/dashboard',
    isRead: false,
    createdAt: '2026-10-13 09:15:00',
    timeAgo: '2 giờ trước'
  },

  // ===================== DÀNH CHO QUẢN TRỊ VIÊN ADMIN (usr-admin-1) =====================
  {
    id: 'notif-10',
    userId: 'usr-admin-1',
    title: 'Yêu cầu Trọng tài Tranh chấp mới: Hợp đồng TM-2026-8891',
    message: 'Employer Trần Việt Hoàng mở khiếu nại về tiến độ bàn giao menu nhà hàng.',
    type: 'SYSTEM',
    link: '/admin/dashboard',
    isRead: false,
    createdAt: '2026-10-13 09:15:00',
    timeAgo: '2 giờ trước'
  },
  {
    id: 'notif-admin-2',
    userId: 'usr-admin-1',
    title: 'Giao dịch Escrow lớn nạp thành công qua VNPay',
    message: 'Hệ thống vừa ghi nhận nạp cọc 14.000.000 đ qua Cổng VNPAY từ khách hàng TechStartup Việt Nam.',
    type: 'ESCROW',
    link: '/admin/dashboard',
    isRead: false,
    createdAt: '2026-10-13 09:30:00',
    timeAgo: '2 giờ trước'
  },
  {
    id: 'notif-admin-3',
    userId: 'usr-admin-1',
    title: 'Hồ sơ xác thực eKYC mới chờ phê duyệt',
    message: 'Ứng viên Bùi Hoàng Đức và Lê Minh Quang vừa nộp căn cước công dân và ảnh chụp selfie.',
    type: 'SYSTEM',
    link: '/admin/dashboard',
    isRead: true,
    createdAt: '2026-10-12 17:00:00',
    timeAgo: 'Hôm qua'
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
    createdAt: '2026-10-13 11:30:00'
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
    createdAt: '2026-10-13 09:00:00'
  },
  {
    id: 'inv-3',
    projectId: 'prj-4',
    projectTitle: 'Tích hợp Trợ lý AI Chatbot RAG Hỗ trợ Tư vấn Tuyển sinh 24/7',
    projectCategory: 'IT & Lập trình',
    projectBudget: 18000000,
    projectDeadline: '35 ngày',
    projectDescription: 'Xây dựng trợ lý ảo AI thông minh dựa trên mô hình RAG phục vụ tư vấn học viên học viện EduSparks.',
    employerId: 'usr-emp-3',
    employerName: 'Nguyễn Mai Lan',
    employerCompany: 'Học viện Giáo dục Trực tuyến EduSparks',
    employerAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=nguyen-mai-lan',
    freelancerId: 'free-5',
    freelancerUserId: 'usr-free-5',
    freelancerName: 'Đỗ Bảo Long',
    message: 'Chào Bảo Long, học viện EduSparks theo dõi các sản phẩm RAG Chatbot của bạn trên Github và đánh giá rất cao. Mời bạn tham gia nhận dự án!',
    status: 'PENDING',
    createdAt: '2026-10-13 09:15:00'
  }
];
