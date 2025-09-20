import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly USER_KEY = 'auth-user';

  clean(): void {
    window.sessionStorage.clear();
  }

  public saveUser(user: User): void {
    window.sessionStorage.removeItem(this.USER_KEY);
    window.sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  public getUser(): User | null {
    const user = window.sessionStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  public isLoggedIn(): boolean {
    return !!this.getUser();
  }

  public getLoggedInUserId(): number | null {
    const user = this.getUser();
    return user?.id || null;
  }

  public clearAll(): void {
    this.clean();
  }
}
