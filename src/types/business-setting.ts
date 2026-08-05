export type BusinessLogo = {
  url?: string;
  secure_url?: string;
} | null;

export type BusinessSetting = {
  id?: number;
  businessName?: string | null;
  logo?: BusinessLogo;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
};