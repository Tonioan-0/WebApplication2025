package it.fithub.fithubspring.repository;

import it.fithub.fithubspring.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {

    @Query("SELECT l FROM Location l WHERE " +
            "l.latitude BETWEEN :minLat AND :maxLat AND " +
            "l.longitude BETWEEN :minLng AND :maxLng AND " +
            "(:type IS NULL OR l.type = :type)")
    List<Location> findByBoundsAndType(
            @Param("minLat") Double minLat,
            @Param("maxLat") Double maxLat,
            @Param("minLng") Double minLng,
            @Param("maxLng") Double maxLng,
            @Param("type") String type);
}
