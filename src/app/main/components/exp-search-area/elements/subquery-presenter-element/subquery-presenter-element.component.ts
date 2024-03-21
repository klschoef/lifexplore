import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Subquery} from '../../models/query-part';

@Component({
  selector: 'app-subquery-presenter-element',
  templateUrl: './subquery-presenter-element.component.html',
  styleUrls: ['./subquery-presenter-element.component.scss']
})
export class SubqueryPresenterElementComponent {
  @Input() subquery!: Subquery;

  @Output() onDelete: EventEmitter<Subquery> = new EventEmitter<Subquery>();

  clickOnDelete() {
    this.onDelete.emit(this.subquery);
  }
}
