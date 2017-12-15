import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Box2dViewComponent } from './box2d-view.component';

describe('Box2dViewComponent', () => {
  let component: Box2dViewComponent;
  let fixture: ComponentFixture<Box2dViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Box2dViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Box2dViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
