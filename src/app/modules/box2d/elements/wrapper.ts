import * as Box2D from 'box2dweb'

const b2Vec2 = Box2D.Common.Math.b2Vec2,
  b2AABB = Box2D.Collision.b2AABB,
  b2BodyDef = Box2D.Dynamics.b2BodyDef,
  b2Body = Box2D.Dynamics.b2Body,
  b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
  b2Fixture = Box2D.Dynamics.b2Fixture,
  b2World = Box2D.Dynamics.b2World,
  b2MassData = Box2D.Collision.Shapes.b2MassData,
  b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
  b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
  b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
  b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef,
  b2JointDef = Box2D.Dynamics.Joints.b2JointDef,
  b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef,
  b2Listener = Box2D.Dynamics.b2ContactListener;

class ObjectBuilder {
  config: any;
  world: any;
  fixtureDefinition: any;
  bodyDefinition: any;

  constructor(worldDef, bodyDef, fixtureDef, config) {
    this.config = config
    this.world = worldDef;
    this.bodyDefinition = bodyDef;
    this.fixtureDefinition = fixtureDef;
  }

  bodyType: any = {
    dynamic: b2Body.b2_dynamicBody,
    static: b2Body.b2_staticBody
  };

  shapeMap: any = {
    polygon: () => new b2PolygonShape,
    circle: () => new b2CircleShape(0.6),
  };

  setFixtureDef(options) {
    this.fixtureDefinition.userData = options.userData ? options.userData : null;
    this.fixtureDefinition.density = options.density || this.config.density
    this.fixtureDefinition.friction = options.friction || this.config.friction
    this.fixtureDefinition.restitution = options.restitution || this.config.restitution
    this.fixtureDefinition.shape = options.shape ? new this.shapeMap[options.shape]() : new b2PolygonShape

    if (options.shape == 'polygon')
      this.fixtureDefinition.shape.SetAsBox(options.width, options.height);
    if (options.shape == 'circle')
      this.fixtureDefinition.shape.SetRadius(options.radius || this.config.radius / 30);
  };
  setBodyDef(options) {
    this.bodyDefinition.type = options.type ? this.bodyType[options.type] : this.bodyType.dynamic
    this.bodyDefinition.position.Set(options.x, options.y);
  };
  build() {
    return this.world.CreateBody(this.bodyDefinition).CreateFixture(this.fixtureDefinition);
  };
}

export {
  b2Vec2, b2AABB, b2BodyDef, b2Body, b2FixtureDef, b2Fixture, b2World, b2JointDef, b2DistanceJointDef,
  b2MassData, b2PolygonShape, b2CircleShape, b2DebugDraw, b2MouseJointDef, b2Listener, ObjectBuilder
}
