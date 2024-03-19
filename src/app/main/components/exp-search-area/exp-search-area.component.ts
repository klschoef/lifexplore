import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'exp-search-area',
  templateUrl: './exp-search-area.component.html',
  styleUrls: ['./exp-search-area.component.scss']
})
export class ExpSearchAreaComponent {
  @Input() searchValue: string = '';
  @Output() searchValueChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() onSearch: EventEmitter<string> = new EventEmitter<string>();

  onSearchChange(value: string): void {
    this.searchValueChange.emit(value);
  }

  clickOnReset(): void {
    this.searchValue = "";
    this.searchValueChange.emit(this.searchValue);
  }
}
