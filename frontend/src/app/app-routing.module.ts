import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AppShellComponent } from './layout/shell/app-shell.component';

const routes: Routes = [
  // Public route — no guard, no shell
  {
    path: 'login',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },

  // Protected routes — guarded by AuthGuard, rendered inside AppShellComponent
  {
    path: '',
    component: AppShellComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'fintech/dashboard', pathMatch: 'full' },
      {
        path: 'chatbot',
        loadChildren: () => import('./features/chatbot/chatbot.module').then(m => m.ChatbotModule)
      },
      {
        path: 'fintech',
        loadChildren: () => import('./features/fintech/fintech.module').then(m => m.FintechModule)
      },
      {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
      }
    ]
  },

  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
