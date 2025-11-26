package it.fithub.fithubspring.service;

import it.fithub.fithubspring.dto.LocationDTO;
import it.fithub.fithubspring.entity.Location;
import it.fithub.fithubspring.repository.LocationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LocationService {

    private final LocationRepository locationRepository;

    public LocationService(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    public List<LocationDTO> getLocationsByBounds(Double minLat, Double maxLat,
            Double minLng, Double maxLng,
            String type) {
        String typeFilter = (type != null && !type.equals("all")) ? type : null;

        List<Location> locations = locationRepository.findByBoundsAndType(
                minLat, maxLat, minLng, maxLng, typeFilter);

        return locations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private LocationDTO convertToDTO(Location location) {
        return new LocationDTO(
                location.getId(),
                location.getLatitude(),
                location.getLongitude(),
                location.getName(),
                location.getType(),
                location.getAddress(),
                location.getRating(),
                location.getWarning());
    }
}
