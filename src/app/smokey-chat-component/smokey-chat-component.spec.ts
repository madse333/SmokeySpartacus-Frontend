import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmokeyChatComponent } from './smokey-chat-component';

describe('SmokeyChatComponent', () => {
  let component: SmokeyChatComponent;
  let fixture: ComponentFixture<SmokeyChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmokeyChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmokeyChatComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
