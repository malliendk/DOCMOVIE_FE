import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ConnectionFormComponent} from './connection-form/connection-form.component';
import {FileExplorerComponent} from './file-explorer/file-explorer.component';
import {CompressFormComponent} from './compress-form/compress-form.component';
import {FileSystemItem} from '../DTO/FileSystemItem';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ConnectionFormComponent,
    FileExplorerComponent,
    CompressFormComponent
  ],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent {

  files: FileSystemItem[] = [];
  isConnectionSuccessful: boolean = false;
  directoryTypeSource: string = 'source';
  directoryTypeTarget: string = 'target';
  directorySourceHeader: string = 'Directory Source Server';
  directoryTargetHeader: string = 'Directory Target Server';

  sourceServerPath: string = "http://localhost:8080/api/files/explorer/testFiles";
  targetServerPath: string = "http://localhost:8080/api/files/explorer/testTargetFolder";

  compressionTargetPath: string = '';

  catchConnectionSuccessful(isSuccessful: boolean) {
    this.isConnectionSuccessful = isSuccessful;
  }

  setNewTargetPath(value: string) {
    this.compressionTargetPath = value;
  }

  receiveFiles(value: FileSystemItem[]) {
    console.log('expected items: ', value)
    this.files = value;
  }
}
