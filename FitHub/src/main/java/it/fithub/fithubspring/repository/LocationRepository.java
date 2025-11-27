package it.fithub.fithubspring.repository;

import it.fithub.fithubspring.domain.Location;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class LocationRepository {

        private final DataSource dataSource;

        public LocationRepository(DataSource dataSource) {
                this.dataSource = dataSource;
        }

        public List<Location> findByBoundsAndType(Double minLat, Double maxLat,
                        Double minLng, Double maxLng,
                        String type) {
                String sql = "SELECT * FROM location WHERE " +
                                "latitude BETWEEN ? AND ? AND " +
                                "longitude BETWEEN ? AND ? AND " +
                                "(? IS NULL OR type = ?)";

                try (Connection conn = dataSource.getConnection();
                                PreparedStatement stmt = conn.prepareStatement(sql)) {

                        stmt.setDouble(1, minLat);
                        stmt.setDouble(2, maxLat);
                        stmt.setDouble(3, minLng);
                        stmt.setDouble(4, maxLng);
                        stmt.setString(5, type);
                        stmt.setString(6, type);

                        try (ResultSet rs = stmt.executeQuery()) {
                                List<Location> locations = new ArrayList<>();
                                while (rs.next()) {
                                        locations.add(mapResultSetToLocation(rs));
                                }
                                return locations;
                        }
                } catch (SQLException e) {
                        throw new RuntimeException("Error fetching locations by bounds", e);
                }
        }

        public Location save(Location location) {
                if (location.getId() == null) {
                        return insert(location);
                } else {
                        return update(location);
                }
        }

        private Location insert(Location location) {
                String sql = "INSERT INTO location (name, type, latitude, longitude, address, rating, warning) " +
                                "VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id";

                try (Connection conn = dataSource.getConnection();
                                PreparedStatement stmt = conn.prepareStatement(sql)) {

                        stmt.setString(1, location.getName());
                        stmt.setString(2, location.getType());
                        stmt.setDouble(3, location.getLatitude());
                        stmt.setDouble(4, location.getLongitude());
                        stmt.setString(5, location.getAddress());
                        stmt.setDouble(6, location.getRating());
                        stmt.setString(7, location.getWarning());

                        try (ResultSet rs = stmt.executeQuery()) {
                                if (rs.next()) {
                                        location.setId(rs.getLong(1));
                                }
                        }
                        return location;
                } catch (SQLException e) {
                        throw new RuntimeException("Error inserting location", e);
                }
        }

        private Location update(Location location) {
                String sql = "UPDATE location SET name = ?, type = ?, latitude = ?, longitude = ?, " +
                                "address = ?, rating = ?, warning = ? WHERE id = ?";

                try (Connection conn = dataSource.getConnection();
                                PreparedStatement stmt = conn.prepareStatement(sql)) {

                        stmt.setString(1, location.getName());
                        stmt.setString(2, location.getType());
                        stmt.setDouble(3, location.getLatitude());
                        stmt.setDouble(4, location.getLongitude());
                        stmt.setString(5, location.getAddress());
                        stmt.setDouble(6, location.getRating());
                        stmt.setString(7, location.getWarning());
                        stmt.setLong(8, location.getId());

                        stmt.executeUpdate();
                        return location;
                } catch (SQLException e) {
                        throw new RuntimeException("Error updating location", e);
                }
        }

        public Optional<Location> findById(Long id) {
                String sql = "SELECT * FROM location WHERE id = ?";

                try (Connection conn = dataSource.getConnection();
                                PreparedStatement stmt = conn.prepareStatement(sql)) {

                        stmt.setLong(1, id);

                        try (ResultSet rs = stmt.executeQuery()) {
                                if (rs.next()) {
                                        return Optional.of(mapResultSetToLocation(rs));
                                }
                                return Optional.empty();
                        }
                } catch (SQLException e) {
                        throw new RuntimeException("Error fetching location by ID", e);
                }
        }

        public List<Location> findAll() {
                String sql = "SELECT * FROM location";

                try (Connection conn = dataSource.getConnection();
                                PreparedStatement stmt = conn.prepareStatement(sql);
                                ResultSet rs = stmt.executeQuery()) {

                        List<Location> locations = new ArrayList<>();
                        while (rs.next()) {
                                locations.add(mapResultSetToLocation(rs));
                        }
                        return locations;
                } catch (SQLException e) {
                        throw new RuntimeException("Error fetching all locations", e);
                }
        }


        public List<Location> searchLocations(String query) {
                if (query == null || query.trim().isEmpty()) {
                        return new ArrayList<>();
                }

                String tsQuery = String.join(" & ", query.trim().split("\\s+"));

                String sql = "SELECT *, ts_rank(search_vector, to_tsquery('italian', ?)) AS rank " +
                                "FROM location " +
                                "WHERE search_vector @@ to_tsquery('italian', ?) " +
                                "ORDER BY rank DESC, name ASC " +
                                "LIMIT 50";

                try (Connection conn = dataSource.getConnection();
                                PreparedStatement stmt = conn.prepareStatement(sql)) {

                        stmt.setString(1, tsQuery);
                        stmt.setString(2, tsQuery);

                        try (ResultSet rs = stmt.executeQuery()) {
                                List<Location> locations = new ArrayList<>();
                                while (rs.next()) {
                                        locations.add(mapResultSetToLocation(rs));
                                }
                                return locations;
                        }
                } catch (SQLException e) {
                        // If FTS query fails, try simple ILIKE search as fallback
                        return searchWithLike(query);
                }
        }


        private List<Location> searchWithLike(String query) {
                String pattern = "%" + query.trim() + "%";
                String sql = "SELECT * FROM location " +
                                "WHERE LOWER(name) LIKE LOWER(?) " +
                                "OR LOWER(address) LIKE LOWER(?) " +
                                "ORDER BY name ASC LIMIT 50";

                try (Connection conn = dataSource.getConnection();
                                PreparedStatement stmt = conn.prepareStatement(sql)) {

                        stmt.setString(1, pattern);
                        stmt.setString(2, pattern);

                        try (ResultSet rs = stmt.executeQuery()) {
                                List<Location> locations = new ArrayList<>();
                                while (rs.next()) {
                                        locations.add(mapResultSetToLocation(rs));
                                }
                                return locations;
                        }
                } catch (SQLException e) {
                        throw new RuntimeException("Error searching locations", e);
                }
        }

        /**
         * Delete location by ID.
         */
        public void deleteById(Long id) {
                String sql = "DELETE FROM location WHERE id = ?";

                try (Connection conn = dataSource.getConnection();
                                PreparedStatement stmt = conn.prepareStatement(sql)) {

                        stmt.setLong(1, id);
                        stmt.executeUpdate();
                } catch (SQLException e) {
                        throw new RuntimeException("Error deleting location", e);
                }
        }

        private Location mapResultSetToLocation(ResultSet rs) throws SQLException {
                Location location = new Location();
                location.setId(rs.getLong("id"));
                location.setName(rs.getString("name"));
                location.setType(rs.getString("type"));
                location.setLatitude(rs.getDouble("latitude"));
                location.setLongitude(rs.getDouble("longitude"));
                location.setAddress(rs.getString("address"));
                location.setRating(rs.getDouble("rating"));
                location.setWarning(rs.getString("warning"));
                return location;
        }
}
