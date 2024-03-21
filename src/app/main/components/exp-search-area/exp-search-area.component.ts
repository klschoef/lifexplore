import {Component, EventEmitter, Input, Output} from '@angular/core';
import {QueryPart, QueryPartType, SubqueryType} from './models/query-part';

enum ExpSearchAreaMode {
  TEXT = 'text',
  GRAPHICAL = 'graphical'
}

export interface GraphicalContentPart {
  queryParts: QueryPart[];
}

@Component({
  selector: 'exp-search-area',
  templateUrl: './exp-search-area.component.html',
  styleUrls: ['./exp-search-area.component.scss']
})
export class ExpSearchAreaComponent {
  @Input() searchValue: string = '';
  @Output() searchValueChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() onSearch: EventEmitter<string> = new EventEmitter<string>();

  mode: ExpSearchAreaMode = ExpSearchAreaMode.GRAPHICAL;
  graphical_content: GraphicalContentPart[] = [
    {
      queryParts: [
        {
          query_type: QueryPartType.objects,
          query: "car",
          subqueries: [
            {
              query_type: SubqueryType.score,
              query: "0.6 - 0.9"
            },
            {
              query_type: SubqueryType.position,
              query: "Bottom Left"
            }
          ]
        }
      ],
    }
  ]

  onSearchChange(value: string): void {
    this.searchValueChange.emit(value);
  }

  clickOnReset(): void {
    this.searchValue = "";
    this.searchValueChange.emit(this.searchValue);
  }

  protected readonly ExpSearchAreaMode = ExpSearchAreaMode;
}
