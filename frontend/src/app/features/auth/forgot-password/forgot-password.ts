import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPassword {
  email: string = '';
  isSubmitting = false;
  message: string | null = null;
  error: string | null = null;

  showToast = false;
  toastTitle = 'Error';
  toastTimer: any = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  dismissToast() {
    this.showToast = false;
    this.cdr.detectChanges();
  }

  triggerToast(title: string, msg: string) {
    this.toastTitle = title;
    this.error = msg;
    this.showToast = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.showToast = false;
      this.cdr.detectChanges();
    }, 5000);
    this.cdr.detectChanges();
  }

  clearErrors() {
    if (this.showToast || this.error) {
      this.showToast = false;
      this.error = null;
      this.cdr.detectChanges();
    }
  }

  onSubmit() {
    const cleanEmail = (this.email || '').trim();

    if (!cleanEmail) {
      this.triggerToast('Missing Email', 'Please enter your registered email address.');
      return;
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      this.triggerToast('Invalid Email Format', 'Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    this.isSubmitting = true;
    this.error = null;
    this.message = null;
    this.showToast = false;
    this.cdr.detectChanges();

    this.authService.forgotPassword(this.email.trim()).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.message = 'OTP sent to your email. Redirecting...';
          this.showToast = false;
          this.cdr.detectChanges();
          setTimeout(() => {
            this.router.navigate(['/reset-password']);
          }, 2000);
        } else {
          const msg = res.message || 'Failed to send OTP.';
          this.triggerToast('Request Failed', msg);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSubmitting = false;
        const msg = err.error?.message || 'An error occurred. Please check your email and try again.';
        this.triggerToast('Request Failed', msg);
        this.cdr.detectChanges();
      }
    });
  }

  goBack() {
    this.router.navigate(['/login']);
  }
}
