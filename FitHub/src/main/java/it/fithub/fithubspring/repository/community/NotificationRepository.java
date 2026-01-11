package it.fithub.fithubspring.repository.community;

import it.fithub.fithubspring.domain.User;
import it.fithub.fithubspring.repository.UserRepository;

import it.fithub.fithubspring.domain.community.Notification;
import it.fithub.fithubspring.domain.enums.NotificationType;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class NotificationRepository {

    private final DataSource dataSource;
    private final UserRepository userRepository;

    public NotificationRepository(DataSource dataSource, UserRepository userRepository) {
        this.dataSource = dataSource;
        this.userRepository = userRepository;
    }

    public Notification save(Notification notification) {
        if (notification.getId() == null) {
            return insert(notification);
        } else {
            return update(notification);
        }
    }

    private Notification insert(Notification notification) {
        String sql = "INSERT INTO notification (user_id, message, type, is_read, timestamp) " +
                "VALUES (?, ?, ?, ?, ?) RETURNING id";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, notification.getUser().getId());
            stmt.setString(2, notification.getMessage());
            stmt.setString(3, notification.getType().name());
            stmt.setBoolean(4, notification.isRead());
            stmt.setTimestamp(5, Timestamp.valueOf(notification.getTimestamp()));

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    notification.setId(rs.getLong(1));
                }
            }
            return notification;
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting notification", e);
        }
    }

    private Notification update(Notification notification) {
        String sql = "UPDATE notification SET user_id = ?, message = ?, type = ?, is_read = ?, timestamp = ? WHERE id = ?";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, notification.getUser().getId());
            stmt.setString(2, notification.getMessage());
            stmt.setString(3, notification.getType().name());
            stmt.setBoolean(4, notification.isRead());
            stmt.setTimestamp(5, Timestamp.valueOf(notification.getTimestamp()));
            stmt.setLong(6, notification.getId());

            stmt.executeUpdate();
            return notification;
        } catch (SQLException e) {
            throw new RuntimeException("Error updating notification", e);
        }
    }

    public List<Notification> findByUserIdAndIsReadFalse(Long userId) {
        String sql = "SELECT * FROM notification WHERE user_id = ? AND is_read = FALSE ORDER BY timestamp DESC";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, userId);

            try (ResultSet rs = stmt.executeQuery()) {
                List<Notification> notifications = new ArrayList<>();
                while (rs.next()) {
                    notifications.add(mapResultSetToNotification(rs));
                }
                return notifications;
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error fetching unread notifications", e);
        }
    }

    public Optional<Notification> findById(Long id) {
        String sql = "SELECT * FROM notification WHERE id = ?";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToNotification(rs));
                }
                return Optional.empty();
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error fetching notification by ID", e);
        }
    }

    public void deleteById(Long id) {
        String sql = "DELETE FROM notification WHERE id = ?";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting notification", e);
        }
    }

    public void markAsRead(Long notificationId) {
        String sql = "UPDATE notification SET is_read = TRUE WHERE id = ?";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, notificationId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error marking notification as read", e);
        }
    }

    public List<Notification> findAll() {
        String sql = "SELECT * FROM notification ORDER BY timestamp DESC";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql);
                ResultSet rs = stmt.executeQuery()) {

            List<Notification> notifications = new ArrayList<>();
            while (rs.next()) {
                notifications.add(mapResultSetToNotification(rs));
            }
            return notifications;
        } catch (SQLException e) {
            throw new RuntimeException("Error fetching all notifications", e);
        }
    }

    private Notification mapResultSetToNotification(ResultSet rs) throws SQLException {
        Notification notification = new Notification();
        notification.setId(rs.getLong("id"));

        Long userId = rs.getLong("user_id");
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        notification.setUser(user);

        notification.setMessage(rs.getString("message"));
        notification.setType(NotificationType.valueOf(rs.getString("type")));
        notification.setRead(rs.getBoolean("is_read"));
        notification.setTimestamp(rs.getTimestamp("timestamp").toLocalDateTime());

        return notification;
    }
}
