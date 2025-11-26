package it.fithub.fithubspring.controller;

import it.fithub.fithubspring.dto.LocationDTO;
import it.fithub.fithubspring.service.LocationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@CrossOrigin(origins = "http://localhost:4200") // Angular dev server
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @GetMapping
    public List<LocationDTO> getLocations(
            @RequestParam Double minLat,
            @RequestParam Double maxLat,
            @RequestParam Double minLng,
            @RequestParam Double maxLng,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer zoom) {
        return locationService.getLocationsByBounds(minLat, maxLat, minLng, maxLng, type);
    }
}
