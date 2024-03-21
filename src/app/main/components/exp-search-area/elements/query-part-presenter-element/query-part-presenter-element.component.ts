import {Component, Input} from '@angular/core';
import {QueryPart, QueryPartType} from '../../models/query-part';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-query-part-presenter-element',
  templateUrl: './query-part-presenter-element.component.html',
  styleUrls: ['./query-part-presenter-element.component.scss']
})
export class QueryPartPresenterElementComponent {
  @Input() queryPart!: QueryPart;

  openDetailContainer$ = new BehaviorSubject<boolean>(false);

  openDetail() {
    this.openDetailContainer$.next(true);
  }
}
