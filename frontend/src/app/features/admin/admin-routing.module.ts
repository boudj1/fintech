import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { UsersManagementComponent } from './components/users-management/users-management.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LogsComponent } from './components/logs/logs.component';
import { ProductsManagementComponent } from './components/products-management/products-management.component';
import { AdminGuard } from '../../core/guards/admin.guard';

const routes: Routes = [
  { path: '', redirectTo: 'analytics', pathMatch: 'full' },
  { path: 'analytics', component: AnalyticsComponent },
  { path: 'users', component: UsersManagementComponent, canActivate: [AdminGuard] },
  { path: 'settings', component: SettingsComponent },
  { path: 'logs', component: LogsComponent, canActivate: [AdminGuard] },
  { path: 'products', component: ProductsManagementComponent, canActivate: [AdminGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
