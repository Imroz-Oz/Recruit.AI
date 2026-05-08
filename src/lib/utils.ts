import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function maskEmail(email: string | undefined): string {
  if (!email) return '';
  const godEmails = ['king007.2311@gmail.com', 'moimroz231997@gmail.com'];
  if (godEmails.includes(email)) {
    return 'CLASSIFIED-ADMIN@recruit.ai';
  }
  return email;
}
