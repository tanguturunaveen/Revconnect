import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token = localStorage.getItem('revconnect_token');
    const router = inject(Router);

    const authReq = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                // Token missing, expired, or invalid — clear it and redirect to login
                localStorage.removeItem('revconnect_token');
                sessionStorage.removeItem('revconnect_login_time');
                // Only redirect if not already on auth pages
                const currentUrl = router.url;
                if (!currentUrl.includes('/login') && !currentUrl.includes('/register')) {
                    router.navigate(['/login'], {
                        queryParams: { reason: 'session_expired' }
                    });
                }
            }
            return throwError(() => error);
        })
    );
};

