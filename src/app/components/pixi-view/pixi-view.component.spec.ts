import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PixiViewComponent } from './pixi-view.component';

describe('PixiViewComponent', () => {
  let component: PixiViewComponent;
  let fixture: ComponentFixture<PixiViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PixiViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PixiViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
