import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler,
  HttpEvent, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Logout requests are fire-and-forget — never redirect on their errors.
    if (req.headers.has('X-Skip-Error-Interceptor')) {
      return next.handle(req).pipe(catchError(() => throwError(() => null)));
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Only redirect if there is actually a stored token (avoid redirect loop at /login)
          if (localStorage.getItem('accessToken')) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            this.router.navigate(['/login']);
          }
        }
        const message = error.error?.message || error.message || 'An error occurred';
        return throwError(() => new Error(message));
      })
    );
  }
}
