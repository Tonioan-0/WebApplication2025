import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/authService';
import { catchError, map, of } from 'rxjs';

export const guestGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const authService = inject(AuthService);

    return authService.checkAuth().pipe(
        map(isAuthenticated => {
            if (isAuthenticated) {
                router.navigate(['/dashboard']);
                return false;
            } else {
                return true;
            }
        }),
        catchError(() => {
            return of(true);
        })
    );
};
