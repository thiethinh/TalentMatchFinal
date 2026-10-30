/**
 * Cấu hình Cloudinary và tiện ích chuẩn hóa Avatar
 * Theo cấu hình Cloudinary: cloud_name = "duypvtz5w"
 * Database MySQL chỉ lưu TÊN ẢNH (vd: image.png, avatar_2_1740928374.png), KHÔNG lưu toàn bộ link.
 */

export const CLOUDINARY_IMAGE_BASE_URL = 'https://res.cloudinary.com/duypvtz5w/image/upload/';

/**
 * Phân giải đường dẫn avatar hiển thị:
 * - Nếu avatar là link đầy đủ (http, https, data:, /): giữ nguyên.
 * - Nếu avatar là tên file lưu trong DB (vd: image.png, avatar_2_xxx.png): tự động nối với CLOUDINARY_IMAGE_BASE_URL.
 * - Nếu rỗng/null: trả về ảnh mặc định dicebear svg theo seed.
 */
export function resolveAvatarUrl(avatar?: string | null, seed: string = 'user'): string {
  if (!avatar || !avatar.trim()) {
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed)}`;
  }

  const clean = avatar.trim();
  if (
    clean.startsWith('http://') ||
    clean.startsWith('https://') ||
    clean.startsWith('data:') ||
    clean.startsWith('/')
  ) {
    return clean;
  }

  // Tên file lưu trong DB (không chứa link) -> Ghép với Cloudinary URL
  return `${CLOUDINARY_IMAGE_BASE_URL}${clean}`;
}

