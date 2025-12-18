import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressFormComponent } from './compress-form.component';

describe('CompressBarComponent', () => {
  let component: CompressFormComponent;
  let fixture: ComponentFixture<CompressFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompressFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompressFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
