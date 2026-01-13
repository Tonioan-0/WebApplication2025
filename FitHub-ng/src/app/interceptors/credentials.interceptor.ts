import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {

  const isExternalApi = req.url.includes('openfoodfacts.org');

  //Si applica withCredentials solo se non è una API esterna
  if (!isExternalApi) {
    const modifiedReq = req.clone({
      withCredentials: true
    });
    return next(modifiedReq);
  }

  //Per le chiamate esterne (OpenFoodFacts), viene passata la richiesta pulita
  return next(req);
};
