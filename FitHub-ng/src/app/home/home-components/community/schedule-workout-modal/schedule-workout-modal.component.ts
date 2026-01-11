import { Component, EventEmitter, Output, Input, OnInit, OnChanges, OnDestroy, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommunityService, Appointment } from '../../../../services/community.service';
import { AppointmentDraftService } from '../../../../services/appointment-draft.service';
import { SVG_ICONS } from '../../../../shared/constants/svg-icons.constants';

@Component({
    selector: 'app-schedule-workout-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './schedule-workout-modal.component.html',
    styleUrl: './schedule-workout-modal.component.css'
})
export class ScheduleWorkoutModalComponent implements OnInit, OnChanges, OnDestroy {
    @Input() initialLocation = '';
    @Input() editingAppointment: Appointment | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() scheduled = new EventEmitter<void>();

    workoutTitle = '';
    workoutType: 'STRENGTH' | 'CARDIO' | 'YOGA' | 'HIIT' = 'STRENGTH';
    workoutDate = '';
    workoutTime = '';
    location = '';

    isEditMode = false;

    workoutTypes: ('STRENGTH' | 'CARDIO' | 'YOGA' | 'HIIT')[] = ['STRENGTH', 'CARDIO', 'YOGA', 'HIIT'];

    readonly svgIcons = SVG_ICONS;
    private navigatingToMap = false;

    constructor(
        private communityService: CommunityService,
        private router: Router,
        private draftService: AppointmentDraftService
    ) { }

    ngOnInit(): void {
        if (this.editingAppointment) {
            this.isEditMode = true;
            this.workoutTitle = this.editingAppointment.title || '';
            this.workoutType = (this.editingAppointment.type as 'STRENGTH' | 'CARDIO' | 'YOGA' | 'HIIT') || 'STRENGTH';
            this.location = this.editingAppointment.location;
            const dt = new Date(this.editingAppointment.dateTime);
            this.workoutDate = dt.toISOString().split('T')[0];
            this.workoutTime = `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}`;
            return;
        }

        const draft = this.draftService.getDraft();
        if (draft) {
            this.workoutTitle = draft.workoutTitle;
            this.workoutType = draft.workoutType;
            this.workoutDate = draft.workoutDate;
            this.workoutTime = draft.workoutTime;
            this.location = this.initialLocation || draft.location;

            this.draftService.clearDraft();
        } else {
            const today = new Date();
            this.workoutDate = today.toISOString().split('T')[0];
            this.workoutTime = '09:00';
            if (this.initialLocation) {
                this.location = this.initialLocation;
            }
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['initialLocation'] && changes['initialLocation'].currentValue) {
            this.location = changes['initialLocation'].currentValue;
        }
    }

    ngOnDestroy(): void {
        if (this.navigatingToMap) {
            this.draftService.saveDraft({
                workoutTitle: this.workoutTitle,
                workoutType: this.workoutType,
                workoutDate: this.workoutDate,
                workoutTime: this.workoutTime,
                location: this.location
            });
        }
    }



    openMapPicker(): void {
        this.navigatingToMap = true;
        this.router.navigate(['/map/select']);
    }

    onSubmit(): void {
        if (!this.workoutDate || !this.workoutTime || !this.location) {
            return;
        }

        const dateTime = `${this.workoutDate}T${this.workoutTime}:00`;

        if (this.isEditMode && this.editingAppointment) {
            this.communityService.updateAppointment(this.editingAppointment.id, {
                title: this.workoutTitle,
                type: this.workoutType,
                location: this.location,
                dateTime
            }).subscribe({
                next: () => this.scheduled.emit(),
                error: () => this.scheduled.emit()
            });
        } else {
            this.communityService.createAppointment({
                title: this.workoutTitle,
                type: this.workoutType,
                location: this.location,
                dateTime
            }).subscribe({
                next: () => this.scheduled.emit(),
                error: () => this.scheduled.emit()
            });
        }
    }

    onClose(): void {
        this.close.emit();
    }

    onBackdropClick(event: MouseEvent): void {
        if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
            this.onClose();
        }
    }
}
