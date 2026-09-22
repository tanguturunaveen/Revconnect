import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const token = localStorage.getItem('revconnect_token');

    if (token) {
        return true;
    }

    // Not logged in — redirect to login with session_expired reason
    return router.createUrlTree(['/login'], {
        queryParams: { reason: 'session_expired' }
    });
};
