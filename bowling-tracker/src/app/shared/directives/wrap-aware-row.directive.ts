import { AfterViewInit, Directive, ElementRef, OnDestroy, inject } from '@angular/core';

/**
 * Toggles `.wrapped` on the host once its flex children genuinely no longer
 * fit on one line — replaces guessing a width breakpoint, which can never
 * match every row (e.g. `.ball-compare__row`, where the ball's name length
 * varies per row and the same card width can wrap one row but not another).
 *
 * Compares the sum of the children's own natural widths (+ gaps) against
 * the row's available width, rather than reading back `offsetTop` — line
 * position gets thrown off by `align-items: center` whenever two children
 * have different heights (common here: the name is one line, the figures
 * block is taller), so two same-line children can end up with different
 * `offsetTop`s and look "wrapped" even when they aren't, and that false
 * read never correct itself on a later resize. Width comparison has no such
 * ambiguity. (For this to stay accurate, no rule may stretch a child's
 * width in the `.wrapped` state — that would feed back into this same
 * measurement and get permanently stuck.)
 */
@Directive({
  selector: '[appWrapAwareRow]',
})
export class WrapAwareRow implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private ro?: ResizeObserver;

  ngAfterViewInit(): void {
    this.check();
    this.ro = new ResizeObserver(() => this.check());
    this.ro.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.ro?.disconnect();
  }

  private check(): void {
    const node = this.el.nativeElement;
    const children = Array.from(node.children).filter((c): c is HTMLElement => c instanceof HTMLElement);
    if (children.length < 2) return;
    const gap = parseFloat(getComputedStyle(node).columnGap) || 0;
    const childrenWidth =
      children.reduce((sum, c) => sum + c.getBoundingClientRect().width, 0) + gap * (children.length - 1);
    const wrapped = childrenWidth > node.clientWidth + 1;
    node.classList.toggle('wrapped', wrapped);
  }
}
