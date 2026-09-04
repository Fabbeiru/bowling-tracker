import { Component } from '@angular/core';
import { PlaceholderScreen } from '../../shared/components/placeholder-screen/placeholder-screen';

@Component({
  selector: 'app-games',
  imports: [PlaceholderScreen],
  template: `<app-placeholder-screen scope="games" />`,
})
export class Games {}
