import {Component, EventEmitter, Input, Output} from '@angular/core';
import {GraphicalContentPart} from '../../exp-search-area.component';
import {BehaviorSubject} from 'rxjs';
import {QueryPart, QueryPartType, SubqueryType} from '../../models/query-part';

@Component({
  selector: 'graphical-query-element',
  templateUrl: './graphical-query-element.component.html',
  styleUrls: ['./graphical-query-element.component.scss']
})
export class GraphicalQueryElementComponent {
  @Input() graphicalContentPart!: GraphicalContentPart;
  @Input() canMoveForward: boolean = true;
  @Input() canMoveBackward: boolean = true;

  @Output() onMoveForward: EventEmitter<GraphicalContentPart> = new EventEmitter();
  @Output() onMoveBackward: EventEmitter<GraphicalContentPart> = new EventEmitter();
  @Output() onDelete: EventEmitter<GraphicalContentPart> = new EventEmitter();

  clickDelete() {
    this.onDelete.emit(this.graphicalContentPart);
  }

  clickMoveForward() {
    if (this.canMoveForward) {
      this.onMoveForward.emit(this.graphicalContentPart);
    }
  }

  clickMoveBackward() {
    if (this.canMoveBackward) {
      this.onMoveBackward.emit(this.graphicalContentPart);
    }
  }

  addQueryPart() {
    this.graphicalContentPart?.queryParts.push({
      query_type: QueryPartType.objects
    });
  }

  deleteQueryPart(queryPart: QueryPart) {
    this.graphicalContentPart.queryParts = this.graphicalContentPart?.queryParts.filter(qp => qp !== queryPart);
  }
}
