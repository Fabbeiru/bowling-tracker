import { AfterViewInit, Directive, ElementRef, HostListener, inject } from '@angular/core';

/**
 * Lets a plain mouse wheel scroll a horizontally-scrolling strip (filter
 * chips, …). Touch swipes and a trackpad's native horizontal scroll already
 * move it — only a mouse's vertical-only wheel needs the assist, which is
 * why this only steps in when the gesture is dominantly vertical.
 *
 * Also toggles the `.at-scroll-end` class the strip's CSS uses to hide its
 * "there's more, scroll →" fade once there's genuinely nothing left to
 * scroll to (whether because the user reached the end, or because
 * everything already fit and it never needed to scroll at all) — without
 * this, the fade sits over the last item forever, permanently looking like
 * something is cut off even when it isn't.
 */
@Directive({
  selector: '[appHorizontalWheelScroll]',
})
export class HorizontalWheelScroll implements AfterViewInit {
  private readonly el = inject(ElementRef<HTMLElement>);

  @HostListener('wheel', ['$event'])
  onWheel(e: WheelEvent): void {
    const node = this.el.nativeElement;
    if (node.scrollWidth <= node.clientWidth) return;
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    e.preventDefault();
    node.scrollLeft += e.deltaY;
    this.updateFade();
  }

  @HostListener('scroll')
  onScroll(): void {
    this.updateFade();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateFade();
  }

  ngAfterViewInit(): void {
    this.updateFade();
  }

  private updateFade(): void {
    const node = this.el.nativeElement;
    const atEnd = node.scrollLeft + node.clientWidth >= node.scrollWidth - 1;
    node.classList.toggle('at-scroll-end', atEnd);
  }
}
