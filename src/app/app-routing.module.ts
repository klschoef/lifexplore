import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalendarComponent } from './calendar/calendar.component';
import { AppComponent } from './app.component';
import { QueryComponent } from './query/query.component';
import { InfoComponent } from './info/info.component';

const routes: Routes = [
  {path: '', redirectTo: 'query', pathMatch: 'full'}, // component: AppComponent
  {path: 'query', component: QueryComponent},
  {path: 'query/:filename', component: QueryComponent},
  {path: 'query/:objects', component: QueryComponent},
  {path: 'filesimilarity/:similarto', component: QueryComponent},
  {path: 'info/:entity', component: InfoComponent},
  {path: 'day/:id', component: CalendarComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
