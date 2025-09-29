import CryptoJS from 'crypto-js';

export function getGravatarUrl(email: string, size: number = 128): string {
  const normalizedEmail = email.toLowerCase().trim();
  const hash = CryptoJS.MD5(normalizedEmail).toString();
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon&r=pg`;
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}