import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
    // Add withCredentials to all requests to include session cookies
    const modifiedReq = req.clone({
        withCredentials: true
    });
    return next(modifiedReq);
};
