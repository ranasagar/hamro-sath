-- Seed data for advanced features

-- ============================================================================
-- NFT BADGES (Blockchain-backed achievements)
-- ============================================================================

INSERT INTO nft_badges (name, description, image_url, rarity, karma_requirement, category) VALUES
-- Karma Category
('Karma Pioneer', 'First 1000 Karma Coins earned', '/nft-badges/karma-pioneer.png', 'common', 1000, 'karma'),
('Karma Champion', 'Earned 5000 Karma Coins', '/nft-badges/karma-champion.png', 'rare', 5000, 'karma'),
('Karma Legend', 'Earned 10000 Karma Coins', '/nft-badges/karma-legend.png', 'epic', 10000, 'karma'),
('Karma Deity', 'Earned 50000 Karma Coins', '/nft-badges/karma-deity.png', 'legendary', 50000, 'karma'),
('Streak Master', '30-day Karma Streak', '/nft-badges/streak-master.png', 'epic', 0, 'karma'),
('Festival Hero', 'Participated in 5 festival campaigns', '/nft-badges/festival-hero.png', 'rare', 0, 'karma'),

-- Civic Category
('Ward Guardian', 'Top contributor in your ward', '/nft-badges/ward-guardian.png', 'epic', 0, 'civic'),
('Project Initiator', 'Proposed 5 community projects', '/nft-badges/project-initiator.png', 'rare', 0, 'civic'),
('Democracy Champion', 'Voted on 20 community projects', '/nft-badges/democracy-champion.png', 'rare', 0, 'civic'),
('Palika Partner', 'Collaborated with local government', '/nft-badges/palika-partner.png', 'epic', 0, 'civic'),

-- Environmental Category
('Waste Warrior', 'Proper waste segregation for 30 days', '/nft-badges/waste-warrior.png', 'rare', 0, 'environmental'),
('Sapling Savior', 'Planted 50 saplings', '/nft-badges/sapling-savior.png', 'epic', 0, 'environmental'),
('Carbon Crusher', 'Saved 100kg of carbon emissions', '/nft-badges/carbon-crusher.png', 'epic', 0, 'environmental'),
('Green Commuter', 'Used public transport for 50 trips', '/nft-badges/green-commuter.png', 'rare', 0, 'environmental'),
('Drain Defender', 'Participated in monsoon drain cleaning', '/nft-badges/drain-defender.png', 'rare', 0, 'environmental'),

-- Social Category
('Civic Educator', 'Educated 100 neighbors through videos', '/nft-badges/civic-educator.png', 'epic', 0, 'social'),
('Nudge Master', 'Sent 50 civic nudges', '/nft-badges/nudge-master.png', 'rare', 0, 'social'),
('School Champion', 'Completed 20 student quests', '/nft-badges/school-champion.png', 'rare', 0, 'social'),
('Disaster Hero', 'Volunteered in disaster response', '/nft-badges/disaster-hero.png', 'legendary', 0, 'social'),

-- Special Category
('Dashain Defender', 'Anti-litter campaign during Dashain', '/nft-badges/dashain-defender.png', 'epic', 0, 'special'),
('Monsoon Guardian', 'Drain cleaning during monsoon season', '/nft-badges/monsoon-guardian.png', 'epic', 0, 'special'),
('Tihar Torch', 'Community lighting initiative during Tihar', '/nft-badges/tihar-torch.png', 'epic', 0, 'special'),
('Holi Hero', 'Eco-friendly Holi celebration organizer', '/nft-badges/holi-hero.png', 'rare', 0, 'special'),
('Blockchain Pioneer', 'One of first 100 NFT badge holders', '/nft-badges/blockchain-pioneer.png', 'mythic', 0, 'special');

-- ============================================================================
-- PARTNER SHOPS (Kathmandu/Pokhara)
-- ============================================================================

INSERT INTO partners (name, category, description, address, ward_id, contact_phone, offers) VALUES
-- Supermarkets
('Bhatbhateni Supermarket - Naxal', 'supermarket', 'Leading supermarket chain in Nepal', 'Naxal, Kathmandu', 11, '01-4444072', 
 '[{"karma_required": 1000, "discount": "5%", "description": "5% off on all products"}, 
   {"karma_required": 2500, "discount": "10%", "description": "10% off on groceries"}]'::jsonb),
('Salesberry Supermarket', 'supermarket', 'Modern supermarket chain', 'Dillibazar, Kathmandu', 9, '01-4444333',
 '[{"karma_required": 800, "discount": "5%", "description": "5% off on purchase above Rs. 2000"}]'::jsonb),

-- Restaurants
('The Old House Restaurant', 'restaurant', 'Traditional Nepali cuisine', 'Thamel, Kathmandu', 7, '01-4700111',
 '[{"karma_required": 500, "discount": "10%", "description": "10% off on total bill"}]'::jsonb),
('Roadhouse Cafe', 'cafe', 'Popular cafe in Thamel', 'Thamel, Kathmandu', 7, '01-4700200',
 '[{"karma_required": 300, "discount": "Free drink", "description": "Free drink with meal"}]'::jsonb),

-- Cafes
('Himalayan Java Coffee', 'cafe', 'Premium coffee chain', 'Thamel, Kathmandu', 7, '01-4700300',
 '[{"karma_required": 200, "discount": "Free coffee", "description": "Free regular coffee"}]'::jsonb),
('Coffee Culture', 'cafe', 'Artisan coffee shop', 'Jhamsikhel, Lalitpur', 3, '01-5000111',
 '[{"karma_required": 150, "discount": "20% off", "description": "20% off on beverages"}]'::jsonb),

-- Street Vendors
('Organic Vegetable Market', 'vendor', 'Fresh organic vegetables from local farmers', 'Ason, Kathmandu', 8, '9841234567',
 '[{"karma_required": 100, "discount": "Free bag", "description": "Free reusable bag with purchase"}]'::jsonb),
('Handicraft Vendors - Basantapur', 'vendor', 'Traditional Nepali handicrafts', 'Basantapur, Kathmandu', 9, '9851234567',
 '[{"karma_required": 500, "discount": "15%", "description": "15% off on all items"}]'::jsonb),

-- Eco Brands
('Himalayan Waste Warriors', 'eco_brand', 'Upcycled products from Himalayan waste', 'Patan, Lalitpur', 1, '01-5551234',
 '[{"karma_required": 1000, "discount": "20%", "description": "20% off on upcycled products"}]'::jsonb),
('Kathmandu Eco Store', 'eco_brand', 'Sustainable and eco-friendly products', 'New Road, Kathmandu', 9, '01-4225678',
 '[{"karma_required": 750, "discount": "15%", "description": "15% off store-wide"}]'::jsonb);

-- ============================================================================
-- ECO BRANDS
-- ============================================================================

INSERT INTO eco_brands (name, description, category, website_url, products, sustainability_score) VALUES
('Himalayan Waste Warriors', 'Transforms Himalayan waste into beautiful upcycled products', 'upcycled', 'https://himalayanwastewarriors.org',
 '[{"name": "Upcycled Backpacks", "karma": 2000}, 
   {"name": "Recycled Notebooks", "karma": 500},
   {"name": "Eco-friendly Bags", "karma": 800}]'::jsonb, 95.00),

('Dhaka Eco Crafts', 'Traditional Dhaka fabric products made sustainably', 'local', 'https://dhakaecoc rafts.com.np',
 '[{"name": "Dhaka Bags", "karma": 1500}, 
   {"name": "Dhaka Wallets", "karma": 600}]'::jsonb, 88.00),

('Everest Organics', 'Organic food products from the Himalayas', 'organic', 'https://everestorganics.com.np',
 '[{"name": "Organic Tea", "karma": 400}, 
   {"name": "Organic Honey", "karma": 600},
   {"name": "Organic Spices", "karma": 350}]'::jsonb, 92.00),

('Solar Nepal', 'Solar energy solutions for homes and businesses', 'renewable', 'https://solarnepal.com',
 '[{"name": "Solar Panel Discount", "karma": 5000}, 
   {"name": "Solar Lamp", "karma": 1000}]'::jsonb, 98.00),

('Zero Waste Nepal', 'Zero-waste lifestyle products', 'zero_waste', 'https://zerowastenepal.org',
 '[{"name": "Bamboo Toothbrush Set", "karma": 300}, 
   {"name": "Metal Straws", "karma": 200},
   {"name": "Beeswax Wraps", "karma": 400}]'::jsonb, 96.00);

-- ============================================================================
-- SCHOOLS
-- ============================================================================

INSERT INTO schools (name, address, ward_id, principal_name, contact_email, school_code) VALUES
('Budhanilkantha School', 'Budhanilkantha, Kathmandu', 15, 'Dr. Ram Sharma', 'info@budhanilkantha.edu.np', 'BNS001'),
('Rato Bangala School', 'Patan, Lalitpur', 1, 'Mrs. Kamala Bista', 'admin@ratobangala.edu.np', 'RBS001'),
('Kathmandu University High School', 'Dhulikhel, Kavre', 1, 'Dr. Krishna Thapa', 'info@kuhs.edu.np', 'KUHS001'),
('St. Xavier''s School', 'Jawalakhel, Lalitpur', 3, 'Fr. George Abraham', 'info@stxaviers.edu.np', 'SXS001'),
('Gyanodaya Bal Batika School', 'Naxal, Kathmandu', 11, 'Mr. Shyam Karki', 'info@gyanodaya.edu.np', 'GBBS001');

-- ============================================================================
-- FESTIVAL CAMPAIGNS
-- ============================================================================

INSERT INTO festival_campaigns (name, festival_name, description, campaign_type, karma_multiplier, bonus_karma, start_date, end_date, participating_wards) VALUES
('Dashain Clean-up Drive 2025', 'Dashain', 'Anti-litter campaign during Dashain festival. Keep our celebrations clean!', 'anti_litter', 2.00, 500, 
 '2025-10-01', '2025-10-15', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]),

('Monsoon Drain Defenders', 'Monsoon Season', 'Clean and maintain drainage systems to prevent flooding', 'drain_cleaning', 1.50, 300,
 '2025-06-15', '2025-09-15', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]),

('Tihar Light & Clean', 'Tihar', 'Combine traditional lighting with cleanliness awareness', 'awareness', 1.50, 400,
 '2025-11-01', '2025-11-05', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]),

('New Year Green Resolution', 'Nepali New Year', 'Start the new year with tree planting across all wards', 'tree_planting', 2.00, 600,
 '2026-04-10', '2026-04-20', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32]),

('Holi Eco-Celebration', 'Holi', 'Promote eco-friendly colors and clean-up after Holi', 'awareness', 1.50, 350,
 '2026-03-10', '2026-03-15', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]);

-- ============================================================================
-- INITIAL WARD CLEANLINESS SCORES
-- ============================================================================

INSERT INTO ward_cleanliness_scores (ward_id, score, report_count, resolved_count, calculated_date) VALUES
(1, 75.00, 0, 0, CURRENT_DATE),
(2, 68.00, 0, 0, CURRENT_DATE),
(3, 72.00, 0, 0, CURRENT_DATE),
(4, 65.00, 0, 0, CURRENT_DATE),
(5, 70.00, 0, 0, CURRENT_DATE),
(6, 78.00, 0, 0, CURRENT_DATE),
(7, 62.00, 0, 0, CURRENT_DATE),
(8, 58.00, 0, 0, CURRENT_DATE),
(9, 71.00, 0, 0, CURRENT_DATE),
(10, 69.00, 0, 0, CURRENT_DATE),
(11, 76.00, 0, 0, CURRENT_DATE),
(12, 67.00, 0, 0, CURRENT_DATE),
(13, 73.00, 0, 0, CURRENT_DATE),
(14, 80.00, 0, 0, CURRENT_DATE),
(15, 82.00, 0, 0, CURRENT_DATE),
(16, 79.00, 0, 0, CURRENT_DATE),
(17, 74.00, 0, 0, CURRENT_DATE),
(18, 77.00, 0, 0, CURRENT_DATE),
(19, 75.00, 0, 0, CURRENT_DATE),
(20, 72.00, 0, 0, CURRENT_DATE),
(21, 68.00, 0, 0, CURRENT_DATE),
(22, 70.00, 0, 0, CURRENT_DATE),
(23, 66.00, 0, 0, CURRENT_DATE),
(24, 71.00, 0, 0, CURRENT_DATE),
(25, 73.00, 0, 0, CURRENT_DATE),
(26, 69.00, 0, 0, CURRENT_DATE),
(27, 75.00, 0, 0, CURRENT_DATE),
(28, 78.00, 0, 0, CURRENT_DATE),
(29, 76.00, 0, 0, CURRENT_DATE),
(30, 72.00, 0, 0, CURRENT_DATE),
(31, 81.00, 0, 0, CURRENT_DATE),
(32, 74.00, 0, 0, CURRENT_DATE);

-- Note: User data, karma transactions, and sensitive information should be created through the application, not seed files
