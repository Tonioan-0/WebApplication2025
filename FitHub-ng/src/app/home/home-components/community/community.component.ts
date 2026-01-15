import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WeeklyScheduleComponent } from './weekly-schedule/weekly-schedule.component';
import { ManageFriendsComponent } from './manage-friends/manage-friends.component';
import { ScheduleWorkoutModalComponent } from './schedule-workout-modal/schedule-workout-modal.component';
import { NotificationService } from '../../../services/notification.service';
import { Subscription } from 'rxjs';
import { Appointment } from '../../../services/community.service';

@Component({
    selector: 'app-community',
    standalone: true,
    imports: [
        CommonModule,
        WeeklyScheduleComponent,
        ManageFriendsComponent,
        ScheduleWorkoutModalComponent
    ],
    templateUrl: './community.component.html',
    styleUrl: './community.component.css'
})
export class CommunityComponent implements OnInit, OnDestroy {
    showScheduleModal = false;
    selectedLocation = '';
    editingAppointment: Appointment | null = null;
    private notificationSubscription: Subscription | null = null;

    @ViewChild(WeeklyScheduleComponent) weeklySchedule!: WeeklyScheduleComponent;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            if (params['selectedLocation']) {
                this.selectedLocation = params['selectedLocation'];
                this.showScheduleModal = true;
                this.router.navigate([], {
                    queryParams: {},
                    replaceUrl: true
                });
            }
        });

        // Subscribe to new notification events
        this.notificationSubscription = this.notificationService.newNotification$.subscribe(type => {
            if (type === 'NEW_APPOINTMENT') {
                if (this.weeklySchedule) {
                    this.weeklySchedule.loadAppointments();
                }
            }
        });
    }

    ngOnDestroy(): void {
        if (this.notificationSubscription) {
            this.notificationSubscription.unsubscribe();
        }
    }

    openScheduleModal(): void {
        this.editingAppointment = null;
        this.showScheduleModal = true;
    }

    closeScheduleModal(): void {
        this.showScheduleModal = false;
        this.selectedLocation = '';
        this.editingAppointment = null;
    }

    onWorkoutScheduled(): void {
        this.showScheduleModal = false;
        this.selectedLocation = '';
        this.editingAppointment = null;
        if (this.weeklySchedule) {
            this.weeklySchedule.loadAppointments();
        }
    }

    onEditAppointment(appointment: Appointment): void {
        this.editingAppointment = appointment;
        this.selectedLocation = appointment.location;
        this.showScheduleModal = true;
    }
}
