import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, ViewChild, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Auth, getIdToken } from '@angular/fire/auth';
import type { AppUser } from '../app';

interface ChatMessage {
  role: 'user' | 'smokey';
  text: string;
}

@Component({
  selector: 'app-smokey-chat-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './smokey-chat-component.html',
  styleUrls: ['./smokey-chat-component.css'],
})
export class SmokeyChatComponent implements OnInit {
  @ViewChild('chatWindow') chatWindow!: ElementRef;
  @Input() user!: AppUser | null;

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private http = inject(HttpClient);
  private cd = inject(ChangeDetectorRef);

  fallingItems: {
    img: string;
    left: string;
    width: string;
    height: string;
    rotateStart: number;
    rotateEnd: number;
    duration: string;
    delay: string;
  }[] = [];
  messages: ChatMessage[] = [];
  input = '';
  leafImages = [
    '/SmokeyLim.png',
    '/SmokeyVindruer.png',
    '/SmokeyKiks.png',
  ];

  constructor() {
    this.generateFallingItems();
  }

  ngOnInit() {
    this.refreshTokens();
  }

  scrollToBottom() {
    try {
      this.chatWindow.nativeElement.scrollTop = this.chatWindow.nativeElement.scrollHeight;
    } catch {}
  }

  randomLeaf(): string {
    const index = Math.floor(Math.random() * this.leafImages.length);
    return this.leafImages[index];
  }

  randomMostlyEdges(): string {
    const edgeChance = 0.7;
    const spread = 15;
    if (Math.random() < edgeChance) {
      const side = Math.random() < 0.35 ? 'left' : 'right';
      return side === 'left' ? `${Math.random() * spread}%` : `${100 - spread + Math.random() * spread}%`;
    } else {
      return `${Math.random() * 100}%`;
    }
  }

  generateFallingItems() {
    const count = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const size = 20 + Math.random() * 20;
      this.fallingItems.push({
        img: this.randomLeaf(),
        left: this.randomMostlyEdges(),
        width: `${size}px`,
        height: `${size * 2}px`,
        rotateStart: Math.random() * 360,
        rotateEnd: Math.random() * 360,
        duration: `${6 + Math.random() * 6}s`,
        delay: `${Math.random() * 8}s`,
      });
    }
  }

  async refreshTokens() {
    if (!this.user) return;
    const userRef = doc(this.firestore, 'users', this.user.id);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      this.user.tokens = data['tokens'] || 0;
      this.cd.detectChanges();
    }
  }

  async send() {
    if (!this.user) return;

    if (this.user.tokens <= 0) {
      alert('You have no tokens left! Please wait or get more tokens.');
      return;
    }

    const question = this.input.trim();
    if (!question) return;

    const userRef = doc(this.firestore, 'users', this.user.id);
    this.user.tokens -= 1;
    await updateDoc(userRef, { tokens: this.user.tokens });

    this.messages.push({ role: 'user', text: question });
    this.input = '';
    this.scrollToBottom();

    const thinkingMsg: ChatMessage = { role: 'smokey', text: 'Fortvivl ej... Smokey tænker' };
    this.messages.push(thinkingMsg);
    this.scrollToBottom();

    let dots = 0;
    const interval = setInterval(() => {
      dots = (dots + 1) % 4;
      thinkingMsg.text = 'Fortvivl ej... Smokey tænker' + '.'.repeat(dots);
      this.cd.detectChanges();
      this.scrollToBottom();
    }, 500);

    try {
      if (!this.auth.currentUser) throw new Error('User not signed in');

      const idToken = await getIdToken(this.auth.currentUser, true);

      const res = await this.http.post<{ reply: string }>(
          'https://smokeyspartacusfunctions-hxa2gucabea8agcr.westeurope-01.azurewebsites.net/api/AskSmokey',
          { question },
          { headers: { Authorization: `Bearer ${idToken}` } }
        ).toPromise();

      clearInterval(interval);
      thinkingMsg.text = res?.reply ?? 'Smokey svarede ikke!';
      this.cd.detectChanges();
      this.scrollToBottom();
    } catch (err) {
      clearInterval(interval);
      thinkingMsg.text = 'Smokey snublede i sin egen kaotiske sjæl! Fejl i kaldet.';
      this.cd.detectChanges();
      this.scrollToBottom();
    }
  }
}
