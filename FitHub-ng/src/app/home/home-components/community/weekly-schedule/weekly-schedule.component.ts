import { Component, OnInit, Output, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CommunityService, Appointment } from '../../../../services/community.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-weekly-schedule',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './weekly-schedule.component.html',
    styleUrl: './weekly-schedule.component.css'
})
export class WeeklyScheduleComponent implements OnInit, OnDestroy {
    currentDate = new Date();
    selectedDate = new Date();
    weekDays: { name: string; date: number; fullDate: Date; hasEvent: boolean; eventColor?: string }[] = [];
    appointments: Appointment[] = [];
    filteredAppointments: Appointment[] = [];
    private refreshSubscription: Subscription | undefined;

    @Output() editAppointment = new EventEmitter<Appointment>();

    constructor(
        private router: Router,
        private communityService: CommunityService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.generateWeekDays();
        this.loadAppointments();

        // Auto-refresh when appointments change
        this.refreshSubscription = this.communityService.refreshAppointments$.subscribe(() => {
            this.loadAppointments();
        });
    }

    ngOnDestroy(): void {
        if (this.refreshSubscription) {
            this.refreshSubscription.unsubscribe();
        }
    }

    loadAppointments(): void {
        this.communityService.getMyAppointments().subscribe({
            next: (appointments) => {
                this.appointments = appointments;
                this.filterAppointmentsForSelectedDate();
                this.markDaysWithEvents();
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Error loading appointments:', err)
        });
    }

    filterAppointmentsForSelectedDate(): void {
        const selectedDateStr = this.selectedDate.toDateString();
        this.filteredAppointments = this.appointments.filter(apt => {
            const aptDate = new Date(apt.dateTime);
            return aptDate.toDateString() === selectedDateStr;
        });
    }

    markDaysWithEvents(): void {
        this.weekDays.forEach(day => {
            const dayDateStr = day.fullDate.toDateString();
            day.hasEvent = this.appointments.some(apt => {
                const aptDate = new Date(apt.dateTime);
                return aptDate.toDateString() === dayDateStr;
            });
            day.eventColor = day.hasEvent ? '#5161ea' : undefined;
        });
    }

    get currentMonthYear(): string {
        return this.selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    generateWeekDays(): void {
        const today = new Date(this.selectedDate);
        const dayOfWeek = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

        this.weekDays = [];
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);

            this.weekDays.push({
                name: dayNames[i],
                date: date.getDate(),
                fullDate: date,
                hasEvent: false,
                eventColor: undefined
            });
        }
    }

    selectDate(day: { fullDate: Date }): void {
        this.selectedDate = day.fullDate;
        this.generateWeekDays();
        this.filterAppointmentsForSelectedDate();
        this.markDaysWithEvents();
    }

    isToday(day: { fullDate: Date }): boolean {
        const today = new Date();
        return day.fullDate.toDateString() === today.toDateString();
    }

    isSelected(day: { fullDate: Date }): boolean {
        return day.fullDate.toDateString() === this.selectedDate.toDateString();
    }

    previousWeek(): void {
        this.selectedDate.setDate(this.selectedDate.getDate() - 7);
        this.selectedDate = new Date(this.selectedDate);
        this.generateWeekDays();
        this.filterAppointmentsForSelectedDate();
        this.markDaysWithEvents();
    }

    nextWeek(): void {
        this.selectedDate.setDate(this.selectedDate.getDate() + 7);
        this.selectedDate = new Date(this.selectedDate);
        this.generateWeekDays();
        this.filterAppointmentsForSelectedDate();
        this.markDaysWithEvents();
    }

    formatTime(dateTimeStr: string): { hour: string; period: string } {
        const date = new Date(dateTimeStr);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const period = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 || 12;
        return {
            hour: `${hour12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
            period
        };
    }

    navigateToLocation(location: string): void {
        const coordPattern = /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/;
        const match = location.match(coordPattern);

        if (match) {
            this.router.navigate(['/map'], {
                queryParams: { lat: match[1], lng: match[2] }
            });
        } else {
            this.router.navigate(['/map'], {
                queryParams: { location: location }
            });
        }
    }

    onDeleteAppointment(appointment: Appointment): void {
        this.communityService.deleteAppointment(appointment.id).subscribe({
            next: () => this.loadAppointments(),
            error: (err) => console.error('Error deleting appointment:', err)
        });
    }

    onEditAppointment(appointment: Appointment): void {
        this.editAppointment.emit(appointment);
    }
}
