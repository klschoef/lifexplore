import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Renderer2, SimpleChanges
} from '@angular/core';

@Component({
  selector: 'exp-subquery-selection',
  templateUrl: './subquery-selection.component.html',
  styleUrls: ['./subquery-selection.component.scss']
})
export class SubquerySelectionComponent {
  @Input() query_types: string[] = [
    "object",
    "scene",
    "clip",
    "text"
  ]

  @Output() onSelectQueryType: EventEmitter<string> = new EventEmitter<string>();

  clickQueryType(queryType: string) {
    this.onSelectQueryType.emit(queryType);
  }
}
