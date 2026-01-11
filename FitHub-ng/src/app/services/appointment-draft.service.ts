import { Injectable } from '@angular/core';

export interface AppointmentDraft {
    workoutTitle: string;
    workoutType: 'STRENGTH' | 'CARDIO' | 'YOGA' | 'HIIT';
    workoutDate: string;
    workoutTime: string;
    location: string;
}

@Injectable({
    providedIn: 'root'
})
export class AppointmentDraftService {
    private draft: AppointmentDraft | null = null;

    saveDraft(draft: AppointmentDraft): void {
        this.draft = { ...draft };
    }

    getDraft(): AppointmentDraft | null {
        return this.draft;
    }

    clearDraft(): void {
        this.draft = null;
    }

    hasDraft(): boolean {
        return this.draft !== null;
    }
}
