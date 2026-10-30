export interface IUser {
  id: string; // 🟢 Clean, explicit, and context-aware
  emailAddress: string;
  firstName: string;
  lastName: string;
  status: string;
  enabled: boolean;
  lastLogin: string | null;
  phoneMobile: string | null;
  companyId: string;
}
