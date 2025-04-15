import { Component } from '@angular/core';
import { IonTabs } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { DialogService } from '../services/dialog.service';

@Component({
  selector: 'app-tabs',
  standalone: true,
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  imports:[CommonModule, IonicModule, RouterModule],
})
export class TabsComponent {
  constructor(private dialogService: DialogService) {}

  openNew() {
    // Trigger your add book form
    // Use a service or shared event if needed
    console.log('Add button clicked');
    this.dialogService.triggerOpenDialog();
  }
}
