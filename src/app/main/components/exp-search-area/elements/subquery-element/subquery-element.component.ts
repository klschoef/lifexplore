import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Subquery} from '../../models/query-part';

@Component({
  selector: 'app-subquery-element',
  templateUrl: './subquery-element.component.html',
  styleUrls: ['./subquery-element.component.scss']
})
export class SubqueryElementComponent {
  @Input() subquery!: Subquery;

  @Output() onDelete: EventEmitter<Subquery> = new EventEmitter<Subquery>();

  clickDelete() {
    this.onDelete.emit(this.subquery);
  }
}
