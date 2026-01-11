import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatCard {
    title: string;
    value: string | number;
    icon: string;
    color: string;
    change?: string;
}

interface RecentWorkout {
    name: string;
    date: string;
    duration: string;
    calories: number;
    type: 'Strength' | 'Cardio' | 'Yoga' | 'HIIT';
}

@Component({
    selector: 'app-dashboard-overview',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {

    // Statistiche principali
    stats: StatCard[] = [
        {
            title: 'Workouts This Week',
            value: 12,
            icon: '💪',
            color: '#5352ed',
            change: '+3 from last week'
        },
        {
            title: 'Calories Burned',
            value: '2,450',
            icon: '🔥',
            color: '#ff6b6b',
            change: '+15% from last week'
        },
        {
            title: 'Active Minutes',
            value: 340,
            icon: '⏱️',
            color: '#74b9ff',
            change: '+25 min from last week'
        },
        {
            title: 'Current Streak',
            value: 12,
            icon: '⚡',
            color: '#feca57',
            change: 'Personal best!'
        }
    ];

    // Allenamenti recenti
    recentWorkouts: RecentWorkout[] = [
        {
            name: 'Upper Body Strength',
            date: '2 hours ago',
            duration: '45 min',
            calories: 320,
            type: 'Strength'
        },
        {
            name: 'Morning Cardio',
            date: 'Yesterday',
            duration: '30 min',
            calories: 280,
            type: 'Cardio'
        },
        {
            name: 'HIIT Session',
            date: '2 days ago',
            duration: '25 min',
            calories: 350,
            type: 'HIIT'
        }
    ];

    // Obiettivo settimanale
    weeklyGoal = {
        current: 12,
        target: 15,
        percentage: 80
    };

    constructor() { }

    ngOnInit(): void {
        // Qui potresti caricare i dati reali da un servizio
        this.calculateWeeklyGoal();
    }

    calculateWeeklyGoal(): void {
        this.weeklyGoal.percentage = Math.round(
            (this.weeklyGoal.current / this.weeklyGoal.target) * 100
        );
    }

    getWorkoutTypeColor(type: string): string {
        const colors: { [key: string]: string } = {
            'Strength': '#5352ed',
            'Cardio': '#ff6b6b',
            'Yoga': '#a29bfe',
            'HIIT': '#fd79a8'
        };
        return colors[type] || '#74b9ff';
    }
}