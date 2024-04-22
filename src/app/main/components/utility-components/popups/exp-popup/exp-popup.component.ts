import {Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, Renderer2, SimpleChanges} from '@angular/core';
import {BehaviorSubject, Subject, switchMap, tap} from 'rxjs';

@Component({
  selector: 'exp-popup',
  templateUrl: './exp-popup.component.html',
  styleUrls: ['./exp-popup.component.scss']
})
export class ExpPopupComponent implements OnDestroy, OnChanges {
  @Input() open$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  refresh$ = new BehaviorSubject<any>(1);
  processedOpen$ = this.refresh$.pipe(
    switchMap(() => this.open$),
    tap((isOpen: boolean) => {
      if (isOpen && !this.unsubscribeClickHandler) {
        console.log("add click handler", isOpen);
        this.unsubscribeClickHandler = this.renderer.listen('window', 'click', (event: Event) => {
          if (!this.elementRef.nativeElement.contains(event.target)) {
            if (this.skipFirst) {
              this.skipFirst = false;
              return;
            }
            console.log("close because of click outside");
            this.open$.next(false);
          }
        });
      } else {
        if (isOpen) {
          return;
        }

        if (this.unsubscribeClickHandler) {
          this.unsubscribeClickHandler();
        }
        this.unsubscribeClickHandler = undefined;
        this.skipFirst = true;
      }
    })
  );

  unsubscribeClickHandler?: Function;
  skipFirst = true;

  constructor(
    private renderer: Renderer2,
    private elementRef: ElementRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes["open$"]) {
      this.refresh$.next(1);
    }
  }

  ngOnDestroy() {
    if (this.unsubscribeClickHandler) {
      this.unsubscribeClickHandler();
    }
  }
}
