package it.fithub.fithubspring.dto;

public class LocationDTO {

    private Long id;
    private Double lat;
    private Double lng;
    private String name;
    private String type;
    private String address;
    private Double rating;
    private String warning;

    // Constructors
    public LocationDTO() {
    }

    public LocationDTO(Long id, Double lat, Double lng, String name, String type,
            String address, Double rating, String warning) {
        this.id = id;
        this.lat = lat;
        this.lng = lng;
        this.name = name;
        this.type = type;
        this.address = address;
        this.rating = rating;
        this.warning = warning;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getLat() {
        return lat;
    }

    public void setLat(Double lat) {
        this.lat = lat;
    }

    public Double getLng() {
        return lng;
    }

    public void setLng(Double lng) {
        this.lng = lng;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public String getWarning() {
        return warning;
    }

    public void setWarning(String warning) {
        this.warning = warning;
    }
}
