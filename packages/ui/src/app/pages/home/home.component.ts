import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../core/auth/auth.service';
import {UserProfile} from '../../core/models/auth.model';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="home-container">
      <header>
        <div class="logo">AUTH-APP</div>
        <button class="logout-btn" (click)="logout()">Sign Out</button>
      </header>

      <main>
        @if (user(); as profile) {
          <div class="welcome-card">
            <div class="avatar">{{ initials(profile) }}</div>
            <div class="user-info">
              <h1>Welcome back, {{ profile.first_name }}!</h1>
              <p class="email">{{ profile.email }}</p>
              <span class="badge">{{ accessLevelLabel(profile.access_level) }}</span>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-label">Total Logins</span>
              <span class="stat-value">{{ profile.logins }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Organization</span>
              <span class="stat-value">{{ profile.organization_id }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Job Title</span>
              <span class="stat-value">{{ profile.job_title || '—' }}</span>
            </div>
          </div>
        } @else {
          <p class="loading">Loading profile…</p>
        }
      </main>
    </div>
  `,
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly user = this.auth.userProfile;

  logout(): void {
    this.auth.logout();
  }

  initials(profile: UserProfile): string {
    return `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase();
  }

  accessLevelLabel(level: number): string {
    const labels: Record<number, string> = {0: 'Root', 2: 'Admin', 4: 'Supervisor', 6: 'Observer', 8: 'Instructor'};
    return labels[level] ?? `Level ${level}`;
  }
}
