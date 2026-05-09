import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const GOD_EMAILS = ['king007.2311@gmail.com', 'moimroz231997@gmail.com', 'shivanikatakwar6@gmail.com'];

export function maskEmail(email: string | undefined): string {
  if (!email) return '';
  if (GOD_EMAILS.includes(email)) {
    return 'CLASSIFIED-ADMIN@recruit.ai';
  }
  return email;
}
