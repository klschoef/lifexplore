import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExplDialogComponent } from './expl-dialog/expl-dialog.component';
import {MatIconModule} from '@angular/material/icon';



@NgModule({
  declarations: [
    ExplDialogComponent
  ],
    imports: [
        CommonModule,
        MatIconModule
    ],
  exports: [
    ExplDialogComponent
  ]
})
export class ExplDialogsComponentsModule { }
