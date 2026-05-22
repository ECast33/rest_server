import {Component} from '@angular/core';
import {AuthService} from '../../core/auth/auth.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-logo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
          </svg>
        </div>
        <h1>Sign In</h1>
        <p class="subtitle">Use your organisation's Single Sign-On to continue</p>

        @if (errorMessage) {
          <div class="error-banner">{{ errorMessage }}</div>
        }

        <button class="sso-btn" (click)="loginWithSSO()">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          Continue with SSO
        </button>
      </div>
    </div>
  `,
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  errorMessage = '';

  constructor(private auth: AuthService, private route: ActivatedRoute) {
    this.route.queryParamMap.subscribe(params => {
      const error = params.get('error');
      if (error === 'unauthorized') this.errorMessage = 'Sign-in was denied or cancelled.';
      else if (error === 'token_error') this.errorMessage = 'Failed to complete sign-in. Please try again.';
      else if (error === 'profile_failed') this.errorMessage = 'Could not load your profile. Please sign in again.';
      else if (error) this.errorMessage = 'An unexpected error occurred.';
    });
  }

  loginWithSSO(): void {
    this.auth.initiateSSO();
  }
}
