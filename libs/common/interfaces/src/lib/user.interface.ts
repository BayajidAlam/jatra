export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  STAFF = "STAFF",
}

export interface Passenger {
  name: string;
  age: number;
  gender: "MALE" | "FEMALE" | "OTHER";
  nid?: string;
  passport?: string;
}
