import {Component, Input} from '@angular/core';
import {ConversionProgressEvent} from '../../dto/ConversionProgressEvent';

@Component({
  selector: 'app-progress-bar',
  imports: [],
  templateUrl: './progress-bar.component.html',
  standalone: true,
  styleUrl: './progress-bar.component.css'
})
export class ProgressBarComponent {

  @Input() currentFile!: ConversionProgressEvent;
  @Input() totalFileCount: number = 0;
  @Input() completedFileCount: number = 0;


}
