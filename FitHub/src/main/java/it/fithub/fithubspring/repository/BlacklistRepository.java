package it.fithub.fithubspring.repository;

import it.fithub.fithubspring.domain.Blacklist;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class BlacklistRepository {

    private final DataSource dataSource;

    public BlacklistRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }
    
    //Verifica se un utente è presente nella blacklist tramite userId.
    public Optional<Blacklist> findByUserId(Long userId) {
        String sql = "SELECT * FROM blacklist WHERE user_id = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, userId);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToBlacklist(rs));
                }
                return Optional.empty();
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error finding blacklist entry by userId", e);
        }
    }

    //Verifica se un utente è presente nella blacklist tramite email.
    public Optional<Blacklist> findByEmail(String email) {
        String sql = "SELECT * FROM blacklist WHERE email = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, email);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToBlacklist(rs));
                }
                return Optional.empty();
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error finding blacklist entry by email", e);
        }
    }

    //Salva un nuovo record nella blacklist.
    public Blacklist save(Blacklist blacklist) {
        String sql = "INSERT INTO blacklist (user_id, email, reason, banned_by) VALUES (?, ?, ?, ?) RETURNING id, banned_at";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, blacklist.getUserId());
            stmt.setString(2, blacklist.getEmail());
            stmt.setString(3, blacklist.getReason());
            if (blacklist.getBannedBy() != null) {
                stmt.setLong(4, blacklist.getBannedBy());
            } else {
                stmt.setNull(4, Types.BIGINT);
            }

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    blacklist.setId(rs.getLong("id"));
                    blacklist.setBannedAt(rs.getTimestamp("banned_at").toLocalDateTime());
                }
            }
            return blacklist;
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting blacklist entry", e);
        }
    }

    //Rimuove un utente dalla blacklist.
    public void deleteByUserId(Long userId) {
        String sql = "DELETE FROM blacklist WHERE user_id = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, userId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting blacklist entry", e);
        }
    }

    //Ottiene tutti gli utenti bannati.
    public List<Blacklist> findAll() {
        String sql = "SELECT * FROM blacklist ORDER BY banned_at DESC";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            List<Blacklist> list = new ArrayList<>();
            while (rs.next()) {
                list.add(mapResultSetToBlacklist(rs));
            }
            return list;
        } catch (SQLException e) {
            throw new RuntimeException("Error fetching all blacklist entries", e);
        }
    }

    private Blacklist mapResultSetToBlacklist(ResultSet rs) throws SQLException {
        Blacklist b = new Blacklist();
        b.setId(rs.getLong("id"));
        b.setUserId(rs.getLong("user_id"));
        b.setEmail(rs.getString("email"));
        b.setReason(rs.getString("reason"));
        Timestamp bannedAt = rs.getTimestamp("banned_at");
        if (bannedAt != null) {
            b.setBannedAt(bannedAt.toLocalDateTime());
        }
        long bannedBy = rs.getLong("banned_by");
        if (!rs.wasNull()) {
            b.setBannedBy(bannedBy);
        }
        return b;
    }
}
