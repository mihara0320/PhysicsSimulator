import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { EventShareService } from '../../services/event-share.service'

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.css'],
})
export class ControlPanelComponent implements OnInit {
  @ViewChild('group') group: any;
  option: string

  constructor(
    private eventShare: EventShareService
  ) {}

  ngOnInit() {

  }

  onOptionChange(){
    setTimeout(()=>this.eventShare.send(this.group.value), 1)
  }

}
