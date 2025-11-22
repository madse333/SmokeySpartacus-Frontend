import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SmokeyChatComponent } from './smokey-chat-component/smokey-chat-component';
import { LoginComponent } from './login-component/login-component';
import { RegisterComponent } from './register-component/register-component';
import { User as FirebaseUser } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { signOut, Auth } from '@angular/fire/auth';

export interface AppUser {
  id: string;
  email?: string | null;
  name?: string | null;
  tokens: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, SmokeyChatComponent, LoginComponent, RegisterComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})

export class App {
  protected readonly title = signal('smokiespartacusai');

  // Reactive signals
  currentUser = signal<AppUser | null>(null);
  tokens = signal<number>(0);

  // Menu state
  menuOpen = false;
  showLogin = true;
  showRegister = false;

  constructor(private firestore: Firestore, private auth: Auth) {}

  // Close login/register menu
  closeModal() {
    this.showLogin = false;
    this.showRegister = false;
    this.menuOpen = false;
  }

  // Called when LoginComponent emits loggedIn
  async onLoggedIn(user: FirebaseUser) {
    const appUser: AppUser = {
      id: user.uid,
      email: user.email,
      name: user.displayName,
      tokens: 0 // will fetch from Firestore
    };
    this.currentUser.set(appUser);
    await this.refreshTokens();
    this.closeModal();
  }

  async logout() {
    await signOut(this.auth);
    this.currentUser.set(null);
    this.tokens.set(0);
    this.menuOpen = false;
  }

  // Called when RegisterComponent emits registered
  async onRegistered(user: FirebaseUser) {
    const appUser: AppUser = {
      id: user.uid,
      email: user.email,
      name: user.displayName,
      tokens: 0 // new users can start with 5 if you like
    };
    this.currentUser.set(appUser);
    await this.refreshTokens();
    this.closeModal();
  }

  // Fetch tokens from Firestore
  async refreshTokens() {
    if (!this.currentUser()) return;

    const uid = this.currentUser()!.id;
    const userDoc = await getDoc(doc(this.firestore, 'users', uid));

    if (userDoc.exists()) {
      const data = userDoc.data();
      this.tokens.set(data['tokens'] || 0);

      // update AppUser tokens as well
      this.currentUser.set({
        ...this.currentUser()!,
        tokens: data['tokens'] || 0
      });

      console.log('Tokens refreshed:', this.tokens());
    } else {
      console.warn('User document not found in Firestore');
      this.tokens.set(0);
    }
  }
}
