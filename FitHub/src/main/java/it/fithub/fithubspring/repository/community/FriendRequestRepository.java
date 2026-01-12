package it.fithub.fithubspring.repository.community;

import it.fithub.fithubspring.domain.User;
import it.fithub.fithubspring.repository.UserRepository;

import it.fithub.fithubspring.domain.community.FriendRequest;
import it.fithub.fithubspring.domain.enums.FriendRequestStatus;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class FriendRequestRepository {

    private final DataSource dataSource;
    private final UserRepository userRepository;

    public FriendRequestRepository(DataSource dataSource, UserRepository userRepository) {
        this.dataSource = dataSource;
        this.userRepository = userRepository;
    }

    public FriendRequest save(FriendRequest friendRequest) {
        if (friendRequest.getId() == null) {
            return insert(friendRequest);
        } else {
            return update(friendRequest);
        }
    }

    private FriendRequest insert(FriendRequest friendRequest) {
        String sql = "INSERT INTO friend_request (sender_id, receiver_id, status, timestamp) " +
                "VALUES (?, ?, ?, ?) RETURNING id";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, friendRequest.getSender().getId());
            stmt.setLong(2, friendRequest.getReceiver().getId());
            stmt.setString(3, friendRequest.getStatus().name());
            stmt.setTimestamp(4, Timestamp.valueOf(friendRequest.getTimestamp()));

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    friendRequest.setId(rs.getLong(1));
                }
            }
            return friendRequest;
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting friend request", e);
        }
    }

    private FriendRequest update(FriendRequest friendRequest) {
        String sql = "UPDATE friend_request SET sender_id = ?, receiver_id = ?, status = ?, timestamp = ? WHERE id = ?";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, friendRequest.getSender().getId());
            stmt.setLong(2, friendRequest.getReceiver().getId());
            stmt.setString(3, friendRequest.getStatus().name());
            stmt.setTimestamp(4, Timestamp.valueOf(friendRequest.getTimestamp()));
            stmt.setLong(5, friendRequest.getId());

            stmt.executeUpdate();
            return friendRequest;
        } catch (SQLException e) {
            throw new RuntimeException("Error updating friend request", e);
        }
    }

    public Optional<FriendRequest> findById(Long id) {
        String sql = "SELECT * FROM friend_request WHERE id = ?";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToFriendRequest(rs));
                }
                return Optional.empty();
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error fetching friend request by ID", e);
        }
    }

    public List<User> findUsersWhoSentRequestsTo(User user, FriendRequestStatus status) {
        String sql = "SELECT u.* FROM app_user u " +
                "JOIN friend_request fr ON fr.sender_id = u.id " +
                "WHERE fr.receiver_id = ? AND fr.status = ?";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, user.getId());
            stmt.setString(2, status.name());

            try (ResultSet rs = stmt.executeQuery()) {
                List<User> users = new ArrayList<>();
                while (rs.next()) {
                    users.add(mapResultSetToUser(rs));
                }
                return users;
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error fetching users who sent requests", e);
        }
    }

    public List<User> findUsersWhoReceivedRequestsFrom(User user, FriendRequestStatus status) {
        String sql = "SELECT u.* FROM app_user u " +
                "JOIN friend_request fr ON fr.receiver_id = u.id " +
                "WHERE fr.sender_id = ? AND fr.status = ?";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, user.getId());
            stmt.setString(2, status.name());

            try (ResultSet rs = stmt.executeQuery()) {
                List<User> users = new ArrayList<>();
                while (rs.next()) {
                    users.add(mapResultSetToUser(rs));
                }
                return users;
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error fetching users who received requests", e);
        }
    }

    public void deleteById(Long id) {
        String sql = "DELETE FROM friend_request WHERE id = ?";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting friend request", e);
        }
    }

    public List<FriendRequest> findAll() {
        String sql = "SELECT * FROM friend_request ORDER BY timestamp DESC";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql);
                ResultSet rs = stmt.executeQuery()) {

            List<FriendRequest> requests = new ArrayList<>();
            while (rs.next()) {
                requests.add(mapResultSetToFriendRequest(rs));
            }
            return requests;
        } catch (SQLException e) {
            throw new RuntimeException("Error fetching all friend requests", e);
        }
    }

    public List<FriendRequest> findPendingRequestsForUser(User user) {
        String sql = "SELECT * FROM friend_request WHERE receiver_id = ? AND status = 'PENDING' ORDER BY timestamp DESC";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, user.getId());

            try (ResultSet rs = stmt.executeQuery()) {
                List<FriendRequest> requests = new ArrayList<>();
                while (rs.next()) {
                    requests.add(mapResultSetToFriendRequest(rs));
                }
                return requests;
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error fetching pending friend requests", e);
        }
    }

    private FriendRequest mapResultSetToFriendRequest(ResultSet rs) throws SQLException {
        FriendRequest friendRequest = new FriendRequest();
        friendRequest.setId(rs.getLong("id"));

        Long senderId = rs.getLong("sender_id");
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found: " + senderId));
        friendRequest.setSender(sender);

        Long receiverId = rs.getLong("receiver_id");
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found: " + receiverId));
        friendRequest.setReceiver(receiver);

        friendRequest.setStatus(FriendRequestStatus.valueOf(rs.getString("status")));
        friendRequest.setTimestamp(rs.getTimestamp("timestamp").toLocalDateTime());

        return friendRequest;
    }

    private User mapResultSetToUser(ResultSet rs) throws SQLException {
        User user = new User();
        user.setId(rs.getLong("id"));
        user.setUsername(rs.getString("username"));
        user.setEmail(rs.getString("email"));
        return user;
    }

    public void deleteFriendship(User user1, User user2) {
        String sql = "DELETE FROM friend_request WHERE " +
                "(sender_id = ? AND receiver_id = ? AND status = 'ACCEPTED') OR " +
                "(sender_id = ? AND receiver_id = ? AND status = 'ACCEPTED')";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, user1.getId());
            stmt.setLong(2, user2.getId());
            stmt.setLong(3, user2.getId());
            stmt.setLong(4, user1.getId());

            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting friendship", e);
        }
    }
}
