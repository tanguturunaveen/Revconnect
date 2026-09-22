
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegisterRequest } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {

  details: RegisterRequest = {
    name: '',
    username: '',
    email: '',
    password: '',
    userType: 'PERSONAL',
    category: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    logoUrl: '',
    coverImageUrl: ''
  };

  isLoading = false;
  isVerifying = false;
  isResending = false;
  errorMessage = '';
  successMessage = '';
  passwordStrength = 0;
  showPassword = false;
  readonly emailPattern = '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$';

  step: 'REGISTER' | 'VERIFY' | 'SUCCESS' = 'REGISTER';
  otp: string = '';

  showToast = false;
  toastTitle = 'Registration Error';
  toastTimer: any = null;

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) { }

  dismissToast() {
    this.showToast = false;
    this.cdr.detectChanges();
  }

  triggerToast(title: string, msg: string) {
    this.toastTitle = title;
    this.errorMessage = msg;
    this.showToast = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.showToast = false;
      this.cdr.detectChanges();
    }, 5000);
    this.cdr.detectChanges();
  }

  clearErrors() {
    if (this.showToast || this.errorMessage) {
      this.showToast = false;
      this.errorMessage = '';
      this.cdr.detectChanges();
    }
  }

  onTypeChange() {
    this.details.category = '';
    this.details.address = '';
    this.details.contactEmail = '';
    this.details.contactPhone = '';
    this.details.logoUrl = '';
    this.details.coverImageUrl = '';
    this.clearErrors();
  }

  checkPasswordStrength() {
    this.clearErrors();
    const pbox = this.details.password;
    this.passwordStrength = 0;
    if (!pbox) return;

    if (pbox.length >= 6) this.passwordStrength += 25;
    if (/[A-Z]/.test(pbox)) this.passwordStrength += 25;
    if (/[0-9]/.test(pbox)) this.passwordStrength += 25;
    if (/[^A-Za-z0-9]/.test(pbox)) this.passwordStrength += 25;
  }

  onSubmit(registerForm: NgForm) {
    const name = (this.details.name || '').trim();
    const username = (this.details.username || '').trim();
    const email = (this.details.email || '').trim();
    const password = this.details.password || '';

    if (!name) {
      this.triggerToast('Missing Name', 'Please enter your full name or company name.');
      return;
    }
    if (name.length < 3) {
      this.triggerToast('Name Too Short', 'Name must be at least 3 characters long.');
      return;
    }
    if (!username) {
      this.triggerToast('Missing Username', 'Please choose a username.');
      return;
    }
    if (username.length < 3) {
      this.triggerToast('Username Too Short', 'Username must be at least 3 characters long.');
      return;
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      this.triggerToast('Invalid Username', 'Username can only contain letters, numbers, dots, and underscores.');
      return;
    }
    if (!email) {
      this.triggerToast('Missing Email', 'Please enter your account email address.');
      return;
    }
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      this.triggerToast('Invalid Email', 'Please enter a valid email address (e.g. name@example.com).');
      return;
    }
    if (!password) {
      this.triggerToast('Missing Password', 'Please enter a password.');
      return;
    }
    if (password.length < 6) {
      this.triggerToast('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }
    if (this.details.userType === 'BUSINESS' && !this.details.category) {
      this.triggerToast('Missing Category', 'Please select a business category.');
      return;
    }

    this.details.email = email;
    this.details.username = username;
    this.details.name = name;
    this.isLoading = true;
    this.errorMessage = '';
    this.showToast = false;
    this.cdr.detectChanges();

    this.authService.register(this.details).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.step = 'VERIFY';
          this.successMessage = 'Verification code sent to ' + this.details.email + '. Please check your inbox.';
          this.errorMessage = '';
          this.showToast = false;
          this.cdr.detectChanges();
          setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 6000);
        } else {
          const msg = response.message || 'Registration failed.';
          this.errorMessage = msg;
          this.triggerToast('Registration Failed', msg);
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Registration error:', error);
        const msg = error.error?.message ||
          (error.status === 409
            ? 'Account or username already exists. Please choose another username or sign in.'
            : `Registration failed (Status: ${error.status}). Please try again.`);
        this.errorMessage = msg;
        this.triggerToast('Registration Failed', msg);
        this.cdr.detectChanges();
      }
    });
  }

  onVerifySubmit(verifyForm: NgForm) {
    const cleanOtp = (this.otp || '').trim();

    if (!cleanOtp) {
      this.triggerToast('Missing Code', 'Please enter the 6-digit verification code.');
      return;
    }

    if (cleanOtp.length !== 6) {
      this.triggerToast('Invalid Code Length', `Verification code must be exactly 6 digits (currently ${cleanOtp.length}).`);
      return;
    }

    if (!/^\d{6}$/.test(cleanOtp)) {
      this.triggerToast('Invalid Code Format', 'Verification code must contain digits only.');
      return;
    }

    this.isVerifying = true;
    this.errorMessage = '';
    this.showToast = false;
    this.cdr.detectChanges();

    this.authService.verifyEmail({ email: this.details.email, otp: this.otp }).subscribe({
      next: (response) => {
        this.isVerifying = false;
        if (response.success) {
          this.step = 'SUCCESS';
          this.successMessage = 'Registration successful! Redirecting to login...';
          this.errorMessage = '';
          this.showToast = false;
          this.cdr.detectChanges();
          setTimeout(() => this.router.navigate(['/login']), 2500);
        } else {
          const msg = response.message || 'Verification failed.';
          this.errorMessage = msg;
          this.triggerToast('Verification Failed', msg);
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isVerifying = false;
        console.error('Verification error:', error);
        const msg = error.error?.message || 'Invalid or expired verification code.';
        this.errorMessage = msg;
        this.triggerToast('Verification Error', msg);
        this.cdr.detectChanges();
      }
    });
  }

  resendOtp() {
    this.isResending = true;
    this.errorMessage = '';
    this.showToast = false;
    this.cdr.detectChanges();

    this.authService.resendVerification({ email: this.details.email }).subscribe({
      next: (response) => {
        this.isResending = false;
        this.errorMessage = '';
        this.successMessage = 'Verification code resent successfully!';
        this.cdr.detectChanges();
        setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 4000);
      },
      error: (error) => {
        this.isResending = false;
        console.error('Resend error:', error);
        const msg = error.error?.message || 'Failed to resend verification code.';
        this.errorMessage = msg;
        this.triggerToast('Resend Failed', msg);
        this.cdr.detectChanges();
      }
    });
  }
}

