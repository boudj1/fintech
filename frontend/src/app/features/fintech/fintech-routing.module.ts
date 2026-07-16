import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FintechDashboardComponent } from './components/dashboard/fintech-dashboard.component';
import { AccountsComponent } from './components/accounts/accounts.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { WalletComponent } from './components/wallet/wallet.component';
import { BeneficiariesComponent } from './components/beneficiaries/beneficiaries.component';
import { ProductsComponent } from './components/products/products.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: FintechDashboardComponent },
  { path: 'accounts', component: AccountsComponent },
  { path: 'transactions', component: TransactionsComponent },
  { path: 'wallet', component: WalletComponent },
  { path: 'beneficiaries', component: BeneficiariesComponent },
  { path: 'products', component: ProductsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FintechRoutingModule {}
