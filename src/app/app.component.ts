import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

type Trip = { start: string, end: string, level: number, showArrow: boolean, x: number, y: number }

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  trips: WritableSignal<Trip[]> = signal<Trip[]>([]);
  tripForm!: FormGroup;

  // Gap between points
  xGap = 100;
  startX = 30;
  y1 = 110; // y-coordinate for level 1
  y2 = 40; // y-coordinate for level 2

  constructor(private fb: FormBuilder) { }

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
      return updatedTrips;
    });

    this.updateTripValues();
    this.tripForm.reset();
  }

  updateTripValues() {
    this.trips.update(trips => {
      const updatedTrips = [...trips];
      if (updatedTrips.length > 1) {
        updatedTrips.forEach((trip, index) => {
          trip.showArrow = false;
          trip.level = 1;

          const nextTrip = updatedTrips[index + 1];
          const prevTrip = updatedTrips[index - 1];

          if (trip.end.toLowerCase() === nextTrip?.start?.toLowerCase()) {
            trip.level = 1;
          } else {
            trip.showArrow = true;
            trip.level = 1;
          }

          if ((trip.start.toLowerCase() === nextTrip?.start?.toLowerCase() && trip.end.toLowerCase() === nextTrip?.end?.toLowerCase()) || (trip.start.toLowerCase() === prevTrip?.start?.toLowerCase() && trip.end.toLowerCase() === prevTrip?.end?.toLowerCase())) {
            trip.level = 2;
            trip.showArrow = false;
          }
        });
      }

      updatedTrips.forEach((trip, index) => {
        const x = this.startX + index * this.xGap;
        const y = trip.level === 1 ? this.y1 : this.y2;
        trip.x = x;
        trip.y = y;

        if (trip.showArrow) {
          const nextTrip = updatedTrips[index + 1];
          if (nextTrip?.level === 2) {
            trip.showArrow = false;
          }
        }
      })
      return updatedTrips;
    })
  }

  removeTrip(index: number) {
    this.trips.update(trips => {
      return trips.filter((_, i) => i !== index);
    });
    this.updateTripValues();
  }

  getPointLabel(point: Trip): string {
    return `${point.start.substring(0, 3)}-${point.end.substring(0, 3)}`;
  }

  getPathBetweenPoints(index: number): string {
    if (index >= this.trips().length - 1) return '';

    const startPoint = this.trips()[index];
    const endPoint = this.trips()[index + 1];

    if (this.trips()[index].level === this.trips()[index + 1].level) {
      return `M ${startPoint.x + 10} ${startPoint.y} L ${endPoint.x - 10} ${endPoint.y}`;
    }

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
