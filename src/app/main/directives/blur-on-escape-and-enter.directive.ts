import {Directive, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {combineLatest, Subscription} from 'rxjs';
import {ShortcutService} from '../services/shortcut.service';

@Directive({
  selector: 'input'
})
export class BlurOnEscapeAndEnterDirective implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  constructor(private el: ElementRef<HTMLInputElement>, private shortcutService: ShortcutService) {}

  ngOnInit(): void {
    this.subscriptions.add(this.shortcutService.isEscapePressed.subscribe(isPressed => {
      if (isPressed && this.isElementFocused()) {
        this.el.nativeElement.blur();
      }
    }));

    this.subscriptions.add(combineLatest(this.shortcutService.isEnterPressed, this.shortcutService.isLockedEnterPressed).subscribe(isPressed => {
      if (isPressed && this.isElementFocused()) {
        this.el.nativeElement.blur();
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private isElementFocused(): boolean {
    return this.el.nativeElement === document.activeElement;
  }
}
