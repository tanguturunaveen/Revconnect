import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, LoginRequest } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
    credentials: LoginRequest = {
        usernameOrEmail: '',
        password: ''
    };
    showPassword = false;
    isLoading = false;
    errorMessage = '';
    sessionExpired = false;
    rememberMe = false;
    showToast = false;
    private toastTimer: any;

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        const savedUsername = localStorage.getItem('revconnect_remembered_user');
        if (savedUsername) {
            this.credentials.usernameOrEmail = savedUsername;
            this.rememberMe = true;
        }
        this.route.queryParams.subscribe(params => {
            this.sessionExpired = params['reason'] === 'session_expired';
        });
    }

    ngOnDestroy() {
        clearTimeout(this.toastTimer);
    }

    clearErrors() {
        if (this.showToast) {
            this.dismissToast();
        }
    }

    dismissToast() {
        this.showToast = false;
        this.errorMessage = '';
        clearTimeout(this.toastTimer);
        this.cdr.detectChanges();
    }

    private showErrorToast(message: string) {
        this.errorMessage = message;
        this.showToast = false;
        this.cdr.detectChanges();
        // Force re-trigger animation
        setTimeout(() => {
            this.showToast = true;
            clearTimeout(this.toastTimer);
            this.cdr.detectChanges();
            // Auto-dismiss after 5 seconds
            this.toastTimer = setTimeout(() => {
                this.showToast = false;
                this.cdr.detectChanges();
            }, 5000);
        }, 10);
    }

    onSubmit() {
        const username = (this.credentials.usernameOrEmail || '').trim();
        const password = this.credentials.password || '';

        if (!username) {
            this.showErrorToast('Please enter your username or email.');
            return;
        }

        if (!password) {
            this.showErrorToast('Please enter your password.');
            return;
        }

        this.isLoading = true;
        this.sessionExpired = false;
        this.cdr.detectChanges();

        this.authService.login({ usernameOrEmail: username, password }).subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    if (this.rememberMe) {
                        localStorage.setItem('revconnect_remembered_user', username);
                    } else {
                        localStorage.removeItem('revconnect_remembered_user');
                    }
                    this.authService.storeToken(response.data.accessToken);
                    sessionStorage.setItem('revconnect_login_time', new Date().toISOString());
                    this.router.navigate(['/feed']);
                }
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                this.isLoading = false;
                const msg = error.error?.message || error.message || 'Invalid username or password. Please try again.';
                this.showErrorToast(msg);
                this.cdr.detectChanges();
            }
        });
    }
}

