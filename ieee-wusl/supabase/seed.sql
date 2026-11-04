-- ============================================================
-- IEEE WUSL — Comprehensive Database Seed Data
-- ============================================================

-- 1. SITE SETTINGS
INSERT INTO public.site_settings (key, value, description) VALUES
  ('university_name', '"Wayamba University of Sri Lanka"', 'Full university title'),
  ('tagline', '"Advancing Technology for Humanity at Wayamba University"', 'Official Branch Tagline'),
  ('contact_email', '"ieee.wusl@gmail.com"', 'Main branch email address'),
  ('contact_phone', '"+94 37 228 1414"', 'Contact phone number'),
  ('address', '"Faculty of Applied Sciences, Wayamba University of Sri Lanka, Kuliyapitiya, Sri Lanka"', 'Physical postal address'),
  ('branch_founded', '"2021"', 'Year the student branch was established'),
  ('stat_members', '140', 'Active registered student members'),
  ('stat_events', '48', 'Total technical and professional events hosted'),
  ('stat_chapters', '4', 'Number of student chapters and affinity groups'),
  ('stat_projects', '18', 'Student engineering projects developed'),
  ('social_linkedin', '"https://www.linkedin.com/company/ieee-wusl"', 'Official LinkedIn page'),
  ('social_facebook', '"https://www.facebook.com/ieeewusl"', 'Official Facebook page'),
  ('social_instagram', '"https://www.instagram.com/ieee_wusl"', 'Official Instagram page'),
  ('social_twitter', '"https://twitter.com/ieee_wusl"', 'Official Twitter/X page'),
  ('social_youtube', '"https://www.youtube.com/@ieeewusl"', 'Official YouTube channel')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Clean existing demo rows to avoid duplicate key errors on re-runs
TRUNCATE TABLE public.gallery_images, public.gallery_albums, public.projects, public.events, public.team_members, public.chapters, public.committee_terms CASCADE;

-- 2. COMMITTEE TERMS
INSERT INTO public.committee_terms (id, label, start_year, end_year, is_current) VALUES
  ('11111111-1111-1111-1111-111111111111', '2024/2025', 2024, 2025, TRUE),
  ('22222222-2222-2222-2222-222222222222', '2023/2024', 2023, 2024, FALSE)
ON CONFLICT (id) DO NOTHING;

-- 3. TECHNICAL CHAPTERS & AFFINITY GROUPS
INSERT INTO public.chapters (id, name, slug, short_desc, description, website_url, founded_year, status, display_order) VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    'Computer Society Student Branch Chapter',
    'computer-society',
    'Fostering algorithmic excellence, software development, cloud computing, and AI innovation.',
    'The IEEE Computer Society Student Branch Chapter of Wayamba University of Sri Lanka empowers undergraduates through technical workshops, code camps, software hackathons, and industry mentorship programs in machine learning, cloud architectures, cybersecurity, and open-source software.',
    'https://www.computer.org',
    2022,
    'published',
    1
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'Robotics & Automation Society Chapter',
    'robotics-automation',
    'Exploring robotics, embedded systems, microcontrollers, and automation technologies.',
    'The IEEE RAS Chapter at WUSL provides students with hands-on exposure to microcontrollers, ROS (Robot Operating System), autonomous navigation, computer vision, and industrial automation through practical hardware workshops and regional robotics competitions.',
    'https://www.ieee-ras.org',
    2023,
    'published',
    2
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    'Women in Engineering Affinity Group',
    'women-in-engineering',
    'Inspiring, empowering, and advocating for women in STEM and leadership roles.',
    'IEEE WIE at Wayamba University connects and inspires female engineers, computer scientists, and technologists. The affinity group organizes leadership forums, school outreach initiatives, career mentorship, and technical bootcamps to foster diversity and equity across technology.',
    'https://wie.ieee.org',
    2022,
    'published',
    3
  ),
  (
    'a4444444-4444-4444-4444-444444444444',
    'Power & Energy Society Chapter',
    'power-energy',
    'Advancing sustainable energy, smart grids, electrical systems, and green innovation.',
    'IEEE PES WUSL focuses on the technical challenges and sustainable engineering paradigms of power systems, renewable energy integration, battery storage technologies, and smart grid automation through expert seminars and industrial field visits.',
    'https://www.ieee-pes.org',
    2024,
    'published',
    4
  )
ON CONFLICT (id) DO NOTHING;

-- 4. EXECUTIVE COMMITTEE MEMBERS (2024/2025)
INSERT INTO public.team_members (full_name, role_title, bio, email, linkedin_url, display_order, is_active, term_id, status) VALUES
  (
    'Praveen Wijesinghe',
    'Chairperson',
    'Final-year undergraduate passionate about distributed systems, cloud computing, and technology community building.',
    'chair.ieee.wusl@gmail.com',
    'https://www.linkedin.com',
    1,
    TRUE,
    '11111111-1111-1111-1111-111111111111',
    'published'
  ),
  (
    'Sanali Jayawardena',
    'Vice Chairperson',
    'Electronics enthusiast focusing on IoT architectures, embedded firmware, and student research mentorship.',
    'vicechair.ieee.wusl@gmail.com',
    'https://www.linkedin.com',
    2,
    TRUE,
    '11111111-1111-1111-1111-111111111111',
    'published'
  ),
  (
    'Kavindu Bandara',
    'Secretary',
    'Dedicated to organizational excellence, technical communication, and student chapter documentation.',
    'secretary.ieee.wusl@gmail.com',
    'https://www.linkedin.com',
    3,
    TRUE,
    '11111111-1111-1111-1111-111111111111',
    'published'
  ),
  (
    'Dulmini Rathnayake',
    'Assistant Secretary',
    'Active volunteer coordinate event logistics, internal communication, and member relations.',
    'asstsec.ieee.wusl@gmail.com',
    'https://www.linkedin.com',
    4,
    TRUE,
    '11111111-1111-1111-1111-111111111111',
    'published'
  ),
  (
    'Minosh Fernando',
    'Treasurer',
    'Overseeing budget governance, financial accountability, and sponsorship management for branch initiatives.',
    'treasurer.ieee.wusl@gmail.com',
    'https://www.linkedin.com',
    5,
    TRUE,
    '11111111-1111-1111-1111-111111111111',
    'published'
  ),
  (
    'Heshan Wickramasinghe',
    'Lead Webmaster',
    'Full-stack software engineer managing digital platforms, developer outreach, and branch web architectures.',
    'webmaster.ieee.wusl@gmail.com',
    'https://www.linkedin.com',
    6,
    TRUE,
    '11111111-1111-1111-1111-111111111111',
    'published'
  ),
  (
    'Chathuni Senaratne',
    'Editor',
    'Managing publications, technical newsletters, digital branding, and social media storytelling.',
    'editor.ieee.wusl@gmail.com',
    'https://www.linkedin.com',
    7,
    TRUE,
    '11111111-1111-1111-1111-111111111111',
    'published'
  ),
  (
    'Thilina Ranasinghe',
    'Event Coordinator',
    'Planning and executing technical symposiums, hackathons, and guest lectures across the university.',
    'events.ieee.wusl@gmail.com',
    'https://www.linkedin.com',
    8,
    TRUE,
    '11111111-1111-1111-1111-111111111111',
    'published'
  );

-- 5. EVENTS
INSERT INTO public.events (title, slug, summary, description, category, start_at, end_at, venue, is_online, meeting_url, registration_url, organizer, chapter_id, status, featured) VALUES
  (
    'HackWayamba 2025: 24-Hour National Hackathon',
    'hackwayamba-2025',
    'The premier inter-university 24-hour software and hardware hackathon challenging students to solve national sustainability issues.',
    'HackWayamba 2025 brings together over 40 undergraduate engineering and computing teams from across Sri Lanka to build novel technological solutions addressing clean energy, healthcare logistics, and precision agriculture. Teams will pitch directly to industry tech executives and venture founders.',
    'hackathon',
    '2025-04-18 09:00:00+05:30',
    '2025-04-19 12:00:00+05:30',
    'Faculty of Applied Sciences Auditorium, Kuliyapitiya',
    FALSE,
    NULL,
    'https://forms.gle/hackwayamba2025',
    'IEEE WUSL Student Branch & Computer Society Chapter',
    'a1111111-1111-1111-1111-111111111111',
    'published',
    TRUE
  ),
  (
    'Hands-on Autonomous Robotics with ROS 2',
    'hands-on-robotics-ros2',
    'A deep-dive technical workshop on robot simulation, LIDAR mapping, and path planning using ROS 2 Humble.',
    'In this comprehensive hands-on workshop, participants will configure workspace packages, simulate differential-drive mobile robots in Gazebo, implement SLAM algorithms with 2D LIDAR, and test navigation stacks.',
    'workshop',
    '2025-03-12 14:00:00+05:30',
    '2025-03-12 18:00:00+05:30',
    'Hardware & Embedded Systems Lab 02',
    FALSE,
    NULL,
    'https://forms.gle/ros2workshop',
    'IEEE RAS Chapter WUSL',
    'a2222222-2222-2222-2222-222222222222',
    'published',
    TRUE
  ),
  (
    'Breaking Barriers: Women in Tech Leadership Summit',
    'women-in-tech-leadership-summit',
    'An inspiring interactive symposium featuring leading female engineering leaders from global software and telecommunications firms.',
    'Featuring keynote talks, career transition panel discussions, and an intimate Q&A session with chief technology officers and engineering managers discussing diversity, imposter syndrome, and career growth in Sri Lanka and abroad.',
    'seminar',
    '2025-03-28 10:00:00+05:30',
    '2025-03-28 13:00:00+05:30',
    'Virtual Stream & Main University Boardroom',
    TRUE,
    'https://zoom.us/j/ieeewuslwie',
    'https://forms.gle/wiesummit2025',
    'IEEE WIE Affinity Group WUSL',
    'a3333333-3333-3333-3333-333333333333',
    'published',
    TRUE
  ),
  (
    'Microgrid Systems & Renewable Integration Webinar',
    'microgrid-systems-renewable-webinar',
    'Technical webinar analyzing hybrid solar-storage grid tie inverter systems with senior power engineers.',
    'A specialized lecture focusing on high-penetration solar PV integration into national transmission systems, active frequency control, and battery energy storage management architectures.',
    'webinar',
    '2025-02-20 18:30:00+05:30',
    '2025-02-20 20:30:00+05:30',
    'Google Meet',
    TRUE,
    'https://meet.google.com/ieee-pes-wusl',
    'https://forms.gle/peswebinar',
    'IEEE PES Chapter WUSL',
    'a4444444-4444-4444-4444-444444444444',
    'published',
    FALSE
  );

-- 6. STUDENT ENGINEERING PROJECTS
INSERT INTO public.projects (title, slug, summary, description, cover_url, members, start_date, end_date, github_url, demo_url, chapter_id, status, featured, tags) VALUES
  (
    'AgroSense: Distributed IoT Microclimate & Irrigation System',
    'agrosense-iot-microclimate',
    'An automated, low-cost precision irrigation system for Sri Lankan smallholders using LoRaWAN sensor nodes and edge intelligence.',
    'AgroSense leverages ESP32 microcontrollers, capacitance soil moisture sensors, and LoRaWAN long-range telemetry to monitor crop conditions across coconut and vegetable farmlands in the North Western Province. Data is aggregated on an open-source telemetry dashboard powered by Next.js and Supabase, driving automated pump scheduling.',
    'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80',
    ARRAY['Praveen Wijesinghe', 'Kavindu Bandara', 'Sachintha Gamage'],
    'Jan 2024',
    'Nov 2024',
    'https://github.com/ieee-wusl/agrosense-iot',
    'https://agrosense-demo.ieee-wusl.org',
    'a1111111-1111-1111-1111-111111111111',
    'published',
    TRUE,
    ARRAY['IoT', 'ESP32', 'LoRaWAN', 'Embedded C++', 'Next.js', 'PostgreSQL']
  ),
  (
    'PathFinder: Autonomous 2D SLAM Robot for Disaster Search',
    'pathfinder-autonomous-slam-robot',
    'A tracked rescue rover featuring RPLIDAR A1, ROS 2 Nav2 stack, and thermal imaging payload for collapsed structure reconnaissance.',
    'PathFinder is built to explore GPS-denied environments. Powered by an onboard NVIDIA Jetson Nano and differential drive tracked chassis, it generates real-time occupancy grid maps and streams thermal camera telemetry to emergency first responders.',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    ARRAY['Sanali Jayawardena', 'Thilina Ranasinghe', 'Janaka Alwis'],
    'May 2024',
    'Dec 2024',
    'https://github.com/ieee-wusl/pathfinder-ros2',
    'https://youtu.be/pathfinder-demo',
    'a2222222-2222-2222-2222-222222222222',
    'published',
    TRUE,
    ARRAY['Robotics', 'ROS 2', 'LIDAR', 'Computer Vision', 'Python', 'SolidWorks']
  ),
  (
    'SignBridge: Real-time Sinhala Sign Language AI Interpreter',
    'signbridge-sinhala-sign-language',
    'A computer vision system converting Sinhala sign language gestures into audible speech and real-time captions.',
    'Developed to improve educational accessibility for hearing-impaired children, SignBridge captures skeletal hand landmarks via MediaPipe and classifies dynamic sign phrases with high accuracy using a lightweight LSTM neural network capable of running on low-resource mobile devices.',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    ARRAY['Chathuni Senaratne', 'Dulmini Rathnayake'],
    'Jun 2024',
    'Jan 2025',
    'https://github.com/ieee-wusl/signbridge-ai',
    'https://signbridge.ieee-wusl.org',
    'a3333333-3333-3333-3333-333333333333',
    'published',
    TRUE,
    ARRAY['Machine Learning', 'TensorFlow', 'MediaPipe', 'Accessibility', 'Python']
  );

-- 7. NEWS & ANNOUNCEMENTS
INSERT INTO public.news_articles (title, slug, summary, content, author_name, status, published_at, featured, tags) VALUES
  (
    'IEEE WUSL Wins Top Student Branch Exemplary Award 2024',
    'ieee-wusl-wins-exemplary-award-2024',
    'Recognized for exceptional student engagement, impactful technical workshops, and innovative community development projects.',
    'We are thrilled to announce that the IEEE Student Branch of Wayamba University of Sri Lanka was conferred the prestigious IEEE Sri Lanka Section Exemplary Student Branch Award at the Annual General Meeting held in Colombo.\n\nOver the past 12 months, our branch organized over 35 technical and community events, supported 140+ active members, and expanded our active student chapters with IEEE PES and RAS. We extend our warmest appreciation to our dedicated executive committee, chapter leads, and faculty advisor for making this historic achievement possible.',
    'Editorial Board',
    'published',
    '2024-12-15 10:00:00+05:30',
    TRUE,
    ARRAY['Awards', 'Branch News', 'Achievements']
  ),
  (
    'Call for Submissions: HackWayamba 2025 Problem Statements',
    'call-for-submissions-hackwayamba-2025',
    'Submit your industry and community problem statements for the upcoming HackWayamba national hackathon.',
    'The organizing committee of HackWayamba 2025 invites academics, local agricultural cooperatives, healthcare practitioners, and tech startups to submit domain challenges for student hackathon teams.\n\nAll selected challenge statements will be tackled by undergraduate teams who will formulate proof-of-concept prototypes within 24 hours of intense sprint development.',
    'Praveen Wijesinghe',
    'published',
    '2025-01-10 14:30:00+05:30',
    FALSE,
    ARRAY['HackWayamba', 'Call For Participation', 'Innovation']
  ),
  (
    'IEEE Computer Society Chapter Launches Weekly Algorithm Labs',
    'computer-society-weekly-algorithm-labs',
    'Competitive programming, algorithmic problem solving, and LeetCode preparation sessions every Wednesday.',
    'To prepare students for international collegiate programming competitions such as IEEEXtreme and technical software engineering interviews, the IEEE Computer Society Chapter is hosting weekly interactive algorithm masterclasses every Wednesday afternoon.\n\nTopics will range from dynamic programming and graph theory to efficient data structure implementations in C++ and Python.',
    'Kavindu Bandara',
    'published',
    '2025-01-20 09:00:00+05:30',
    FALSE,
    ARRAY['Computer Society', 'Algorithms', 'IEEEXtreme']
  );

-- 8. PHOTO GALLERY ALBUMS & SAMPLES
INSERT INTO public.gallery_albums (id, title, slug, description, cover_url, event_date, status, display_order) VALUES
  (
    'b1111111-1111-1111-1111-111111111111',
    'IEEE WUSL Annual General Meeting 2024',
    'agm-2024',
    'Election of the 2024/2025 Executive Committee, annual progress review, and celebrating branch milestones with members and faculty.',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    '2024-11-20',
    'published',
    1
  ),
  (
    'b2222222-2222-2222-2222-222222222222',
    'RoboSprint: Inter-Faculty Line Following Competition',
    'robosprint-2024',
    'Action-packed moments from our annual student robotics race where over 25 custom robotic rovers tackled high-speed tracks.',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
    '2024-10-05',
    'published',
    2
  ),
  (
    'b3333333-3333-3333-3333-333333333333',
    'WIE STEM Outreach to Rural Schools',
    'wie-stem-outreach-2024',
    'Inspiring high school students in Kuliyapitiya with introductory coding, electronic circuit kits, and career talks.',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
    '2024-09-14',
    'published',
    3
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.gallery_images (album_id, url, storage_path, alt_text, caption, display_order) VALUES
  (
    'b1111111-1111-1111-1111-111111111111',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    'gallery/agm1.jpg',
    'AGM 2024 Opening Ceremony',
    'Lighting of the traditional oil lamp at AGM 2024',
    1
  ),
  (
    'b1111111-1111-1111-1111-111111111111',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    'gallery/agm2.jpg',
    'Executive committee oath taking',
    'Newly elected executive committee for 2024/2025',
    2
  ),
  (
    'b2222222-2222-2222-2222-222222222222',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    'gallery/robo1.jpg',
    'Rover on competition track',
    'Custom sensor calibration before the final lap',
    1
  ),
  (
    'b3333333-3333-3333-3333-333333333333',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    'gallery/wie1.jpg',
    'Classroom teaching session',
    'WIE volunteers introducing basic circuits to students',
    1
  );
