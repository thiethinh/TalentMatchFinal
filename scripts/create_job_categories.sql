CREATE TABLE IF NOT EXISTS job_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    code VARCHAR(60) NOT NULL UNIQUE,
    icon VARCHAR(60) DEFAULT 'fa-briefcase',
    professions TEXT NOT NULL,
    suggested_skills TEXT,
    display_order INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO job_categories (name, code, icon, professions, suggested_skills, display_order, status)
VALUES
('IT & Lập trình', 'it-dev', 'fa-code',
 '["Full-Stack Web Developer", "Frontend Developer (React/Vue)", "Backend Developer (Node.js/Java/Go)", "Mobile App Developer (Flutter/React Native)", "DevOps & Cloud Engineer (AWS/Docker)", "Kỹ sư AI & Machine Learning", "QA / Automation Tester", "Embedded & IoT Developer"]',
 'ReactJS, Node.js, TypeScript, Java, Spring Boot, Python, Flutter, Docker, AWS', 1, 'ACTIVE'),

('Thiết kế & Đồ họa', 'design', 'fa-pen-nib',
 '["UI/UX Designer (Figma/Web)", "Graphic Designer (Branding/Poster)", "3D Modeler & Animator (Blender/Maya)", "Product Designer", "Illustrator & Vẽ minh họa", "Thiết kế bao bì & In ấn"]',
 'Figma, Adobe Photoshop, Adobe Illustrator, UI/UX, Blender, After Effects', 2, 'ACTIVE'),

('Digital Marketing', 'marketing', 'fa-bullhorn',
 '["Chuyên viên Chạy Ads (Facebook/Google/TikTok)", "SEO Specialist & Tối ưu từ khóa", "Growth Marketer & Performance", "Social Media Manager", "Email Marketing & Automation", "KOL / Influencer Booking"]',
 'Facebook Ads, Google Ads, TikTok Ads, SEO, Google Analytics, Content Marketing', 3, 'ACTIVE'),

('Video & Animation', 'media', 'fa-video',
 '["Video Editor (TikTok/Reels/Shorts)", "Motion Graphics Designer", "Dựng phim & Biên tập hậu kỳ YouTube", "Voice Talent & Lồng tiếng", "Quay phim & Sản xuất TVC"]',
 'Premiere Pro, After Effects, CapCut, DaVinci Resolve, Motion Design', 4, 'ACTIVE'),

('Viết lách & Dịch thuật', 'content-translation', 'fa-language',
 '["Biên kịch & Copywriter sáng tạo", "Viết bài chuẩn SEO & PR", "Biên dịch tiếng Anh - Việt", "Biên dịch tiếng Nhật / Hàn / Trung", "Biên tập & Soát lỗi sách/tạp chí"]',
 'Copywriting, SEO Writing, English Translation, Japanese N1/N2, Content Creation', 5, 'ACTIVE'),

('Tài chính & Kế toán', 'finance', 'fa-chart-pie',
 '["Kế toán thuế & Quyết toán tài chính", "Chuyên viên Phân tích dữ liệu tài chính", "Cố vấn thuế cá nhân & doanh nghiệp", "Kiểm toán nội bộ & Báo cáo quản trị"]',
 'Excel nâng cao, MISA, Báo cáo tài chính, Kế toán thuế, Phân tích dữ liệu', 6, 'ACTIVE'),

('Kỹ thuật & Kiến trúc', 'engineering', 'fa-compass-drafting',
 '["Thiết kế Kiến trúc & Nội thất 3D", "Kỹ sư BIM / Revit", "Bản vẽ kỹ thuật AutoCAD", "Kết cấu công trình & Dự toán"]',
 'AutoCAD, Revit, SketchUp, 3ds Max, V-Ray, Phối cảnh 3D', 7, 'ACTIVE'),

('Kỹ sư AI & Dữ liệu', 'ai-data', 'fa-brain',
 '["Kỹ sư Prompt Engineer & ChatGPT/Claude", "Data Analyst & Business Intelligence (PowerBI/Tableau)", "Machine Learning Engineer (NLP/CV)", "Data Engineer (SQL/Spark/Airflow)"]',
 'Python, Machine Learning, PowerBI, SQL, NLP, LangChain, TensorFlow', 8, 'ACTIVE')
ON DUPLICATE KEY UPDATE
name=VALUES(name), icon=VALUES(icon), professions=VALUES(professions), suggested_skills=VALUES(suggested_skills), display_order=VALUES(display_order);

