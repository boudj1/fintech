import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-knowledge-base',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="content-wrapper">
      <div class="page-header"><h1>Knowledge Base</h1></div>
      @if (loading) {
        <div style="text-align:center;padding:48px"><mat-spinner></mat-spinner></div>
      } @else {
        <div class="articles-grid">
          @for (article of articles; track article.id) {
            <mat-card class="article-card">
              <mat-card-header>
                <mat-card-title>{{article.title}}</mat-card-title>
                <mat-card-subtitle>{{article.category}} | {{article.createdAt | date:'mediumDate'}}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p>{{article.content | slice:0:150}}...</p>
              </mat-card-content>
              <mat-card-actions>
                <mat-chip [class]="article.status.toLowerCase()">{{article.status}}</mat-chip>
                @if (article.featured) { <mat-icon color="warn">star</mat-icon> }
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .articles-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:16px; }
    .article-card { height: 200px; }
    mat-chip.draft { background:#fff3e0; color:#e65100; }
    mat-chip.published { background:#e8f5e9; color:#2e7d32; }
    mat-chip.archived { background:#f5f5f5; color:#757575; }
  `]
})
export class KnowledgeBaseComponent implements OnInit {
  articles: any[] = [];
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/knowledge`, { params: { size: 20 } }).subscribe({
      next: res => { this.articles = res.content || res; this.loading = false; },
      error: () => this.loading = false
    });
  }
}
