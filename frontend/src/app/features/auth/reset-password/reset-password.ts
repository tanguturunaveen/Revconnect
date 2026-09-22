import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPassword implements OnInit {
  otp = '';
  newPassword = '';
  confirmPassword = '';
  isSubmitting = false;
  message: string | null = null;
  error: string | null = null;
  showPassword = false;
  showConfirmPassword = false;

  showToast = false;
  toastTitle = 'Reset Error';
  toastTimer: any = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
  }

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
    const cleanOtp = (this.otp || '').trim();

    if (!cleanOtp) {
      this.triggerToast('Missing OTP', 'Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    if (cleanOtp.length !== 6) {
      this.triggerToast('Invalid OTP', `The OTP must be exactly 6 digits (currently ${cleanOtp.length}).`);
      return;
    }

    if (!/^\d{6}$/.test(cleanOtp)) {
      this.triggerToast('Invalid OTP Format', 'The OTP code must contain numbers only.');
      return;
    }

    if (!this.newPassword) {
      this.triggerToast('Missing Password', 'Please enter your new password.');
      return;
    }

    if (this.newPassword.length < 6) {
      this.triggerToast('Password Too Short', 'Password must be at least 6 characters long.');
      return;
    }

    if (!this.confirmPassword) {
      this.triggerToast('Confirm Password', 'Please re-type your password in the confirm field.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.triggerToast('Passwords Do Not Match', 'New password and confirmation password must match exactly.');
      return;
    }

    this.isSubmitting = true;
    this.error = null;
    this.message = null;
    this.showToast = false;
    this.cdr.detectChanges();

    this.authService.resetPassword({ token: cleanOtp, newPassword: this.newPassword }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res && (res.success || (res as any).status === 200)) {
          this.message = res.message || 'Password successfully updated! Redirecting to login...';
          this.otp = '';
          this.newPassword = '';
          this.confirmPassword = '';
          this.error = null;
          this.showToast = false;
          this.cdr.detectChanges();
          setTimeout(() => this.router.navigate(['/login']), 2500);
        } else {
          const msg = res.message || 'Failed to reset password. Please check your OTP.';
          this.triggerToast('Reset Failed', msg);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Reset error:', err);
        const msg = err.error?.message || err.message || 'Invalid or expired OTP. Please try again.';
        this.triggerToast('Reset Failed', msg);
        this.cdr.detectChanges();
      }
    });
  }

  goBack() {
    this.router.navigate(['/login']);
  }
}
