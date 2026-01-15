import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/authService';
import { catchError, map, of } from 'rxjs';

//Verifica che l'utente sia autenticato e sia un amministratore
export const adminGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const authService = inject(AuthService);

    return authService.checkAuth().pipe(
        map(isAuthenticated => {
            if (!isAuthenticated) {
                router.navigate(['/login']);
                return false;
            }

            //Verifica se l'utente è un amministratore
            if (!authService.isAdmin()) {
                //Reindirizza gli utenti non amministratori alla home
                router.navigate(['/home']);
                return false;
            }

            return true;
        }),
        catchError(() => {
            router.navigate(['/login']);
            return of(false);
        })
    );
};
