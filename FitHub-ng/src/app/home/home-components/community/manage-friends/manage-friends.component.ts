import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommunityService, Friend, FriendRequest } from '../../../../services/community.service';
import { SVG_ICONS } from '../../../../shared/constants/svg-icons.constants';

@Component({
    selector: 'app-manage-friends',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './manage-friends.component.html',
    styleUrl: './manage-friends.component.css'
})
export class ManageFriendsComponent implements OnInit {
    protected readonly svgIcons = SVG_ICONS;
    friends: Friend[] = [];
    filteredFriends: Friend[] = [];
    pendingRequests: FriendRequest[] = [];
    searchQuery = '';
    searchResults: Friend[] = [];
    isSearching = false;
    loading = true;
    error = '';
    sentRequestIds: Set<number> = new Set();

    constructor(
        private communityService: CommunityService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadFriends();
        this.loadPendingRequests();
    }

    loadFriends(): void {
        this.loading = true;
        console.log('Loading friends...');
        this.communityService.getFriends().subscribe({
            next: (friends) => {
                console.log('Friends loaded:', friends);
                this.friends = friends;
                this.filteredFriends = friends;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.error = 'Unable to load friends';
                this.loading = false;
                console.error('Error loading friends:', err);
                this.cdr.detectChanges();
            }
        });
    }

    loadPendingRequests(): void {
        this.communityService.getPendingRequests().subscribe({
            next: (requests) => {
                console.log('Requests loaded:', requests);
                this.pendingRequests = requests;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading pending requests:', err);
            }
        });
    }

    onSearch(): void {
        const query = this.searchQuery.trim();

        if (!query) {
            this.filteredFriends = this.friends;
            this.searchResults = [];
            this.isSearching = false;
            return;
        }

        // Filter existing friends locally
        this.filteredFriends = this.friends.filter(f =>
            f.username.toLowerCase().includes(query.toLowerCase())
        );

        // Search for new users on server
        this.isSearching = true;
        this.communityService.searchUsers(query).subscribe({
            next: (users) => {
                // Exclude already friends (backend will handle current user exclusion)
                const friendIds = new Set(this.friends.map(f => f.id));
                this.searchResults = users.filter(u => !friendIds.has(u.id));
                this.isSearching = false;
            },
            error: () => {
                this.isSearching = false;
            }
        });
    }

    isSentRequest(userId: number): boolean {
        return this.sentRequestIds.has(userId);
    }

    sendRequest(user: Friend): void {
        this.communityService.sendFriendRequest(user.id).subscribe({
            next: () => {
                this.sentRequestIds.add(user.id);
                this.cdr.detectChanges();
            }
        });
    }

    acceptRequest(request: FriendRequest): void {
        this.communityService.acceptFriendRequest(request.id).subscribe({
            next: () => {
                this.pendingRequests = this.pendingRequests.filter(r => r.id !== request.id);
                this.loadFriends(); // Reload friends list
            }
        });
    }

    rejectRequest(request: FriendRequest): void {
        this.communityService.rejectFriendRequest(request.id).subscribe({
            next: () => {
                this.pendingRequests = this.pendingRequests.filter(r => r.id !== request.id);
            }
        });
    }

    unfriend(friend: Friend): void {
        if (confirm(`Vuoi rimuovere ${friend.username} dai tuoi amici?`)) {
            this.communityService.unfriend(friend.id).subscribe({
                next: () => {
                    this.friends = this.friends.filter(f => f.id !== friend.id);
                    this.filteredFriends = this.filteredFriends.filter(f => f.id !== friend.id);
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error('Error unfriending:', err);
                    alert('Errore durante la rimozione dell\'amicizia');
                }
            });
        }
    }
}
