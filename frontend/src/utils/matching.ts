/**
 * Utility functions for robust ID matching across prefixes (e.g. prj-9 vs 9, usr-emp-2 vs 2 vs emp-2)
 */

export const isSameProject = (idA?: string | number, idB?: string | number): boolean => {
  if (!idA || !idB) return false;
  if (String(idA) === String(idB)) return true;
  const numA = String(idA).replace(/\D/g, '');
  const numB = String(idB).replace(/\D/g, '');
  return Boolean(numA && numA === numB);
};

export const isUserMatching = (targetUserId?: string | number, currentUserId?: string | number): boolean => {
  if (!targetUserId || !currentUserId) return false;
  if (targetUserId === 'all' || currentUserId === 'all') return true;
  if (String(targetUserId) === String(currentUserId)) return true;
  const numTarget = String(targetUserId).replace(/\D/g, '');
  const numCurrent = String(currentUserId).replace(/\D/g, '');
  return Boolean(numTarget && numTarget === numCurrent);
};

