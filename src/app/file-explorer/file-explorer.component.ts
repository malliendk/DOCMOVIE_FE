import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FileSystemItem} from '../../DTO/FileSystemItem';
import {FileService} from '../../service/file.service';
import {CommonModule, NgClass} from '@angular/common';

@Component({
  selector: 'app-file-explorer',
  imports: [
    NgClass,
    CommonModule
  ],
  templateUrl: './file-explorer.component.html',
  standalone: true,
  styleUrl: './file-explorer.component.css'
})
export class FileExplorerComponent implements OnInit, OnChanges{
  @Input() serverPath: string = '';
  @Input() isConnectionSuccessful: boolean = false;
  @Input() directoryType: string = '';
  @Input() directoryTypeHeader: string = '';
  @Output() passTargetDirectoryPath = new EventEmitter<string>();
  @Output() passSelectedItems = new EventEmitter<FileSystemItem[]>();

  fileSystemData: FileSystemItem[] = [];
  selectedItems: FileSystemItem[] = [];

  fetchingFilesMessage: string = '';
  retrievalError: string = '';
  selectedItemsError: string = '';


  constructor(private fileService: FileService) {}

  ngOnInit(): void {
    this.loadFilesBasic();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isConnectionSuccessful']) {
      const currentValue = changes['isConnectionSuccessful'].currentValue;
      const previousValue = changes['isConnectionSuccessful'].previousValue;
      if (currentValue === true && currentValue !== previousValue) {
        console.log('Connection successful, loading files...');
        this.loadFilesBasic();
      }
    }
  }

  loadFilesBasic() {
    this.fileSystemData = [];
    this.retrievalError = '';
    this.fetchingFilesMessage = 'Fetching files';
    this.fileService.retrieveAllFiles(this.serverPath)
      .subscribe({
        next: (resultString) => {
          this.fetchingFilesMessage = '';
          try {
            this.fileSystemData = this.parseFileSystemJson(resultString);
          } catch (error) {
            console.error('Error parsing file system data:', error);
            this.retrievalError = 'Failed to parse file system data';
          }
        },
        error: (error) => {
          this.fetchingFilesMessage = '';
          const errorMessage = `Failed to retrieve files: ${error.message || 'Unknown error'}`;
          this.retrievalError = errorMessage;
          console.error(errorMessage, error);
        }
      });
  }

  toggleFolder(item: FileSystemItem): void {
    if (item.type === 'folder') {
      if (item.children && item.children.length > 0) {
      }
      item.isExpanded = !item.isExpanded;
    }
  }

  onItemClick(item: FileSystemItem, event: Event): void {
    event.stopPropagation();
    if ((event.target as HTMLElement).tagName === 'INPUT') {
      return;
    }
    this.selectItem(item);
  }

  selectItem(item: FileSystemItem): void {
    this.deselectAllItems(this.fileSystemData);
    item.isSelected = true;
    this.selectedItems.push(item);
    console.log('Item selected:', item.name, 'Path:', item.path);
    if (item.type === "folder") {
      this.passTargetDirectoryPath.emit(item.path);
    }
  }

  private deselectAllItems(items: FileSystemItem[]): void {
    items.forEach(item => {
      item.isSelected = false;
      if (item.children && item.children.length > 0) {
        this.deselectAllItems(item.children);
      }
    });
  }

  parseFileSystemJson(jsonString: string): FileSystemItem[] {
    try {
      const parsedData = JSON.parse(jsonString);
      console.log('Parsed JSON data:', parsedData);
      return [this.createFileSystemItem(parsedData, '/', 0)];
    } catch (error) {
      console.error('Error parsing file system JSON:', error);
      this.retrievalError = 'Failed to parse file system data';
      return [];
    }
  }

  private createFileSystemItem(data: any, parentPath: string, level: number): FileSystemItem {
    const path = parentPath === '/' ? `/${data.name}` : `${parentPath}/${data.name}`;
    const item: FileSystemItem = {
      name: data.name,
      size: data.size,
      type: 'folder',
      path: path,
      lastModified: data.lastModified,
      isExpanded: level === 0,
      children: [],
      level: level
    };
    if (data.files && Array.isArray(data.files)) {
      data.files.forEach((file: any) => {
        item.children!.push({
          name: file.name,
          size: file.size,
          type: 'file',
          extension: this.getFileExtension(file.name),
          path: `${path}/${file.name}`,
          lastModified: file.lastModified,
          level: level + 1
        });
      });
    }
    if (data.subfolders && Array.isArray(data.subfolders)) {
      data.subfolders.forEach((subfolder: any) => {
        const subfolderItem = this.createFileSystemItem(subfolder, path, level + 1);
        item.children!.push(subfolderItem);
      });
    }
    if (item.children && item.children.length > 0) {
      item.children.sort((a, b) => {
        if (a.type === 'folder' && b.type === 'file') return -1;
        if (a.type === 'file' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
      });
    }
    return item;
  }

  onCheckboxChange(item: FileSystemItem, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const isChecked = checkbox.checked;

    // Set the checked state for this item
    item.isSelected = isChecked;

    // If it's a folder, recursively set the same state for all children
    if (item.type === 'folder' && item.children) {
      this.setSelectionStateRecursively(item.children, isChecked);
    }

    // Update the selectedItems array
    this.updateSelectedItems();

    console.log('Selected items:', this.selectedItems);
    if (this.selectedItems.length > 0) {
      this.passSelectedItems.emit(this.selectedItems);
    } else {
      this.selectedItemsError = 'No selected pdf files. Please select at least one file with extension .pdf';
      return;
    }
    console.log('passing selected items: ', this.selectedItems);
  }

  /**
   * Recursively sets the selection state for all items in a hierarchy
   */
  private setSelectionStateRecursively(items: FileSystemItem[], isSelected: boolean): void {
    if (!items) return;

    for (const item of items) {
      item.isSelected = isSelected;
      if (item.children) {
        this.setSelectionStateRecursively(item.children, isSelected);
      }
    }
  }

  /**
   * Updates the selectedItems array based on the current selection state of all items
   */
  private updateSelectedItems(): void {
    // Clear the current selection
    this.selectedItems = [];

    // Rebuild the selection by scanning the entire file system tree
    this.collectSelectedItems(this.fileSystemData);
  }

  /**
   * Recursively collects all selected items from the file system tree
   */
  private collectSelectedItems(items: FileSystemItem[]): void {
    if (!items) return;

    for (const item of items) {
      if (item.isSelected) {
        // Use our filtering logic to add the item
        this.addFilteredItem(item);
      }

      // Even if this item is not selected, we still need to check its children
      // as they might be individually selected
      if (item.children && !item.isSelected) {
        this.collectSelectedItems(item.children);
      }
    }
  }

  /**
   * Filters and adds items to selectedItems array ensuring only PDF files are included
   * For folders, recursively checks contents and only adds folders containing PDF files
   * @param item The item to process (file or folder)
   * @private
   */
  private addFilteredItem(item: FileSystemItem): void {
    if (item.type === 'file') {
      // For files, simply check if it's a PDF
      if (item.extension === 'pdf') {
        if (!this.selectedItems.find(i => i.path === item.path)) {
          this.selectedItems.push(item);
        }
      }
    } else if (item.type === 'folder') {
      // For folders, we need to process the contents
      const folderWithPdfFiles = this.processFolderContents(item);

      // Only add the folder if it contains PDF files after filtering
      if (folderWithPdfFiles && folderWithPdfFiles.children && folderWithPdfFiles.children.length > 0) {
        if (!this.selectedItems.find(i => i.path === folderWithPdfFiles.path)) {
          this.selectedItems.push(folderWithPdfFiles);
        }
      }
    }
  }

  /**
   * Recursively processes folder contents to filter out non-PDF files
   * @param folder The folder to process
   * @returns A new folder object with only PDF files, or null if no PDFs found
   * @private
   */
  private processFolderContents(folder: FileSystemItem): FileSystemItem | null {
    if (!folder.children || folder.children.length === 0) {
      return null; // Empty folder, don't include
    }

    // Create a deep copy of the folder to avoid modifying the original
    const filteredFolder: FileSystemItem = {
      ...folder,
      children: [] // Initialize with empty array to ensure it's defined
    };

    // Process each child item
    folder.children.forEach(child => {
      if (child.type === 'file') {
        // Include only PDF files
        if (child.extension === 'pdf') {
          filteredFolder.children!.push({ ...child });
        }
      } else if (child.type === 'folder') {
        // Recursively process subfolders
        const processedSubfolder = this.processFolderContents(child);
        if (processedSubfolder) {
          filteredFolder.children!.push(processedSubfolder);
        }
      }
    });

    // Return the folder only if it contains PDF files (directly or in subfolders)
    return filteredFolder.children!.length > 0 ? filteredFolder : null;
  }

  private getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  }
}
