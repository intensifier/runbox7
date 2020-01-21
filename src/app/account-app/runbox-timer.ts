// --------- BEGIN RUNBOX LICENSE ---------
// Copyright (C) 2016-2018 Runbox Solutions AS (runbox.com).
// 
// This file is part of Runbox 7.
// 
// Runbox 7 is free software: You can redistribute it and/or modify it
// under the terms of the GNU General Public License as published by the
// Free Software Foundation, either version 3 of the License, or (at your
// option) any later version.
// 
// Runbox 7 is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with Runbox 7. If not, see <https://www.gnu.org/licenses/>.
// ---------- END RUNBOX LICENSE ----------
import {
  SecurityContext,
  Component,
  Input,
  Output,
  EventEmitter,
  NgZone,
  ViewChild,
  AfterViewInit,
  ContentChild,
  ElementRef,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatExpansionModule,
  MatInputModule,
  MatListModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSnackBarModule,
  MatTableModule,
  MatTabsModule,
  MatChipsModule,
  MatDialog,
  MatPaginator,
  MatSnackBar,
  MatGridListModule,
} from '@angular/material';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RMM } from '../rmm';

@Component({
    selector: 'app-runbox-timer',
    styles: [`
    `],
    template: `
        <ng-container><span #ref><ng-content select="[custom_template]"></ng-content></span></ng-container>
        <ng-container *ngIf="ref.childNodes.length == 0">
            <span class="timeunit years" *ngIf="years">{{years}} years,</span>
            <span class="timeunit months" *ngIf="months"> {{months}} months,</span>
            <span class="timeunit days" *ngIf="days"> {{days}} days,</span>
            <span class="timeunit hours"> {{hours}} hours,</span>
            <span class="timeunit minutes"> {{minutes}} minutes, and </span>
            <span class="timeunit seconds"> {{seconds}} seconds</span>
        </ng-container>
    `
})

export class RunboxTimerComponent {
  @ContentChild('custom_template', { static: false }) custom_template: ElementRef;
  @Input() future_date: any; // yyyy-mm-dd hh:mm:ss
  @Input() css_class: any; // cool_timer_css
  @Input() child_timer: any = {years:0,months:0,days:0,hours:0,minutes:0,seconds:0};
  private dialog_ref: any;

  years: any;
  months: any;
  days: any;
  hours: any;
  minutes: any;
  seconds: any;

  has_time_left: boolean = true;
  constructor(
    public dialog: MatDialog,
    public rmm: RMM,
    public snackBar: MatSnackBar,
    public ref: ElementRef,
  ) {
  }

  ngAfterViewInit() {
  
  }

  ngOnInit() {
      this.recalculate_date();
  }

  recalculate_date () {
      var now = new Date();
      var d = this.future_date;
      var year  = d.split(' ')[0].split('-')[0];
      var month = Number(d.split(' ')[0].split('-')[1]) - 1;
      var day   = Number(d.split(' ')[0].split('-')[2]);
      var hour  = Number(d.split(' ')[1].split(':')[0]);
      var min   = Number(d.split(' ')[1].split(':')[1]);
      var sec   = Number(d.split(' ')[1].split(':')[2]);
      var sometime = new Date(year, month, day, hour, min, sec, 0);
      var total_seconds = Math.floor((sometime.getTime() - now.getTime())/1000); 
      if ( total_seconds < 0 ) { this.has_time_left = false; return ; }
      setTimeout(() => {
          this.recalculate_date();
      }, 1000)
      var secs_per_year = (365*24*60*60);
      this.years = Math.floor(total_seconds/secs_per_year);
      total_seconds -= secs_per_year * this.years;
      var secs_per_month = 30*24*60*60;
      this.months = Math.floor(total_seconds/secs_per_month);
      total_seconds -= secs_per_month * this.months;
      var secs_per_day = 24*60*60;
      this.days = Math.floor(total_seconds/secs_per_day);
      total_seconds -= secs_per_day * this.days;
      var secs_per_hour = 60*60;
      this.hours = Math.floor(total_seconds/secs_per_hour);
      total_seconds -= secs_per_hour * this.hours;
      var secs_per_minutes = 60;
      this.minutes = Math.floor(total_seconds/secs_per_minutes);
      total_seconds -= secs_per_minutes * this.minutes;
      this.seconds = total_seconds;

      ['years','months','days','hours','minutes','seconds'].forEach((t)=>{
        this.child_timer[t] = this[t];
      });

      // console.log(` ${this.years} years, ${this.months} months, ${this.days} days, ${this.hours} hours, ${this.minutes} minutes, ${this.seconds} seconds to go `)
  }
}
