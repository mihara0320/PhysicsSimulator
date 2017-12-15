import * as wrapper from '../elements/wrapper';
import * as triangulate from '../elements/triangulate';
// import * as pixi from 'pixi.js'

class Engine {
  scale = 30
  config = {
    xGrav: 0,
    yGrav: 0,
    density: 0,
    friction: 0,
    restitution: 0.5,
    radius: 5
  }

  constructor(){}

  bodies = [];
  actors = [];
  gravity = new wrapper.b2Vec2(0, 10)

  world = new wrapper.b2World(this.gravity, true)
  bodyDefinition = new wrapper.b2BodyDef
  fixtureDefinition = new wrapper.b2FixtureDef



  init(fieldSchema, pinsSchema){
    this.setField(fieldSchema)
    this.setPins(pinsSchema)
  }
  updateConfig(config){
    this.config = config
    console.log(this.config)
  }
  setField(schema){
    let objects = []
    let eachRecursive = (obj) => {
      for (let k in obj) {
        if (obj[k] instanceof Array){
          let body = this.createComplexObject(obj[k])
          objects.push(body)
        } else if (typeof obj[k] == "object" && obj[k] !== null){
          eachRecursive(obj[k])
        }
      }
    }
    if(schema instanceof Array){
      let body = this.createComplexObject(schema)
      objects.push(body)
    }else{
      eachRecursive(schema);
    }
    return objects
  }
  setPins(schema){
    let pins = []
    schema.forEach(pos => {
      let pin = this.createObject({
        userData: 'pin',
        type: 'static',
        shape: 'circle',
        x: pos.x / this.scale,
        y: pos.y / this.scale,
        density: this.config.density / this.scale,
        radius: this.config.radius / this.scale,
      })
      pins.push(pin)
    })
    return pins
  }
  createObject(options){
    let builder = new wrapper.ObjectBuilder(this.world, this.bodyDefinition, this.fixtureDefinition, this.config)

    builder.setFixtureDef(options)
    builder.setBodyDef(options)

    let object: any = builder.build()
    let body = object.GetBody()

    if (options.hasOwnProperty("sprite")) {
      let option = options.sprite
      let sprite = options.sprite.src

      sprite.anchorX = option.anchor;
      sprite.anchorY = option.anchor;

      sprite.width = option.width * 30
      sprite.height = option.height * 30

      sprite.x = body.GetPosition().x * this.scale
      sprite.y = body.GetPosition().y * this.scale

      this.actors.push(sprite);
      this.bodies.push(body);
    }

    return body;
  }
  createComplexObject(schema, options: any={}) {
    let scalePoints = []
    for (let i = 0; i < schema.length; i++) {
      scalePoints.push(new wrapper.b2Vec2(schema[i].x / 30, schema[i].y / 30))
    }

    let boxShape = new wrapper.b2PolygonShape();
    let fixDef;
    let bodyDef = new wrapper.b2BodyDef();

    bodyDef.position.x = 0;
    bodyDef.position.y = 0;
    bodyDef.type = wrapper.b2Body.b2_staticBody;

    let body = this.world.CreateBody(bodyDef);
    let tmp = triangulate.process(scalePoints);

    for (let i = 0; i < tmp.length; i = i + 3) {
      boxShape = new wrapper.b2PolygonShape();
      boxShape.SetAsArray(new Array(tmp[i], tmp[i + 1], tmp[i + 2]));
      fixDef = new wrapper.b2FixtureDef();
      fixDef.userData = options.userData ? options.userData : 'NoName';
      fixDef.isSensor = options.isSensor ? options.isSensor : false;

      fixDef.density = options.density ? options.density : this.config.density;
      fixDef.restitution = options.restitution ? options.restitution : this.config.restitution;
      fixDef.friction = options.friction ? options.friction : this.config.friction;
      fixDef.shape = boxShape;
      body.CreateFixture(fixDef);
    }
    return body;
  }
  debugDraw(canvas, callback){

    let context = canvas.getContext("2d")

    let debugDraw = new wrapper.b2DebugDraw();
    debugDraw.SetSprite(context);
    debugDraw.SetDrawScale(this.scale);
    debugDraw.SetFillAlpha(0.5);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(wrapper.b2DebugDraw.e_shapeBit | wrapper.b2DebugDraw.e_jointBit);
    this.world.SetDebugDraw(debugDraw);

    function getMousePos(canvas, evt) {
      let rect = canvas.getBoundingClientRect();
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
      };
    }

    canvas.addEventListener('mousedown', function(evt) {
      let mousePos = getMousePos(canvas, evt);
      let message = 'Mouse position: x = ' + mousePos.x + ', y = ' + mousePos.y;
      // console.log(message);
    }, false);

    let updateCallback = callback ? callback : null;

    function func(){
      updateCallback && updateCallback()
      this.update()
      requestAnimationFrame(func.bind(this))
    }
    requestAnimationFrame(func.bind(this))
  }

  update(timestamp) {
    this.world.Step(1 / 60, 10, 10);
    // prevTimestamp = timestamp
    this.world.DrawDebugData();
    this.world.ClearForces();

    let n = this.actors.length;

    for (let i = 0; i < n; i++) {
      let body = this.bodies[i];
      let actor = this.actors[i];
      let position = body.GetPosition();
      actor.x = position.x * this.scale;
      actor.y = position.y * this.scale;
      // actor.rotation = body.GetAngle();
    }
    // requestAnimationFrame(update.bind(this))
  }
  start(callback){
    let updateCallback = callback ? callback : null;

    function func(){
      updateCallback && updateCallback()
      this.update()
      requestAnimationFrame(func)
    }
    requestAnimationFrame(func)
  }
  setContactListener(callback, ctx) {
    let listener = new wrapper.b2Listener;
    listener.BeginContact = contact => {
      callback(contact, ctx)
    }
    this.world.SetContactListener(listener)
  }
  distanceJointObjects(objA, objB){
    let bodyA = objA.GetBody()
    let bodyB = objB.GetBody()

    let distanceJointDef = new wrapper.b2DistanceJointDef;
    distanceJointDef.bodyA = bodyA
    distanceJointDef.bodyB = bodyB

    // distanceJointDef.length
    distanceJointDef.frequencyHz = 0
    distanceJointDef.dampingRatio = 1
    distanceJointDef.collideConnected = false

    this.world.CreateJoint(distanceJointDef)
    return distanceJointDef
  }
  destroy(body){
    if(body instanceof Array)
      body.forEach(b => this.world.DestroyBody(b))
    else
      this.world.DestroyBody(body)
  }
  destroyAll(){
    let cleaned = false
    while(!cleaned){
      let bodyList = this.world.GetBodyList()
      if(bodyList)
        this.world.DestroyBody(bodyList)
      else
        cleaned = true
    }
  }
}

export { Engine }
