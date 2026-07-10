import {Injectable, signal, computed} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {Observable, tap, catchError, throwError, from} from 'rxjs';
import {AuthState, TokenResponse, UserProfile} from '../models/auth.model';
import {environment} from '../../../environments/environment';

const ACCESS_TOKEN_KEY = 'imitate_access_token';
const REFRESH_TOKEN_KEY = 'imitate_refresh_token';
const ID_TOKEN_KEY = 'imitate_id_token';

@Injectable({providedIn: 'root'})
export class AuthService {

  private _state = signal<AuthState>({
    isLoggedIn: false,
    userProfile: null,
    accessToken: this.getStoredAccessToken(),
    refreshToken: this.getStoredRefreshToken(),
  });

  readonly isLoggedIn = computed(() => this._state().isLoggedIn);
  readonly userProfile = computed(() => this._state().userProfile);
  readonly accessToken = computed(() => this._state().accessToken);

  constructor(private http: HttpClient, private router: Router) {
    // Restore session from stored token on startup
    if (this.getStoredAccessToken()) {
      this.fetchProfile().subscribe({
        error: () => this.clearTokens(),
      });
    }
  }

  /** Redirects the browser to the backend SSO initiation endpoint */
  initiateSSO(): void {
    window.location.href = `${environment.apiBase}auth/sso`;
  }

  /**
   * Called by the auth-callback page after the backend redirects back with tokens
   * in the query string. idToken is optional — only SSO logins receive one, and it's
   * only needed later to perform a true RP-initiated logout with Keycloak.
   */
  handleCallback(accessToken: string, refreshToken: string, expiresIn: string, idToken?: string): void {
    this.storeTokens(accessToken, refreshToken, idToken);
    this._state.update(s => ({...s, accessToken, refreshToken}));
    this.fetchProfile().subscribe({
      next: () => this.router.navigate(['/home']),
      error: () => {
        this.clearTokens();
        this.router.navigate(['/login'], {queryParams: {error: 'profile_failed'}});
      },
    });
  }

  /** Fetches the current user profile from the API using the stored JWT */
  fetchProfile(): Observable<{isLoggedIn: boolean; userProfile: UserProfile}> {
    return this.http.get<{isLoggedIn: boolean; userProfile: UserProfile}>(`${environment.apiBase}isLoggedIn`).pipe(
      tap(response => {
        this._state.update(s => ({
          ...s,
          isLoggedIn: response.isLoggedIn,
          userProfile: response.userProfile ?? null,
        }));
      })
    );
  }

  /** Exchanges the refresh token for a new access token */
  refreshAccessToken(): Observable<{accessToken: string; expiresIn: string}> {
    const refreshToken = this.getStoredRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }
    return this.http.post<{accessToken: string; expiresIn: string}>(
      `${environment.apiBase}auth/refresh`,
      {refreshToken}
    ).pipe(
      tap(({accessToken}) => {
        sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        this._state.update(s => ({...s, accessToken}));
      })
    );
  }

  logout(): void {
    const idToken = sessionStorage.getItem(ID_TOKEN_KEY);
    const params: Record<string, string> = idToken ? {idToken} : {};
    this.http.get<{ssoLogoutUrl?: string}>(`${environment.apiBase}logout`, {params}).subscribe({
      next: (response) => this.finishLogout(response?.ssoLogoutUrl),
      error: () => this.finishLogout(),
    });
  }

  /**
   * Completes logout. If the backend returned a Keycloak end-session URL (only
   * happens for SSO logins that supplied their id_token), navigate the browser
   * there so Keycloak's own SSO session cookie is actually terminated — otherwise
   * "Sign in" would still reflect a live IdP session. Keycloak redirects back to
   * OIDC_POST_LOGOUT_REDIRECT_URL (the app's /login route) once done.
   */
  private finishLogout(ssoLogoutUrl?: string): void {
    this.clearTokens();
    if (ssoLogoutUrl) {
      window.location.href = ssoLogoutUrl;
    } else {
      this.router.navigate(['/login']);
    }
  }

  getStoredAccessToken(): string | null {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  }

  private getStoredRefreshToken(): string | null {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  }

  private storeTokens(accessToken: string, refreshToken: string, idToken?: string): void {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    if (idToken) {
      sessionStorage.setItem(ID_TOKEN_KEY, idToken);
    }
  }

  private clearTokens(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(ID_TOKEN_KEY);
    this._state.set({isLoggedIn: false, userProfile: null, accessToken: null, refreshToken: null});
  }
}
