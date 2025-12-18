import {Component, EventEmitter, Output, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-connection-form',
  imports: [
    FormsModule
  ],
  templateUrl: './connection-form.component.html',
  standalone: true,
  styleUrl: './connection-form.component.css'
})
export class ConnectionFormComponent {

  @Output() passSuccessfulConnection = new EventEmitter<boolean>();

  machineName: string = '';
  userName: string = '';
  password: string = '';
  port: number = 0;
  isConnectionSuccessful: boolean = false;

  connectionSuccessMessage: string = '';
  showSuccessMessage: boolean = false;
  progressValue: number = 100;
  remainingSeconds: number = 5;

  private messageTimer: any;
  private progressTimer: any;

  errors: string[] = [];

  ngOnDestroy(): void {
    this.clearTimers();
  }

  connect() {
    this.errors = [];
    this.connectionSuccessMessage = '';
    this.clearTimers();
    if (!this.machineName) {
      this.errors.push("Enter a machine name");
    }
    if (!this.userName) {
      this.errors.push("Enter a user name");
    }
    if (!this.password) {
      this.errors.push("Enter a password");
    }
    if (!this.port || this.port <= 0) {
      this.errors.push("Enter a valid port number");
    }

    if (this.errors.length === 0) {
      if (this.isConnectionSuccessful) {
        this.connectionSuccessMessage = 'Already connected';
        this.showBriefReminder();
      } else {
        this.isConnectionSuccessful = true;
        this.passSuccessfulConnection.emit(this.isConnectionSuccessful);
        this.connectionSuccessMessage = 'Connection successful';
        this.showSuccessMessage = true;
        this.startSuccessMessageTimer();
      }
    }
  }


  hideSuccessMessage(): void {
    this.showSuccessMessage = false;
    this.clearTimers();
  }

  private startSuccessMessageTimer(): void {
    // Reset values
    this.progressValue = 100;
    this.remainingSeconds = 5;

    // Set up progress bar timer (updates every 50ms)
    const totalDuration = 5000; // 5 seconds
    const updateInterval = 50; // 50ms
    const decrementPerInterval = (updateInterval / totalDuration) * 100;

    this.progressTimer = setInterval(() => {
      this.progressValue -= decrementPerInterval;
      if (this.progressValue <= 0) {
        this.progressValue = 0;
      }
    }, updateInterval);

    this.messageTimer = setInterval(() => {
      this.remainingSeconds--;
      if (this.remainingSeconds <= 0) {
        this.hideSuccessMessage();
      }
    }, 1000);

    setTimeout(() => {
      this.hideSuccessMessage();
    }, totalDuration);
  }

  private clearTimers(): void {
    if (this.messageTimer) {
      clearInterval(this.messageTimer);
      this.messageTimer = null;
    }
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  private showBriefReminder(): void {
    this.showSuccessMessage = true;

    const reminderDuration = 1500;
    this.messageTimer = setTimeout(() => {
      this.showSuccessMessage = false;
    }, reminderDuration);
  }
}
