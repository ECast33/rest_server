import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../core/auth/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `
    <div class="callback-container">
      @if (error) {
        <p class="error">{{ error }}</p>
      } @else {
        <div class="spinner"></div>
        <p>Completing sign-in…</p>
      }
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      gap: 1rem;
      color: #fff;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      font-family: sans-serif;
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(255,255,255,0.2);
      border-top-color: #e94560;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .error { color: #ff6b88; font-size: 1rem; }
  `],
})
export class AuthCallbackComponent implements OnInit {
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const expiresIn = params.get('expiresIn');
    const errorParam = params.get('error');

    if (errorParam) {
      this.error = this.mapError(errorParam);
      setTimeout(() => this.router.navigate(['/login'], {queryParams: {error: errorParam}}), 2000);
      return;
    }

    if (accessToken && refreshToken && expiresIn) {
      this.auth.handleCallback(accessToken, refreshToken, expiresIn);
    } else {
      this.router.navigate(['/login'], {queryParams: {error: 'missing_tokens'}});
    }
  }

  private mapError(code: string): string {
    const map: Record<string, string> = {
      unauthorized: 'Sign-in was denied.',
      server_error: 'A server error occurred.',
      token_error: 'Token generation failed.',
    };
    return map[code] ?? 'An unexpected error occurred.';
  }
}
