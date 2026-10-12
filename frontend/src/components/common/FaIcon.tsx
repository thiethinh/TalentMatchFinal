import React from 'react';

interface FaIconProps {
  name: string;
  className?: string;
  type?: 'solid' | 'regular' | 'brands';
}

/**
 * Standard Font Awesome 6 Icon Component
 * Tuân thủ tiêu chuẩn Clean Web UI: Icon tiêu chuẩn, gọn gàng, rõ nét.
 */
export const FaIcon: React.FC<FaIconProps> = ({ name, className = '', type = 'solid' }) => {
  const prefix = type === 'brands' ? 'fa-brands' : type === 'regular' ? 'fa-regular' : 'fa-solid';
  const cleanName = name.startsWith('fa-') ? name : `fa-${name}`;
  return <i className={`${prefix} ${cleanName} ${className}`} aria-hidden="true" />;
};

export default FaIcon;
