import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiChatService } from '../services/ai-chat.service';
import { SVG_ICONS } from '../shared/constants/svg-icons.constants';
import { MarkdownPipe } from './markdown.pipe';

interface Message {
    text: string;
    isUser: boolean;
    timestamp: Date;
}

@Component({
    selector: 'app-ai-chat-button',
    standalone: true,
    imports: [CommonModule, FormsModule, MarkdownPipe],
    templateUrl: './ai-chat-button.component.html',
    styleUrls: ['./ai-chat-button.component.css']
})
export class AiChatButtonComponent {
    isOpen = false;
    messages: Message[] = [];
    userInput = '';
    isLoading = false;
    errorMessage: string | null = null;
    readonly svgIcons = SVG_ICONS;

    constructor(
        private chatService: AiChatService,
        private cdr: ChangeDetectorRef
    ) {
        // Add welcome message
        this.messages.push({
            text: 'Hi! I\'m Neko, your personal trainer assistant. How can I help you train smarter today?',
            isUser: false,
            timestamp: new Date()
        });
    }

    toggleChat(): void {
        this.isOpen = !this.isOpen;
        this.errorMessage = null;
    }

    sendMessage(): void {
        if (!this.userInput.trim() || this.isLoading) return;

        const userMessage = this.userInput.trim();
        this.messages.push({
            text: userMessage,
            isUser: true,
            timestamp: new Date()
        });

        this.userInput = '';
        this.isLoading = true;
        this.errorMessage = null;

        this.chatService.sendMessage(userMessage).subscribe({
            next: (response) => {
                this.messages.push({
                    text: response.reply,
                    isUser: false,
                    timestamp: new Date()
                });
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                this.errorMessage = error.message;
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }
}
