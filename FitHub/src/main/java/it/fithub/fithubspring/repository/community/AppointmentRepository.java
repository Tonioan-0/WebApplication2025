package it.fithub.fithubspring.repository.community;

import it.fithub.fithubspring.domain.User;
import it.fithub.fithubspring.repository.UserRepository;

import it.fithub.fithubspring.domain.community.Appointment;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class AppointmentRepository {

    private final DataSource dataSource;
    private final UserRepository userRepository;

    public AppointmentRepository(DataSource dataSource, UserRepository userRepository) {
        this.dataSource = dataSource;
        this.userRepository = userRepository;
    }

    public Appointment save(Appointment appointment) {
        if (appointment.getId() == null) {
            return insert(appointment);
        } else {
            return update(appointment);
        }
    }

    private Appointment insert(Appointment appointment) {
        String sql = "INSERT INTO appointment (title, type, location, date_time, creator_id) " +
                "VALUES (?, ?, ?, ?, ?) RETURNING id";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, appointment.getTitle());
            stmt.setString(2, appointment.getType());
            stmt.setString(3, appointment.getLocation());
            stmt.setTimestamp(4, Timestamp.valueOf(appointment.getDateTime()));
            stmt.setLong(5, appointment.getCreator().getId());

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    appointment.setId(rs.getLong(1));
                }
            }
            return appointment;
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting appointment", e);
        }
    }

    private Appointment update(Appointment appointment) {
        String sql = "UPDATE appointment SET title = ?, type = ?, location = ?, date_time = ? WHERE id = ?";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, appointment.getTitle());
            stmt.setString(2, appointment.getType());
            stmt.setString(3, appointment.getLocation());
            stmt.setTimestamp(4, Timestamp.valueOf(appointment.getDateTime()));
            stmt.setLong(5, appointment.getId());

            stmt.executeUpdate();
            return appointment;
        } catch (SQLException e) {
            throw new RuntimeException("Error updating appointment", e);
        }
    }

    public Optional<Appointment> findById(Long id) {
        String sql = "SELECT * FROM appointment WHERE id = ?";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToAppointment(rs));
                }
                return Optional.empty();
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error fetching appointment by ID", e);
        }
    }

    public List<Appointment> findAll() {
        String sql = "SELECT * FROM appointment ORDER BY date_time DESC";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql);
                ResultSet rs = stmt.executeQuery()) {

            List<Appointment> appointments = new ArrayList<>();
            while (rs.next()) {
                appointments.add(mapResultSetToAppointment(rs));
            }
            return appointments;
        } catch (SQLException e) {
            throw new RuntimeException("Error fetching all appointments", e);
        }
    }

    public List<Appointment> findByCreatorId(Long creatorId) {
        String sql = "SELECT * FROM appointment WHERE creator_id = ? ORDER BY date_time DESC";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, creatorId);

            try (ResultSet rs = stmt.executeQuery()) {
                List<Appointment> appointments = new ArrayList<>();
                while (rs.next()) {
                    appointments.add(mapResultSetToAppointment(rs));
                }
                return appointments;
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error fetching appointments by creator", e);
        }
    }

    public void deleteById(Long id) {
        String sql = "DELETE FROM appointment WHERE id = ?";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting appointment", e);
        }
    }

    private Appointment mapResultSetToAppointment(ResultSet rs) throws SQLException {
        Appointment appointment = new Appointment();
        appointment.setId(rs.getLong("id"));
        appointment.setTitle(rs.getString("title"));
        appointment.setType(rs.getString("type"));
        appointment.setLocation(rs.getString("location"));
        appointment.setDateTime(rs.getTimestamp("date_time").toLocalDateTime());

        Long creatorId = rs.getLong("creator_id");
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("Creator not found: " + creatorId));
        appointment.setCreator(creator);

        return appointment;
    }
}
