export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: "USER" | "ADMIN";
  nid?: string;
  createdAt: string;
}

export interface LoginRequest {
  emailOrPhone: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  nid?: string;
}

export interface AuthResponse {
  user: User;
  message: string;
}
