import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn, HttpResponse } from '@angular/common/http';
import { apiInterceptor } from './api.interceptor';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../environnments/environment';
import { of } from 'rxjs';

describe('apiInterceptor', () => {
  it('prefixes requests and attaches token', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: { getToken: () => 'abc' } }],
    });

    const handler: HttpHandlerFn = (req) => {
      expect(req.url).toBe(`${environment.apiUrl}/books`);
      expect(req.headers.get('Content-Type')).toBe('application/json');
      expect(req.headers.get('Authorization')).toBe('Bearer abc');
      return of(new HttpResponse({ status: 200 }));
    };

    TestBed.runInInjectionContext(() =>
      apiInterceptor(new HttpRequest('GET', 'books'), handler)
    );
  });

  it('prefixes requests without token', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: { getToken: () => null } }],
    });

    const handler: HttpHandlerFn = (req) => {
      expect(req.url).toBe(`${environment.apiUrl}/books`);
      expect(req.headers.get('Authorization')).toBeNull();
      return of(new HttpResponse({ status: 200 }));
    };

    TestBed.runInInjectionContext(() =>
      apiInterceptor(new HttpRequest('GET', 'books'), handler)
    );
  });
});
