import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletsManagementComponent } from './wallets-management.component';

describe('WalletsManagementComponent', () => {
  let component: WalletsManagementComponent;
  let fixture: ComponentFixture<WalletsManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletsManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
