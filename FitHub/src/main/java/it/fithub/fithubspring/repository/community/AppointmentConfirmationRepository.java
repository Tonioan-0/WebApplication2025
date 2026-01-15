package it.fithub.fithubspring.repository.community;

import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class AppointmentConfirmationRepository {

    private final DataSource dataSource;

    public AppointmentConfirmationRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void confirm(Long appointmentId, Long userId) {
        String sql = "INSERT INTO appointment_confirmation (appointment_id, user_id) VALUES (?, ?) ON CONFLICT DO NOTHING";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, appointmentId);
            stmt.setLong(2, userId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error confirming appointment", e);
        }
    }

    public boolean isConfirmed(Long appointmentId, Long userId) {
        String sql = "SELECT 1 FROM appointment_confirmation WHERE appointment_id = ? AND user_id = ?";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, appointmentId);
            stmt.setLong(2, userId);

            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next();
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error checking confirmation status", e);
        }
    }

    public int countConfirmations(Long appointmentId) {
        String sql = "SELECT COUNT(*) FROM appointment_confirmation WHERE appointment_id = ?";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, appointmentId);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
                return 0;
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error counting confirmations", e);
        }
    }

    public List<Long> getConfirmedUserIds(Long appointmentId) {
        String sql = "SELECT user_id FROM appointment_confirmation WHERE appointment_id = ?";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, appointmentId);

            try (ResultSet rs = stmt.executeQuery()) {
                List<Long> userIds = new ArrayList<>();
                while (rs.next()) {
                    userIds.add(rs.getLong("user_id"));
                }
                return userIds;
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error fetching confirmed users", e);
        }
    }
}
