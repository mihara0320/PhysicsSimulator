import { Component, OnInit, Input, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-pixi-view',
  templateUrl: './pixi-view.component.html',
  styleUrls: ['./pixi-view.component.css']
})
export class PixiViewComponent implements OnInit {
  app: any;
  children = []
  constructor(
    private element: ElementRef,
    private renderer: Renderer2
  ) {
    this.app = new PIXI.Application(960, 540, {backgroundColor: 0xffffff});
    this.renderer.appendChild(this.element.nativeElement, this.app.view);
    this.renderer.setStyle(this.app.view, 'position', 'absolute' )
    this.renderer.setStyle(this.app.view, 'top', 0 )
    this.renderer.setStyle(this.app.view, 'right', 0 )
    this.renderer.setStyle(this.app.view, 'left', 0 )
    this.renderer.setStyle(this.app.view, 'bottom', 0 )
    this.renderer.setStyle(this.app.view, 'margin', 'auto' )
    this.renderer.setStyle(this.app.view, 'z-index', 1 )
    this.renderer.setStyle(this.app.view, 'background-color', 'rgba(240, 21, 7, 0.93)' )
  }

  ngOnInit() {
  }

  color = {
    field: {line: 0xffffff, fill: 0x000000},
    object: {line: 0x37754e, fill: 0x8cff81},
    dynamic: {line: 0x8b0a0a, fill: 0xf43629},
    launcher: {line: '0x9ea649', fill: 0xe9f659},
    sensor: {line: 0x81396f, fill: 0xdd5ad3},
    pin: {line: 0x81396f, fill: 0x493921},
  }

  drawGraphics(schema, type){

    var graphics = new PIXI.Graphics();
    graphics.beginFill(this.color[type].fill, 1);
    graphics.lineStyle(1, this.color[type].line, 0.3);
    schema.forEach( (pos, i) => {
      if(i === 0)
        graphics.moveTo(pos.x, pos.y)
      else if(i === schema.length)
        graphics.endFill();
      else
        graphics.lineTo(pos.x, pos.y)
    })
    console.log(graphics)
    this.app.stage.addChild(graphics);
    this.children.push(graphics)
  }
  drawCircles(schema, radius){
    schema.forEach(pos => {
      let graphics = new PIXI.Graphics();
      graphics.lineStyle(0);
      graphics.beginFill(this.color.pin, 1);
      graphics.drawCircle(pos.x, pos.y, radius);
      graphics.endFill();
      this.app.stage.addChild(graphics);
      this.children.push(graphics)
    })
  }
  removeChildAt(index: number){
    this.app.stage.removeChildAt(index)
  }
  removeChildren(){
    this.app.stage.removeChildren()
  }

}
