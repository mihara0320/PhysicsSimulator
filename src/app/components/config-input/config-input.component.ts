import { Component, OnInit, OnChanges, HostListener } from '@angular/core';
import { EventShareService } from '../../services/event-share.service'

@Component({
  selector: 'app-config-input',
  templateUrl: './config-input.component.html',
  styleUrls: ['./config-input.component.css']
})
export class ConfigInputComponent implements OnInit {
  xGrav:number = 0;
  yGrav:number = 0;
  density:number = 0;
  friction:number = 0;
  restitution: number = 0;
  radius: number = 5;

  constructor(private eventShare: EventShareService) { }

  ngOnInit() {
  }
  onInputChange(){
    let config = {
      xGrav: this.xGrav,
      yGrav: this.yGrav,
      density: this.density,
      friction: this.friction,
      restitution: this.restitution,
      radius: this.radius,
    }
    this.eventShare.send(config)
  }
  changeBG(data){
    console.log(data)
  }
}
