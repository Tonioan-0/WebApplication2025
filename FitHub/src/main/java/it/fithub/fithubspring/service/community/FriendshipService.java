package it.fithub.fithubspring.service.community;

import it.fithub.fithubspring.domain.User;

import it.fithub.fithubspring.domain.community.FriendRequest;
import it.fithub.fithubspring.domain.enums.FriendRequestStatus;
import it.fithub.fithubspring.domain.enums.NotificationType;
import it.fithub.fithubspring.exception.UserNotFoundException;
import it.fithub.fithubspring.repository.community.FriendRequestRepository;
import it.fithub.fithubspring.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Stream;

@Service
public class FriendshipService {

        private final UserRepository userRepository;
        private final FriendRequestRepository friendRequestRepository;
        private final NotificationService notificationService;

        public FriendshipService(UserRepository userRepository,
                        FriendRequestRepository friendRequestRepository,
                        NotificationService notificationService) {
                this.userRepository = userRepository;
                this.friendRequestRepository = friendRequestRepository;
                this.notificationService = notificationService;
        }

        public void sendFriendRequest(Long senderId, Long receiverId) {
                User sender = userRepository.findById(senderId)
                                .orElseThrow(() -> new UserNotFoundException("Sender not found with id: " + senderId));
                User receiver = userRepository.findById(receiverId)
                                .orElseThrow(() -> new UserNotFoundException(
                                                "Receiver not found with id: " + receiverId));

                FriendRequest friendRequest = new FriendRequest(sender, receiver);
                friendRequestRepository.save(friendRequest);

                String notificationMessage = sender.getUsername() + " has sent you a friend request.";
                notificationService.createNotification(receiver, notificationMessage, NotificationType.FRIEND_REQUEST);
        }

        public void acceptFriendRequest(Long requestId) {
                FriendRequest friendRequest = friendRequestRepository.findById(requestId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Friend request not found with id: " + requestId));
                friendRequest.setStatus(FriendRequestStatus.ACCEPTED);
                friendRequestRepository.save(friendRequest);
        }

        public List<User> getFriends(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

                List<User> friendsFromSentRequests = friendRequestRepository.findUsersWhoReceivedRequestsFrom(user,
                                FriendRequestStatus.ACCEPTED);
                List<User> friendsFromReceivedRequests = friendRequestRepository.findUsersWhoSentRequestsTo(user,
                                FriendRequestStatus.ACCEPTED);

                return Stream.concat(friendsFromSentRequests.stream(), friendsFromReceivedRequests.stream()).toList();
        }

        public List<FriendRequest> getPendingRequests(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

                return friendRequestRepository.findPendingRequestsForUser(user);
        }

        public void rejectFriendRequest(Long requestId) {
                if (friendRequestRepository.findById(requestId).isEmpty()) {
                        throw new RuntimeException("Friend request not found with id: " + requestId);
                }
                friendRequestRepository.deleteById(requestId);
        }

        public List<User> searchUsers(String query) {
                return userRepository.searchByUsername(query);
        }

        public void unfriend(Long userId, Long friendId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
                User friend = userRepository.findById(friendId)
                                .orElseThrow(() -> new UserNotFoundException("Friend not found with id: " + friendId));

                // Delete friendship in both directions (sender->receiver and receiver->sender)
                friendRequestRepository.deleteFriendship(user, friend);
        }
}
