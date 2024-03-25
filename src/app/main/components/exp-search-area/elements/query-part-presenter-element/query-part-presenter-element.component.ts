import {Component, EventEmitter, Input, Output} from '@angular/core';
import {QueryPart, QueryPartType, Subquery} from '../../models/query-part';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-query-part-presenter-element',
  templateUrl: './query-part-presenter-element.component.html',
  styleUrls: ['./query-part-presenter-element.component.scss']
})
export class QueryPartPresenterElementComponent {
  @Input() queryPart!: QueryPart;
  @Output() onDelete: EventEmitter<QueryPart> = new EventEmitter<QueryPart>();

  openDetailContainer$ = new BehaviorSubject<boolean>(false);
  openTypeSelection$ = new BehaviorSubject<boolean>(false);

  openDetail() {
    this.openDetailContainer$.next(true);
  }

  openTypeSelection() {
    this.openTypeSelection$.next(true);
  }

  clickDelete() {
    this.onDelete.emit(this.queryPart);
  }

  deleteSubquery(subQuery: Subquery) {
    this.queryPart.subqueries = this.queryPart.subqueries?.filter(qp => qp !== subQuery);
  }

  selectQueryType(type: QueryPartType) {
    this.queryPart.query_type = type;
    this.openTypeSelection$.next(false);
  }
}
