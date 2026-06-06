export interface User {
  username: string;
  full_name: string;
  role: string;
}

export type Priority = 'alta' | 'media' | 'baja';
export type Status = 'abierto' | 'en progreso' | 'completado';

export interface Issue {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  created_at: string;
  updated_at: string | null;
}

export interface IssueCreate {
  title: string;
  description: string;
  priority: Priority;
  status?: Status;
}

export interface IssueUpdate {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: Status;
}

export interface Summary {
  total: number;
  by_status: Record<string, number>;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}
