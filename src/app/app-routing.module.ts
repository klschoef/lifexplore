import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalendarComponent } from './calendar/calendar.component';
import { AppComponent } from './app.component';
import { QueryComponent } from './query/query.component';

const routes: Routes = [
  {path: '', redirectTo: 'query', pathMatch: 'full'}, // component: AppComponent
  {path: 'query', component: QueryComponent},
  {path: 'filesimilarity/:id/:id2', component: QueryComponent},
  {path: 'day/:id', component: CalendarComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
