import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

type Trip = { start: string, end: string, level: number, showArrow: boolean }

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  trips: WritableSignal<Trip[]> = signal<Trip[]>([
    {
      "start": "Banglore",
      "end": "Chennai",
      "level": 1,
      "showArrow": true
    },
    {
      "start": "Madurai",
      "end": "Chennai",
      "level": 1,
      "showArrow": true
    },
    {
      "start": "Chennai",
      "end": "Madurai",
      "level": 1,
      "showArrow": true
    },
    {
      "start": "Banglore",
      "end": "Ooty",
      "level": 1,
      "showArrow": true
    },
    {
      "start": "Banglore",
      "end": "Chennai",
      "level": 1,
      "showArrow": true
    },
    {
      "start": "Madurai",
      "end": "Chennai",
      "level": 1,
      "showArrow": true
    },
    {
      "start": "Chennai",
      "end": "Madurai",
      "level": 1,
      "showArrow": true
    },
    {
      "start": "Banglore",
      "end": "Ooty",
      "level": 1,
      "showArrow": true
    },
    {
      "start": "Banglore",
      "end": "Chennai",
      "level": 1,
      "showArrow": true
    },
    {
      "start": "Madurai",
      "end": "Chennai",
      "level": 1,
      "showArrow": true
    },
    {
      "start": "Chennai",
      "end": "Madurai",
      "level": 1,
      "showArrow": true
    },
    {
      "start": "Banglore",
      "end": "Ooty",
      "level": 1,
      "showArrow": true
    },
  ]);
  tripForm!: FormGroup;

  // Gap between points
  xGap = 100;
  startX = 30;
  y1 = 150; // y-coordinate for level 1
  y2 = 80; // y-coordinate for level 2

  pointCoordinates: { x: number; y: number }[] = [];

  constructor(private fb: FormBuilder) { 
    this.generateCoordinates();
  }

  ngOnInit(): void {
    this.tripForm = this.fb.group({
      start: ["", [Validators.required, Validators.minLength(3)]],
      end: ["", [Validators.required, Validators.minLength(3)]],
      level: [1]
    })
  }

  addTrip() {
    this.tripForm.markAllAsTouched();
    this.tripForm.updateValueAndValidity();

    if (this.tripForm.invalid) {
      return;
    }

    this.trips.update(trips => {
      const updatedTrips: Trip[] = [...trips, this.tripForm.value];

      if (updatedTrips.length > 1) {
        updatedTrips.forEach((trip, index) => {
          trip.showArrow = false;
          trip.level = 1; // Default level is 1

          // Check for consecutive trips
          const nextTrip = updatedTrips[index + 1];
          const prevTrip = updatedTrips[index - 1];

          // Case 1: Check for continued trip (same drop and pick-up locations)
          if (trip.end === nextTrip?.start) {
            trip.level = 1; // Continued trip stays on level 1
          }
          // Case 2: If trips are not continued and the locations are different
          else {
            trip.showArrow = true; // Show arrow if it's not a continued trip
            trip.level = 1; // Ensure it's still on level 1 (arrow implies the line isn't straight)
          }

          // Case 3: If consecutive trips have the same pickup and drop locations
          if ((trip.start === nextTrip?.start && trip.end === nextTrip?.end) || (trip.start === prevTrip?.start && trip.end === prevTrip?.end)) {
            trip.level = 2; // Set to level 2 for same start and end locations
            trip.showArrow = false;
          }
        });
      }

      return updatedTrips;
    });

    console.log(this.trips())

    this.generateCoordinates();
    this.tripForm.reset();
  }

  generateCoordinates(): void {
    this.pointCoordinates = [];
    this.trips().forEach((point, index) => {
      const x = this.startX + index * this.xGap;
      const y = point.level === 1 ? this.y1 : this.y2;

      this.pointCoordinates.push({ x, y });
    });

    console.log(this.pointCoordinates)
  }

  getPointLabel(point: Trip): string {
    return `${point.start.substring(0, 3)}-${point.end.substring(0, 3)}`;
  }

  // Get path between points, deciding between curved or straight lines
  getPathBetweenPoints(index: number): string {
    if (index >= this.pointCoordinates.length - 1) return '';

    const startPoint = this.pointCoordinates[index];
    const endPoint = this.pointCoordinates[index + 1];

    // If both points are at the same level, use a straight line
    if (this.trips()[index].level === this.trips()[index + 1].level) {
      return `M ${startPoint.x + 10} ${startPoint.y} L ${endPoint.x - 10} ${endPoint.y
        }`;
    }

    // Otherwise use a curved line
    const controlPoint1X = startPoint.x + this.xGap * 0.25;
    const controlPoint2X = endPoint.x - this.xGap * 0.25;

    return `M ${startPoint.x + 10} ${startPoint.y} C ${controlPoint1X} ${startPoint.y
      }, ${controlPoint2X} ${endPoint.y}, ${endPoint.x - 10} ${endPoint.y}`;
  }

  getLineColor(index: number): string {
    const colors = ['#e74c3c', '#2ecc71', '#9b59b6', '#f39c12', '#1abc9c'];
    return colors[index % colors.length];
  }

  getLineWidth(index: number): number {
    return index === 0 ? 4 : 2; // First line is thicker
  }

  getArrowMarkerId(index: number): string {
    const colorNames = ['red', 'green', 'purple', 'orange', 'teal'];
    return `${colorNames[index % colorNames.length]}Arrowhead`;
  }
}
