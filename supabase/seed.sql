-- ============================================
-- Mapify: UIUC Building Seed Data
-- ~80 campus buildings with centroids
-- ============================================

INSERT INTO public.buildings (name, code, latitude, longitude, address) VALUES
-- Engineering Campus
('Siebel Center for Computer Science', 'SC', 40.1138, -88.2249, '201 N Goodwin Ave'),
('Thomas M. Siebel Center for Design', 'SCD', 40.1023, -88.2268, '1208 S Fourth St'),
('Grainger Engineering Library', 'GELIB', 40.1125, -88.2269, '1301 W Springfield Ave'),
('Electrical & Computer Engineering Building', 'ECEB', 40.1149, -88.2280, '306 N Wright St'),
('Digital Computer Laboratory', 'DCL', 40.1131, -88.2265, '1304 W Springfield Ave'),
('Coordinated Science Laboratory', 'CSL', 40.1150, -88.2264, '1308 W Main St'),
('Beckman Institute', 'BECK', 40.1158, -88.2275, '405 N Mathews Ave'),
('Engineering Hall', 'EH', 40.1107, -88.2270, '1308 W Green St'),
('Transportation Building', 'TB', 40.1127, -88.2287, '104 S Mathews Ave'),
('Everitt Laboratory', 'EVER', 40.1109, -88.2286, '1406 W Green St'),
('Talbot Laboratory', 'TALB', 40.1118, -88.2264, '104 S Wright St'),
('Mechanical Engineering Laboratory', 'MEL', 40.1120, -88.2260, '1206 W Green St'),
('Materials Science & Engineering Building', 'MSEB', 40.1115, -88.2255, '1304 W Green St'),
('Newmark Civil Engineering Laboratory', 'NCEL', 40.1135, -88.2268, '205 N Mathews Ave'),
('Hydrosystems Laboratory', 'HYDRO', 40.1140, -88.2256, '301 N Mathews Ave'),
('Loomis Laboratory of Physics', 'LOOM', 40.1100, -88.2320, '1110 W Green St'),
('NCSA Building', 'NCSA', 40.1148, -88.2254, '1205 W Clark St'),
('Micro & Nanotechnology Laboratory', 'MNTL', 40.1136, -88.2280, '208 N Wright St'),
('Nuclear Physics Laboratory', 'NPL', 40.1095, -88.2330, '23 E Stadium Dr'),
('Sidney Lu Mechanical Engineering Building', 'LUMEB', 40.1118, -88.2250, '1206 W Green St'),

-- Science Buildings
('Noyes Laboratory of Chemistry', 'NOYES', 40.1074, -88.2265, '505 S Mathews Ave'),
('Roger Adams Laboratory', 'RAL', 40.1080, -88.2249, '600 S Mathews Ave'),
('Chemical & Life Sciences Laboratory', 'CLSL', 40.1073, -88.2256, '601 S Mathews Ave'),
('Natural History Building', 'NHB', 40.1091, -88.2299, '1301 W Green St'),
('Morrill Hall', 'MORR', 40.1090, -88.2317, '505 S Goodwin Ave'),
('Burrill Hall', 'BURR', 40.1085, -88.2309, '407 S Goodwin Ave'),
('Psychology Building', 'PSYCH', 40.1063, -88.2261, '603 E Daniel St'),
('Turner Hall', 'TURN', 40.1043, -88.2259, '1102 S Goodwin Ave'),
('Madigan Laboratory', 'MADI', 40.1067, -88.2238, '510 E Gregory Dr'),

-- Liberal Arts / Humanities
('Lincoln Hall', 'LH', 40.1067, -88.2282, '702 S Wright St'),
('Foellinger Auditorium', 'FOEL', 40.1060, -88.2272, '709 S Wright St'),
('Altgeld Hall', 'ALT', 40.1094, -88.2284, '1409 W Green St'),
('Gregory Hall', 'GREG', 40.1069, -88.2289, '810 S Wright St'),
('English Building', 'EB', 40.1058, -88.2296, '608 S Wright St'),
('Foreign Languages Building', 'FLB', 40.1062, -88.2303, '707 S Mathews Ave'),
('Davenport Hall', 'DAV', 40.1076, -88.2296, '607 S Mathews Ave'),
('Smith Memorial Hall', 'SMH', 40.1073, -88.2297, '805 S Mathews Ave'),
('David Kinley Hall', 'DKH', 40.1043, -88.2290, '1407 W Gregory Dr'),
('Henry Administration Building', 'HAB', 40.1049, -88.2275, '506 S Wright St'),
('Harker Hall', 'HARK', 40.1086, -88.2276, '1305 W Green St'),
('Illini Hall', 'IH', 40.1101, -88.2276, '725 S Wright St'),
('Coble Hall', 'COB', 40.1090, -88.2290, '801 S Wright St'),

-- Business / LAS
('Business Instructional Facility', 'BIF', 40.1029, -88.2310, '515 E Gregory Dr'),
('Wohlers Hall', 'WOH', 40.1033, -88.2305, '1206 S Sixth St'),

-- Libraries
('Main Library', 'LIB', 40.1047, -88.2284, '1408 W Gregory Dr'),
('Undergraduate Library', 'UGL', 40.1045, -88.2272, '1402 W Gregory Dr'),

-- Campus Life
('Illini Union', 'IU', 40.1092, -88.2273, '1401 W Green St'),
('Krannert Center for Performing Arts', 'KCPA', 40.1081, -88.2223, '500 S Goodwin Ave'),
('Spurlock Museum', 'SPUR', 40.1078, -88.2222, '600 S Gregory St'),
('Swanlund Administration Building', 'SWAN', 40.1065, -88.2268, '601 E John St'),

-- Agriculture / ACES
('Mumford Hall', 'MUM', 40.1033, -88.2266, '1301 W Gregory Dr'),
('Bevier Hall', 'BEV', 40.1038, -88.2279, '905 S Goodwin Ave'),
('ACES Library', 'ACES', 40.1024, -88.2274, '1101 S Goodwin Ave'),
('Animal Sciences Laboratory', 'ASL', 40.1020, -88.2227, '1207 W Gregory Dr'),
('Plant Sciences Laboratory', 'PSL', 40.1015, -88.2234, '1201 S Dorner Dr'),
('Agricultural Engineering Sciences Building', 'AESB', 40.1038, -88.2243, '1304 W Pennsylvania Ave'),

-- Education / Social Work
('Education Building', 'EDU', 40.1104, -88.2304, '1310 S Sixth St'),
('Children Development Laboratory', 'CDL', 40.1099, -88.2311, '1105 W Nevada St'),
('School of Social Work', 'SSW', 40.1085, -88.2229, '1010 W Nevada St'),

-- Athletics / Recreation
('Armory', 'ARM', 40.1046, -88.2322, '505 E Armory Ave'),
('Huff Hall', 'HUFF', 40.1005, -88.2319, '1206 S Fourth St'),
('Campus Recreation Center East', 'CRCE', 40.1044, -88.2200, '1102 W Gregory Dr'),
('Activities & Recreation Center', 'ARC', 40.1012, -88.2362, '201 E Peabody Dr'),


-- Additional academic
('Temple Buell Hall (Architecture)', 'TBH', 40.0961, -88.2341, '611 E Lorado Taft Dr'),
('Art & Design Building', 'ADB', 40.0959, -88.2326, '408 E Peabody Dr'),
('Music Building', 'MUS', 40.1076, -88.2213, '1114 W Nevada St'),
('Law Building', 'LAW', 40.1022, -88.2307, '504 E Pennsylvania Ave'),
('Campus Instructional Facility', 'CIF', 40.1134, -88.2292, '1405 W Springfield Ave'),
('National Center for Supercomputing Applications', 'NCSA2', 40.1152, -88.2249, '1205 W Clark St'),
('Institute for Genomic Biology', 'IGB', 40.1158, -88.2250, '1206 W Gregory Dr');
