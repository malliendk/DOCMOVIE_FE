import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {FormBuilder, FormsModule} from '@angular/forms';
import {FileService} from '../../service/file.service';
import {FileSystemItem} from '../../dto/FileSystemItem';
import {CompressionObject} from '../../dto/CompressionObject';
import {ProgressBarComponent} from '../progress-bar/progress-bar.component';
import {ConversionProgressEvent} from '../../dto/ConversionProgressEvent';
import {Subscription} from 'rxjs';
import {ConversionProgressService} from '../../service/conversion-progress.service';

@Component({
  selector: 'app-compress-bar',
  imports: [
    FormsModule,
  ],
  templateUrl: './compress-form.component.html',
  standalone: true,
  styleUrl: './compress-form.component.css'
})
export class CompressFormComponent {

  progressEvents: ConversionProgressEvent[] = [];
  currentProgressEvent!: ConversionProgressEvent;
  private subscription?: Subscription;

  @Input() targetServerPath: string = ''
  @Input() files: FileSystemItem[] = [];
  @Input() targetDirectoryPath: string = '';
  isProcessing: boolean = false;
  completedFilesCount: number = 0;

  constructor(private fileService: FileService,
              private conversionProgressService: ConversionProgressService) {
  }

  // ngOnInit(): void {
  //   this.subscription = this.conversionProgressService.subscribeToProgress()
  //     .subscribe({
  //       next: (event: ConversionProgressEvent) => {
  //         console.log('Progress event received:', event);
  //         this.progressEvents.push(event);
  //         this.processIncomingEvent(event);
  //       },
  //       error: (error) => {
  //         console.error('Error receiving progress:', error);
  //       }
  //     });
  // }

  compress() {
    console.log("starting conversion");
    const compressionObject: CompressionObject = { files: this.files, targetDirectoryPath: this.targetDirectoryPath };
    console.log('object being sent: ', compressionObject);
    this.fileService.compressAndSaveFiles(compressionObject)
      .subscribe({
        next: (response) => {
          this.isProcessing = false;
          console.log('Compression complete', response);
          this.fileService.retrieveAllFiles(this.targetServerPath);
        },
        error: (error) => {
          this.isProcessing = false;
          console.error('Compression failed', error);
        }
      });
  }

  processIncomingEvent(event: ConversionProgressEvent) {
    this.completedFilesCount = this.progressEvents.length;
    this.currentProgressEvent = event;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
