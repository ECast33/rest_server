import {HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse} from '@angular/common/http';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from './auth.service';
import {catchError, switchMap, throwError} from 'rxjs';
import {StatusCodes} from 'http-status-codes';

let isRefreshing = false;

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getStoredAccessToken();
  const authReq = token ? req.clone({setHeaders: {Authorization: `Bearer ${token}`}}) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isRefreshing) {
        isRefreshing = true;
        return auth.refreshAccessToken().pipe(
          switchMap(({accessToken}) => {
            isRefreshing = false;
            const retryReq = req.clone({setHeaders: {Authorization: `Bearer ${accessToken}`}});
            return next(retryReq);
          }),
          catchError(refreshError => {
            isRefreshing = false;
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
