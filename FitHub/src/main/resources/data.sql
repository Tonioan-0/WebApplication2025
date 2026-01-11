-- Sample location data for Rome
-- Gyms
INSERT INTO location (name, type, latitude, longitude, address, rating, warning) VALUES
('FitHub Central Gym', 'gym', 41.902782, 12.496366, 'Via del Corso, 1, Roma', 4.8, NULL),
('Colosseum Fitness', 'gym', 41.8986, 12.5083, 'Piazza del Colosseo, 1, Roma', 4.5, 'Lat Machine broken'),
('Pantheon Gym & Spa', 'gym', 41.9070, 12.4750, 'Piazza della Rotonda, Roma', 4.9, NULL),
('Trastevere CrossFit', 'gym', 41.8890, 12.4710, 'Via della Lungaretta, Roma', 4.6, NULL),
('Testaccio Boxing Club', 'gym', 41.8765, 12.4780, 'Via Galvani, Roma', 4.7, 'Dips Bar broken'),
('Prati Fitness Center', 'gym', 41.9065, 12.4565, 'Via Cola di Rienzo, Roma', 4.4, NULL),
('Esquilino Gym', 'gym', 41.8955, 12.5010, 'Via Cavour, Roma', 4.3, NULL),
('Monti Strength Studio', 'gym', 41.8945, 12.4920, 'Via dei Serpenti, Roma', 4.8, NULL),
('Termini Wellness', 'gym', 41.9010, 12.5025, 'Via Marsala, Roma', 4.2, 'Pull-up bar needs maintenance'),
('Campo de Fiori Gym', 'gym', 41.8954, 12.4724, 'Piazza Campo de Fiori, Roma', 4.5, NULL);

-- Parks
INSERT INTO location (name, type, latitude, longitude, address, rating, warning) VALUES
('Villa Borghese Park', 'park', 41.9109, 12.4818, 'Piazzale Napoleone I, Roma', 4.7, NULL),
('Trastevere Workout Park', 'park', 41.8929, 12.4825, 'Piazza di Santa Maria, Roma', 4.3, NULL),
('Aventine Hill Park', 'park', 41.8850, 12.4880, 'Via di Santa Sabina, Roma', 4.6, 'Running track under repair'),
('Villa Pamphili', 'park', 41.8850, 12.4500, 'Via Aurelia Antica, Roma', 4.8, NULL),
('Villa Ada Park', 'park', 41.9325, 12.5000, 'Via Salaria, Roma', 4.7, NULL),
('Parco degli Acquedotti', 'park', 41.8550, 12.5450, 'Via Lemonia, Roma', 4.9, NULL),
('Colle Oppio Park', 'park', 41.8925, 12.4975, 'Viale del Monte Oppio, Roma', 4.4, NULL),
('Parco della Caffarella', 'park', 41.8550, 12.5150, 'Via della Caffarella, Roma', 4.6, NULL),
('Villa Torlonia', 'park', 41.9150, 12.5080, 'Via Nomentana, Roma', 4.5, NULL),
('Parco di Villa Glori', 'park', 41.9280, 12.4750, 'Piazzale del Partigiano, Roma', 4.4, NULL);

-- Users (password is 'password123' hashed - for testing we use plain text)
INSERT INTO app_user (id, username, email) VALUES
(1, 'Marco Rossi', 'marco@fithub.com'),
(2, 'Giulia Bianchi', 'giulia@fithub.com'),
(3, 'Alessandro Verdi', 'alessandro@fithub.com'),
(4, 'Sara Romano', 'sara@fithub.com')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence to avoid conflicts
SELECT setval('app_user_id_seq', (SELECT MAX(id) FROM app_user));

-- Friend request from Giulia to Marco (pending)
INSERT INTO friend_request (sender_id, receiver_id, status, timestamp) VALUES
(2, 1, 'PENDING', NOW())
ON CONFLICT DO NOTHING;

-- Already accepted friendship between Marco and Alessandro
INSERT INTO friend_request (sender_id, receiver_id, status, timestamp) VALUES
(1, 3, 'ACCEPTED', NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- Appointment created by Marco (User 1) with Giulia (User 2) at Colle Oppio Park
INSERT INTO appointment (location, date_time, creator_id) VALUES
('Colle Oppio Park', NOW() + INTERVAL '2 days', 1)
ON CONFLICT DO NOTHING;
