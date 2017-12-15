import { Component, OnInit, OnChanges, ViewChild, Input, ElementRef, Renderer2, SimpleChanges, Inject, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { PixiViewComponent } from '../pixi-view/pixi-view.component'
import { ConfigInputComponent } from '../config-input/config-input.component'
import { EventShareService } from '../../services/event-share.service'
import { Engine } from '../../modules/box2d'

function getMousePos(canvas, evt) {
  let rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

@Component({
  selector: 'app-box2d-view',
  templateUrl: './box2d-view.component.html',
  styleUrls: ['./box2d-view.component.css']
})
export class Box2dViewComponent implements OnInit {
  @Input('pixiView') pixiView: PixiViewComponent;
  @Input('configInput') configInput: ConfigInputComponent;
  @ViewChild('physics_canvas') p_canvasRef: ElementRef;

  p_canvas: any;

  config: object;

  i: number = 0
  u: number = 1
  bodies = []
  sensors = []
  map = {}
  schema = []
  pointers = []

  scale = 30
  radius: number = 5;
  engine = new Engine()

  totalLaunch: number = 0
  totalContact: number = 0
  currentPossibility: number = 0

  currentMousePos: any = {
    x: 0,
    y: 0
  }

  constructor(
    private dialog: MatDialog,
    private element: ElementRef,
    private eventShare: EventShareService
  ) {}

  previousOption: string;

  ngOnChanges(changes: SimpleChanges) {}
  ngDoCheck() {}
  ngOnInit() {

    this.p_canvas = this.p_canvasRef.nativeElement


    this.engine.debugDraw(this.p_canvas, null)
    this.engine.setContactListener(this.onContact, this)
    this.p_canvas.addEventListener('mousemove', this.onMousemove.bind(this), false)
    this.p_canvas.addEventListener('mousedown', this.onMousedown.bind(this), false)

    this.eventShare.recieve().subscribe(data => {
      if(data.event instanceof Object){
        let newConfig = data.event

        Object.keys(newConfig).forEach((key) => {
          if(key === 'radius'){
            newConfig[key] = parseInt(newConfig[key])
            this.radius = newConfig[key]
          } else newConfig[key] = parseInt(newConfig[key])
        })
        this.engine.updateConfig(newConfig)
      } else {
        this.handleControlEvent(data.event)
      }
    })
  }
  handleControlEvent(option) {
    if (option === 'Field')
      this.previousOption = 'Field'
    if (option === 'Object')
      this.previousOption = 'Object'
    if (option === 'Pin')
      this.previousOption = 'Pin'
    if (option === 'Launcher')
      this.previousOption = 'Launcher'
    if (option === 'Sensor')
      this.previousOption = 'Sensor'
    if (option === 'Draw')
      this.onDraw(this.previousOption);
    if (option === 'Simulate')
      this.onSimulate();
    if (option === 'Undo')
      this.onUndo();
    if (option === 'DeleteAll')
      this.onDeleteAll();
    if (option === 'Save')
      this.onSave();
  }
  onMousemove(evt) {
    let mousePos = getMousePos(this.p_canvas, evt);
    this.currentMousePos = {
      x: Number((mousePos.x).toFixed(0)),
      y: Number((mousePos.y).toFixed(0)),
    }
  }
  onMousedown(evt) {
    let mousePos = getMousePos(this.p_canvas, evt);
    let marker = this.engine.createObject({
      userData: 'marker',
      type: 'static',
      shape: 'circle',
      x: Number((mousePos.x).toFixed(0)) / this.scale,
      y: Number((mousePos.y).toFixed(0)) / this.scale,
    })
    this.schema.push({ x: Number((mousePos.x).toFixed(0)), y: Number((mousePos.y).toFixed(0)) })
    this.pointers.push(marker)
  }
  onDraw(option): void {
    if (this.schema.length <= 0) { return }
    if (option === 'Field') {
      this.schema[0] = { x: 0, y: 0 }
      this.schema[1] = { x: 0, y: this.p_canvas.height }
      this.schema.push({ x: this.p_canvas.width, y: this.p_canvas.height })
      this.schema.push({ x: this.p_canvas.width, y: 0 })
      this.map[this.i] = this.schema
      this.i++
      let field = this.engine.setField(this.schema)
      this.bodies.push(field)
      this.pixiView.drawGraphics(this.schema, 'field')
    }
    if (option === 'Object') {
      this.map[this.i] = this.schema
      this.i++
      let object = this.engine.createComplexObject(this.schema, {userData: 'object'})
      this.bodies.push(object)
      this.pixiView.drawGraphics(this.schema, 'object')
    }
    if (option === 'Pin') {
      this.map[this.i] = this.schema
      this.i++
      let pins = this.engine.setPins(this.schema)
      this.bodies.push(pins)
      this.pixiView.drawCircles(this.schema, (this.radius || 5))
    }
    if (option === 'Launcher') {
      this.map[this.i] = this.schema
      this.i++
      let launcher = this.engine.createComplexObject(this.schema, {userData: 'launcher'})
      this.bodies.push(launcher)
      this.pixiView.drawGraphics(this.schema, 'launcher')
    }
    if (option === 'Sensor') {
      this.map[this.i] = this.schema
      this.i++
      let sensor = this.engine.createComplexObject(this.schema, {userData: 'sensor', isSensor: true})

      this.sensors.push(sensor)
      this.bodies.push(sensor)
      this.pixiView.drawGraphics(this.schema, 'sensor')
    }
    this.pointers.forEach(p => this.engine.destroy(p))
    this.pointers = []
    this.schema = []
  }
  onUndo() {
    if(this.bodies.length <= 0) { return }

    if(this.previousOption === 'Undo')
      this.u++
    else
      this.u = 1

    let indexToDelete = this.i - this.u
    let lastObject = this.bodies[indexToDelete]
    if(lastObject instanceof Array)
      lastObject.forEach( body => this.engine.destroy(body))
    this.engine.destroy(lastObject)
    this.bodies.splice(this.i - this.u, 1);
    this.pixiView.removeChildAt(indexToDelete)
    this.previousOption = 'Undo'
  }
  onDeleteAll(): void {
    this.map = {}
    this.schema = []
    this.pointers = []
    this.engine.destroyAll()
    this.pixiView.removeChildren()
  }
  onSimulate(): void {
    this.totalLaunch = 0
    this.totalContact = 0
    this.currentPossibility = 0
    this.openSimulateDialog()
  }
  private subject = new Subject<any>();
  openSimulateDialog(): void {
    setTimeout(() => {

      let dialogRef = this.dialog.open(SimulateDialogComponent, {
        height: '50vh',
        width: '50vw',
        data: {
          closeCb: () => {
            this.dialog.closeAll()
          },
          simulateBalls: (x, y, amount, interval) => {
            this.simulateBalls(x, y, amount, interval)
          }
        }
      });
    }, 1)
  }
  onSave(): void {
    this.openSaveDialog()
  }
  openSaveDialog(): void {
    setTimeout(() => {
      let dialogRef = this.dialog.open(SaveDialogComponent, {
        height: '50vh',
        width: '50vw',
        data: {
          map: this.map
        }
      });
    }, 1)
  }
  simulateBalls(x, y, amount, interval){
    this.totalLaunch = amount
    for(let i = 0; i < amount; i ++){
      (function(ctx, d){
        setTimeout( () => {
          ctx.engine.createObject({
                userData: 'ball',
                type: 'dynamic',
                shape: 'circle',
                x: x / ctx.scale,
                y: y / ctx.scale,
              })
        }, d*i)
      })(this, interval)
    }
  }
  onContact(contact, ctx){

    let A = contact.GetFixtureA().GetUserData()
    let B = contact.GetFixtureB().GetUserData()
    if( (A === 'ball' && B === 'sensor') || (B === 'ball' && A === 'sensor')){
      ctx.totalContact ++
      ctx.currentPossibility = ctx.totalLaunch / ctx.totalContact
    }
  }
}

@Component({
  selector: 'app-simulate-dialog',
  templateUrl: './simulate-dialog.html',
})
export class SimulateDialogComponent {
  constructor( @Inject(MAT_DIALOG_DATA) public data: any) { }
  xCordinate: number;
  yCordinate: number;
  amount: number;
  interval: number;

  startSimulation(){
    this.data.closeCb()
    setTimeout(this.data.simulateBalls(this.xCordinate, this.yCordinate, this.amount, this.interval), 3000)
  }
}

@Component({
  selector: 'app-save-dialog',
  templateUrl: './save-dialog.html',
})
export class SaveDialogComponent {
  constructor( @Inject(MAT_DIALOG_DATA) public data: any) {}

  printMap() {
    return JSON.stringify(this.data)
  }
}
