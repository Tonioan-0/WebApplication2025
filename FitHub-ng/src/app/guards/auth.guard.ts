import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/authService';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const authService = inject(AuthService);

    // We can verify validation via backend or check cookie presence directly if simple
    // Since HttpOnly cookie is invisible to JS, we MUST ping backend 
    // OR rely on a secondary non-httponly flag cookie (less secure)
    // OR just assume if user tries to access, the backend call for data will fail (401) and then redirect.
    // BUT the user wants auto-redirect if logged in, so we need a check.

    // Here we assume we added a checkAuth method to AuthService that calls the backend.
    return authService.checkAuth().pipe(
        map(isAuthenticated => {
            if (isAuthenticated) {
                return true;
            } else {
                router.navigate(['/login']);
                return false;
            }
        }),
        catchError(() => {
            router.navigate(['/login']);
            return of(false);
        })
    );
};
