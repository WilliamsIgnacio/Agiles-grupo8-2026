export interface User {
  id: number;
  email: string;
  name: string;
  avatarUrl: string;
  role: 'user' | 'admin';
  provider: string;
}

export interface Credentials {
  email: string;
  password: string;
  name?: string;
}
