import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalendarComponent } from './main/components/calendar/calendar.component';
import { AppComponent } from './app.component';
import { QueryComponent } from './main/components/query/query.component';
import { InfoComponent } from './main/components/info/info.component';
import {SearchComponent} from './main/components/search/search.component';

const routes: Routes = [
  {path: '', redirectTo: 'search', pathMatch: 'full'}, // component: AppComponent
  {path: 'query', component: QueryComponent},
  {path: 'search', component: SearchComponent},
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
