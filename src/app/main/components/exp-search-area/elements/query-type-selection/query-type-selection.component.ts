import {Component, EventEmitter, Input, Output} from '@angular/core';
import {QueryPartType} from '../../models/query-part';

@Component({
  selector: 'exp-subquery-selection',
  templateUrl: './query-type-selection.component.html',
  styleUrls: ['./query-type-selection.component.scss']
})
export class QueryTypeSelectionComponent {
  @Input() query_types: QueryPartType[] = Object.values(QueryPartType)
  @Input() selectedQueryType: QueryPartType = QueryPartType.objects;

  @Output() onSelectQueryType: EventEmitter<QueryPartType> = new EventEmitter<QueryPartType>();

  clickQueryType(queryType: QueryPartType) {
    this.onSelectQueryType.emit(queryType);
  }
}
