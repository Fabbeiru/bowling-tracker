import { Component } from '@angular/core';
import { PlaceholderScreen } from '../../shared/components/placeholder-screen/placeholder-screen';

@Component({
  selector: 'app-settings',
  imports: [PlaceholderScreen],
  template: `<app-placeholder-screen scope="settings" />`,
})
export class Settings {}
