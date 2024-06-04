import {
  Directive,
  ElementRef,
  Renderer2,
  OnInit,
  OnDestroy,
  ComponentFactoryResolver,
  ViewContainerRef,
  Input
} from '@angular/core';
import { ShortcutService } from '../services/shortcut.service';
import { Subject, takeUntil } from 'rxjs';
import {HelpOverlayComponent} from '../components/utility-components/help-overlay/help-overlay.component';

@Directive({
  selector: '[help]'
})
export class HelpDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private hasComponent = false;
  @Input('help') helpText!: string;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private shortcutService: ShortcutService,
    private resolver: ComponentFactoryResolver,
    private viewContainerRef: ViewContainerRef
  ) {
    this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
  }

  ngOnInit(): void {
    this.shortcutService.isOPressed.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isOPressed => {
      if (isOPressed && !this.hasComponent) {
        this.addHelpComponent();
      } else if (!isOPressed && this.hasComponent) {
        this.removeHelpComponent();
      }
    });
  }

  private addHelpComponent(): void {
    console.log(this.viewContainerRef);
    const componentRef = this.viewContainerRef.createComponent(HelpOverlayComponent);
    componentRef.instance.text = this.helpText;
    //this.renderer.setStyle(componentRef.location.nativeElement, 'position', 'absolute');
    this.hasComponent = true;
    const host = this.el.nativeElement;
    host.insertBefore(componentRef.location.nativeElement, host.firstChild)
  }

  private removeHelpComponent(): void {
    this.viewContainerRef.clear();
    this.hasComponent = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
