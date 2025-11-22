import { Component, EventEmitter, Output } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-component.html',
  styleUrls: ['./register-component.css']
})

export class RegisterComponent {
  email = '';
  password = '';
  error = '';

  // <-- Declare the EventEmitter here
  @Output() registered = new EventEmitter<User>();

  constructor(private auth: Auth, private firestore: Firestore) {}

  async register() {
    this.error = '';
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
      const uid = userCredential.user.uid;

      await setDoc(doc(this.firestore, 'users', uid), {
        email: this.email,
        tokens: 5,
        displayName: ''
      });

      // Emit the user so App component knows someone just registered
      this.registered.emit(userCredential.user);

      console.log('User registered successfully');
    } catch (err: any) {
      this.error = err.message;
    }
  }
}
