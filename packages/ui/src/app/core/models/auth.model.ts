export interface UserProfile {
  id: number;
  sub: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  access_level: number;
  organization_id: number;
  is_enabled: boolean;
  job_title: string;
  last_login: number;
  logins: number;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user?: UserProfile;
}

export interface AuthState {
  isLoggedIn: boolean;
  userProfile: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
}
