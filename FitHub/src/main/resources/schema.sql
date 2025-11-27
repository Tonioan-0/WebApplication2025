-- FitHub Database Schema
-- Pure JDBC implementation - create all tables manually

-- App Users table
CREATE TABLE IF NOT EXISTS app_user (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE
);

-- Locations table (gyms and parks)
CREATE TABLE IF NOT EXISTS location (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address VARCHAR(500) NOT NULL,
    rating DOUBLE PRECISION NOT NULL,
    warning TEXT,
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('italian', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('italian', coalesce(address, '')), 'B')
    ) STORED
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notification (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    message VARCHAR(500) NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Friend requests table
CREATE TABLE IF NOT EXISTS friend_request (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    receiver_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointment (
    id BIGSERIAL PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    date_time TIMESTAMP NOT NULL,
    creator_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_notification_user_read ON notification(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notification_timestamp ON notification(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_friend_request_status ON friend_request(status);
CREATE INDEX IF NOT EXISTS idx_friend_request_users ON friend_request(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_request_receiver ON friend_request(receiver_id);
CREATE INDEX IF NOT EXISTS idx_appointment_creator ON appointment(creator_id);
CREATE INDEX IF NOT EXISTS idx_appointment_datetime ON appointment(date_time DESC);
CREATE INDEX IF NOT EXISTS idx_location_coords ON location(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_location_type ON location(type);

-- Full-Text Search index for locations
CREATE INDEX IF NOT EXISTS idx_location_search_vector ON location USING GIN(search_vector);
