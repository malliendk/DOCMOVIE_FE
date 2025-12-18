import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {FormBuilder, FormsModule} from '@angular/forms';
import {FileService} from '../../service/file.service';
import {FileSystemItem} from '../../DTO/FileSystemItem';
import {CompressionObject} from '../../DTO/CompressionObject';

@Component({
  selector: 'app-compress-bar',
  imports: [
    FormsModule
  ],
  templateUrl: './compress-form.component.html',
  standalone: true,
  styleUrl: './compress-form.component.css'
})
export class CompressFormComponent {

  @Input() targetServerPath: string = ''
  @Input() files: FileSystemItem[] = [];
  @Input() targetDirectoryPath: string = '';
  isProcessing: boolean = false;

  constructor(private fileService: FileService) {
  }

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
}
