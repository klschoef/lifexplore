import { Directive, ElementRef, Renderer2, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: 'img'
})
export class LazyImgDirective implements OnInit, OnDestroy {
  private loadingSpinner!: HTMLElement;

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.addLoadingSpinner();

    const supportsLazyLoading = 'loading' in HTMLImageElement.prototype;
    if (supportsLazyLoading) {
      this.renderer.setAttribute(this.el.nativeElement, 'loading', 'lazy');
    }

    // Listening to load and error events to remove spinner
    this.renderer.listen(this.el.nativeElement, 'load', this.onLoad.bind(this));
    this.renderer.listen(this.el.nativeElement, 'error', this.onLoad.bind(this));  // using same handler for error for simplicity
  }

  private addLoadingSpinner(): void {
    // Create spinner element
    this.loadingSpinner = this.renderer.createElement('div');
    this.renderer.addClass(this.loadingSpinner, 'loading-spinner');  // Use CSS to style this

    // Insert spinner as a sibling to the image
    this.renderer.insertBefore(this.el.nativeElement.parentNode, this.loadingSpinner, this.el.nativeElement);
  }

  private onLoad(): void {
    // Remove spinner once image is loaded or on error
    if (this.loadingSpinner) {
      this.renderer.removeChild(this.el.nativeElement.parentNode, this.loadingSpinner);
    }
  }

  ngOnDestroy(): void {
  }
}
