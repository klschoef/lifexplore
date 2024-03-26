import {Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild} from '@angular/core';

@Component({
  selector: 'expl-dialog',
  templateUrl: './expl-dialog.component.html',
  styleUrls: ['./expl-dialog.component.scss']
})
export class ExplDialogComponent {
  @Input() title?: string;
  @Input() clickOncloseOnClickOutside: boolean = true;
  @Output() clickOnClose: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  @Output() clickOutside: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  @ViewChild('dialog') dialog!: ElementRef;
  firstClick = true;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.dialog.nativeElement.contains(event.target)) {
      if (this.firstClick) {
        this.firstClick = false;
        return;
      }
      this.clickOutside.emit();
      if (this.clickOncloseOnClickOutside) {
        this.clickOnClose.emit();
      }
    }
  }
}
