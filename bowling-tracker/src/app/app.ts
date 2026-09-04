import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNav } from './shared/components/bottom-nav/bottom-nav';
import { ToastHost } from './shared/components/toast/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BottomNav, ToastHost],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
