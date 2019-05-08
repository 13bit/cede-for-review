import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {DashboardComponent} from '@app/dashboard/dashboard.component';
import {LoggedInGuard} from '@app/core';

const routes: Routes = [{
    path: '',
    canActivate: [LoggedInGuard],
    component: DashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {
}
