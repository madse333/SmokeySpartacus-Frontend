import { Component, EventEmitter, Output } from '@angular/core';
import { Auth, signInWithEmailAndPassword, User } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-component.html',
  styleUrls: ['./login-component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  @Output() loggedIn = new EventEmitter<User>();

  constructor(private auth: Auth) {}

  async login() {
    this.error = '';
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, this.email, this.password);
      this.loggedIn.emit(userCredential.user);
      console.log('User logged in successfully');
    } catch (err: any) {
      this.error = err.message;
    }
  }
}
