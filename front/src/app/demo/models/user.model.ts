export interface User {
  id: number;
  name: string;
  email: string;
  roles: Role[];
  badge?: string;
}

export interface Role {
  id?: number;
  name: string;
}
