package it.fithub.fithubspring.controller;

import it.fithub.fithubspring.domain.User;
import it.fithub.fithubspring.dto.LocationDTO;
import it.fithub.fithubspring.service.LocationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.List;

@RestController
@RequestMapping("/api/locations")
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

    @GetMapping("/search")
    public List<LocationDTO> searchLocations(@RequestParam String q) {
        return locationService.searchLocations(q);
    }

    @PostMapping
    public ResponseEntity<?> createLocation(@RequestBody LocationDTO locationDTO, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }
        if (!Boolean.TRUE.equals(user.getIsAdmin())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can add global locations");
        }
        LocationDTO created = locationService.createLocation(locationDTO);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}/warning")
    public ResponseEntity<?> addWarning(@PathVariable Long id, @RequestBody String warning, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }
        if (!Boolean.TRUE.equals(user.getIsAdmin())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can add warnings");
        }
        locationService.addWarning(id, warning);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/warning")
    public ResponseEntity<?> removeWarning(@PathVariable Long id, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }
        if (!Boolean.TRUE.equals(user.getIsAdmin())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can remove warnings");
        }
        locationService.removeWarning(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public void deleteLocation(@PathVariable Long id) {
        locationService.deleteLocation(id);
    }
}
