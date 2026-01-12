--
-- PostgreSQL database dump
--

\restrict SsQKrfjQwWpTLmcrg9aKGJPkDUMd4O34OL4xxwQ8MzrZ2D7vYcm9h0uB1EEcCl0

-- Dumped from database version 16.11
-- Dumped by pg_dump version 18.1 (Debian 18.1-2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.notification DROP CONSTRAINT IF EXISTS notification_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.friend_request DROP CONSTRAINT IF EXISTS friend_request_sender_id_fkey;
ALTER TABLE IF EXISTS ONLY public.friend_request DROP CONSTRAINT IF EXISTS friend_request_receiver_id_fkey;
ALTER TABLE IF EXISTS ONLY public.appointment DROP CONSTRAINT IF EXISTS appointment_creator_id_fkey;
DROP INDEX IF EXISTS public.idx_notification_user_read;
DROP INDEX IF EXISTS public.idx_notification_timestamp;
DROP INDEX IF EXISTS public.idx_location_type;
DROP INDEX IF EXISTS public.idx_location_search_vector;
DROP INDEX IF EXISTS public.idx_location_coords;
DROP INDEX IF EXISTS public.idx_friend_request_users;
DROP INDEX IF EXISTS public.idx_friend_request_status;
DROP INDEX IF EXISTS public.idx_friend_request_receiver;
DROP INDEX IF EXISTS public.idx_appointment_datetime;
DROP INDEX IF EXISTS public.idx_appointment_creator;
ALTER TABLE IF EXISTS ONLY public.notification DROP CONSTRAINT IF EXISTS notification_pkey;
ALTER TABLE IF EXISTS ONLY public.location DROP CONSTRAINT IF EXISTS location_pkey;
ALTER TABLE IF EXISTS ONLY public.friend_request DROP CONSTRAINT IF EXISTS friend_request_pkey;
ALTER TABLE IF EXISTS ONLY public.appointment DROP CONSTRAINT IF EXISTS appointment_pkey;
ALTER TABLE IF EXISTS ONLY public.app_user DROP CONSTRAINT IF EXISTS app_user_username_key;
ALTER TABLE IF EXISTS ONLY public.app_user DROP CONSTRAINT IF EXISTS app_user_pkey;
ALTER TABLE IF EXISTS ONLY public.app_user DROP CONSTRAINT IF EXISTS app_user_email_key;
ALTER TABLE IF EXISTS public.notification ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.location ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.friend_request ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.appointment ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.app_user ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.notification_id_seq;
DROP TABLE IF EXISTS public.notification;
DROP SEQUENCE IF EXISTS public.location_id_seq;
DROP TABLE IF EXISTS public.location;
DROP SEQUENCE IF EXISTS public.friend_request_id_seq;
DROP TABLE IF EXISTS public.friend_request;
DROP SEQUENCE IF EXISTS public.appointment_id_seq;
DROP TABLE IF EXISTS public.appointment;
DROP SEQUENCE IF EXISTS public.app_user_id_seq;
DROP TABLE IF EXISTS public.app_user;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: app_user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.app_user (
    id bigint NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255)
);


ALTER TABLE public.app_user OWNER TO postgres;

--
-- Name: app_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.app_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.app_user_id_seq OWNER TO postgres;

--
-- Name: app_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.app_user_id_seq OWNED BY public.app_user.id;


--
-- Name: appointment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointment (
    id bigint NOT NULL,
    location character varying(255) NOT NULL,
    date_time timestamp without time zone NOT NULL,
    creator_id bigint NOT NULL,
    title character varying(32),
    type character varying(20)
);


ALTER TABLE public.appointment OWNER TO postgres;

--
-- Name: appointment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appointment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointment_id_seq OWNER TO postgres;

--
-- Name: appointment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appointment_id_seq OWNED BY public.appointment.id;


--
-- Name: friend_request; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.friend_request (
    id bigint NOT NULL,
    sender_id bigint NOT NULL,
    receiver_id bigint NOT NULL,
    status character varying(50) DEFAULT 'PENDING'::character varying NOT NULL,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.friend_request OWNER TO postgres;

--
-- Name: friend_request_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.friend_request_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.friend_request_id_seq OWNER TO postgres;

--
-- Name: friend_request_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.friend_request_id_seq OWNED BY public.friend_request.id;


--
-- Name: location; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.location (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(50) NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    address character varying(500) NOT NULL,
    rating double precision NOT NULL,
    warning text,
    search_vector tsvector GENERATED ALWAYS AS ((setweight(to_tsvector('italian'::regconfig, (COALESCE(name, ''::character varying))::text), 'A'::"char") || setweight(to_tsvector('italian'::regconfig, (COALESCE(address, ''::character varying))::text), 'B'::"char"))) STORED
);


ALTER TABLE public.location OWNER TO postgres;

--
-- Name: location_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.location_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.location_id_seq OWNER TO postgres;

--
-- Name: location_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.location_id_seq OWNED BY public.location.id;


--
-- Name: notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    message character varying(500) NOT NULL,
    type character varying(50) NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notification OWNER TO postgres;

--
-- Name: notification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notification_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notification_id_seq OWNER TO postgres;

--
-- Name: notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notification_id_seq OWNED BY public.notification.id;


--
-- Name: app_user id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_user ALTER COLUMN id SET DEFAULT nextval('public.app_user_id_seq'::regclass);


--
-- Name: appointment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment ALTER COLUMN id SET DEFAULT nextval('public.appointment_id_seq'::regclass);


--
-- Name: friend_request id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friend_request ALTER COLUMN id SET DEFAULT nextval('public.friend_request_id_seq'::regclass);


--
-- Name: location id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location ALTER COLUMN id SET DEFAULT nextval('public.location_id_seq'::regclass);


--
-- Name: notification id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification ALTER COLUMN id SET DEFAULT nextval('public.notification_id_seq'::regclass);


--
-- Data for Name: app_user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.app_user (id, username, email, password) FROM stdin;
1	Marco Rossi	marco@fithub.com	password123
2	Giulia Bianchi	giulia@fithub.com	password123
\.


--
-- Data for Name: appointment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointment (id, location, date_time, creator_id, title, type) FROM stdin;
4	Colle Oppio Park	2028-01-13 11:00:00	1	\N	\N
2	41.850703, 12.522569	2026-01-12 09:00:00	1	\N	\N
5	Pantheon Gym & Spa	2026-01-11 09:00:00	1	fr	STRENGTH
\.


--
-- Data for Name: friend_request; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.friend_request (id, sender_id, receiver_id, status, "timestamp") FROM stdin;
1	2	1	ACCEPTED	2026-01-10 17:29:14.319583
\.


--
-- Data for Name: location; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.location (id, name, type, latitude, longitude, address, rating, warning) FROM stdin;
1	FitHub Central Gym	gym	41.902782	12.496366	Via del Corso, 1, Roma	4.8	\N
2	Colosseum Fitness	gym	41.8986	12.5083	Piazza del Colosseo, 1, Roma	4.5	Lat Machine broken
3	Pantheon Gym & Spa	gym	41.907	12.475	Piazza della Rotonda, Roma	4.9	\N
4	Trastevere CrossFit	gym	41.889	12.471	Via della Lungaretta, Roma	4.6	\N
5	Testaccio Boxing Club	gym	41.8765	12.478	Via Galvani, Roma	4.7	Dips Bar broken
6	Prati Fitness Center	gym	41.9065	12.4565	Via Cola di Rienzo, Roma	4.4	\N
7	Esquilino Gym	gym	41.8955	12.501	Via Cavour, Roma	4.3	\N
8	Monti Strength Studio	gym	41.8945	12.492	Via dei Serpenti, Roma	4.8	\N
9	Termini Wellness	gym	41.901	12.5025	Via Marsala, Roma	4.2	Pull-up bar needs maintenance
10	Campo de Fiori Gym	gym	41.8954	12.4724	Piazza Campo de Fiori, Roma	4.5	\N
11	Villa Borghese Park	park	41.9109	12.4818	Piazzale Napoleone I, Roma	4.7	\N
12	Trastevere Workout Park	park	41.8929	12.4825	Piazza di Santa Maria, Roma	4.3	\N
13	Aventine Hill Park	park	41.885	12.488	Via di Santa Sabina, Roma	4.6	Running track under repair
14	Villa Pamphili	park	41.885	12.45	Via Aurelia Antica, Roma	4.8	\N
15	Villa Ada Park	park	41.9325	12.5	Via Salaria, Roma	4.7	\N
16	Parco degli Acquedotti	park	41.855	12.545	Via Lemonia, Roma	4.9	\N
17	Colle Oppio Park	park	41.8925	12.4975	Viale del Monte Oppio, Roma	4.4	\N
18	Parco della Caffarella	park	41.855	12.515	Via della Caffarella, Roma	4.6	\N
19	Villa Torlonia	park	41.915	12.508	Via Nomentana, Roma	4.5	\N
20	Parco di Villa Glori	park	41.928	12.475	Piazzale del Partigiano, Roma	4.4	\N
\.


--
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification (id, user_id, message, type, is_read, "timestamp") FROM stdin;
4	2	Marco Rossi has created a new appointment at de.	NEW_APPOINTMENT	f	2026-01-10 23:31:36.519538
6	2	Marco Rossi has created a new appointment at 41.850703, 12.522569.	NEW_APPOINTMENT	f	2026-01-11 00:40:49.01477
8	2	Marco Rossi has created a new appointment at Colle Oppio Park.	NEW_APPOINTMENT	f	2026-01-11 00:56:21.649501
10	1	Marco Rossi has sent you a friend request.	FRIEND_REQUEST	f	2026-01-11 01:31:59.597735
11	1	Marco Rossi has sent you a friend request.	FRIEND_REQUEST	t	2026-01-11 01:32:00.581474
\.


--
-- Name: app_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.app_user_id_seq', 7, true);


--
-- Name: appointment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.appointment_id_seq', 10, true);


--
-- Name: friend_request_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.friend_request_id_seq', 9, true);


--
-- Name: location_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.location_id_seq', 20, true);


--
-- Name: notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notification_id_seq', 12, true);


--
-- Name: app_user app_user_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_user_email_key UNIQUE (email);


--
-- Name: app_user app_user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_user_pkey PRIMARY KEY (id);


--
-- Name: app_user app_user_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_user_username_key UNIQUE (username);


--
-- Name: appointment appointment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT appointment_pkey PRIMARY KEY (id);


--
-- Name: friend_request friend_request_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friend_request
    ADD CONSTRAINT friend_request_pkey PRIMARY KEY (id);


--
-- Name: location location_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location
    ADD CONSTRAINT location_pkey PRIMARY KEY (id);


--
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- Name: idx_appointment_creator; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointment_creator ON public.appointment USING btree (creator_id);


--
-- Name: idx_appointment_datetime; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointment_datetime ON public.appointment USING btree (date_time DESC);


--
-- Name: idx_friend_request_receiver; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_friend_request_receiver ON public.friend_request USING btree (receiver_id);


--
-- Name: idx_friend_request_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_friend_request_status ON public.friend_request USING btree (status);


--
-- Name: idx_friend_request_users; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_friend_request_users ON public.friend_request USING btree (sender_id, receiver_id);


--
-- Name: idx_location_coords; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_location_coords ON public.location USING btree (latitude, longitude);


--
-- Name: idx_location_search_vector; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_location_search_vector ON public.location USING gin (search_vector);


--
-- Name: idx_location_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_location_type ON public.location USING btree (type);


--
-- Name: idx_notification_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notification_timestamp ON public.notification USING btree ("timestamp" DESC);


--
-- Name: idx_notification_user_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notification_user_read ON public.notification USING btree (user_id, is_read);


--
-- Name: appointment appointment_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT appointment_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.app_user(id) ON DELETE CASCADE;


--
-- Name: friend_request friend_request_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friend_request
    ADD CONSTRAINT friend_request_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.app_user(id) ON DELETE CASCADE;


--
-- Name: friend_request friend_request_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friend_request
    ADD CONSTRAINT friend_request_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.app_user(id) ON DELETE CASCADE;


--
-- Name: notification notification_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_user(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict SsQKrfjQwWpTLmcrg9aKGJPkDUMd4O34OL4xxwQ8MzrZ2D7vYcm9h0uB1EEcCl0

