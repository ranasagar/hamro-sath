-- Seed data for Hamro Saath - Safa Nepal

-- Insert wards (32 wards of Kathmandu)
INSERT INTO wards (ward_number, ward_name, description) VALUES
(1, 'Ward 1', 'Kirtipur area'),
(2, 'Ward 2', 'Swayambhu area'),
(3, 'Ward 3', 'Kalimati area'),
(4, 'Ward 4', 'Teku area'),
(5, 'Ward 5', 'Tripureshwor area'),
(6, 'Ward 6', 'Thapathali area'),
(7, 'Ward 7', 'Chhetrapati area'),
(8, 'Ward 8', 'Ason area'),
(9, 'Ward 9', 'Basantapur area'),
(10, 'Ward 10', 'Indrachowk area'),
(11, 'Ward 11', 'Chabahil area'),
(12, 'Ward 12', 'Gongabu area'),
(13, 'Ward 13', 'Balaju area'),
(14, 'Ward 14', 'Nagarjun area'),
(15, 'Ward 15', 'Budhanilkantha area'),
(16, 'Ward 16', 'Tokha area'),
(17, 'Ward 17', 'Jorpati area'),
(18, 'Ward 18', 'Kapan area'),
(19, 'Ward 19', 'Gokarneshwor area'),
(20, 'Ward 20', 'Boudha area'),
(21, 'Ward 21', 'Sankhamul area'),
(22, 'Ward 22', 'Tinkune area'),
(23, 'Ward 23', 'Koteshwor area'),
(24, 'Ward 24', 'Satdobato area'),
(25, 'Ward 25', 'Imadol area'),
(26, 'Ward 26', 'Thimi area'),
(27, 'Ward 27', 'Bhaktapur area'),
(28, 'Ward 28', 'Chhangunarayan area'),
(29, 'Ward 29', 'Suryabinayak area'),
(30, 'Ward 30', 'Madhyapur area'),
(31, 'Ward 31', 'Nagarkot area'),
(32, 'Ward 32', 'Dakshinkali area');

-- Insert badges
INSERT INTO badges (name, description, icon_url, category, criteria, rarity, points_bonus) VALUES
-- Issues badges
('First Reporter', 'Report your first issue', '/badges/first-reporter.png', 'issues', '{"issues_reported": 1}', 'common', 10),
('Issue Hunter', 'Report 10 issues', '/badges/issue-hunter.png', 'issues', '{"issues_reported": 10}', 'rare', 50),
('Problem Solver', 'Report 50 issues', '/badges/problem-solver.png', 'issues', '{"issues_reported": 50}', 'epic', 200),
('Community Guardian', 'Report 100 issues', '/badges/community-guardian.png', 'issues', '{"issues_reported": 100}', 'legendary', 500),

-- Recycling badges
('Eco Warrior', 'Recycle for the first time', '/badges/eco-warrior.png', 'recycling', '{"recycle_count": 1}', 'common', 10),
('Recycling Pro', 'Recycle 10 times', '/badges/recycling-pro.png', 'recycling', '{"recycle_count": 10}', 'rare', 50),
('Green Champion', 'Recycle 50kg of materials', '/badges/green-champion.png', 'recycling', '{"recycle_weight_kg": 50}', 'epic', 200),
('Planet Protector', 'Recycle 100kg of materials', '/badges/planet-protector.png', 'recycling', '{"recycle_weight_kg": 100}', 'legendary', 500),

-- Volunteering badges
('Helping Hand', 'Volunteer for 1 hour', '/badges/helping-hand.png', 'volunteering', '{"volunteer_hours": 1}', 'common', 10),
('Dedicated Volunteer', 'Volunteer for 10 hours', '/badges/dedicated-volunteer.png', 'volunteering', '{"volunteer_hours": 10}', 'rare', 50),
('Community Hero', 'Volunteer for 50 hours', '/badges/community-hero.png', 'volunteering', '{"volunteer_hours": 50}', 'epic', 200),
('Volunteer Legend', 'Volunteer for 100 hours', '/badges/volunteer-legend.png', 'volunteering', '{"volunteer_hours": 100}', 'legendary', 500),

-- Participation badges
('Newcomer', 'Join the platform', '/badges/newcomer.png', 'participation', '{"joined": true}', 'common', 10),
('Active Citizen', 'Earn 100 points', '/badges/active-citizen.png', 'participation', '{"total_points": 100}', 'rare', 25),
('Power User', 'Earn 500 points', '/badges/power-user.png', 'participation', '{"total_points": 500}', 'epic', 100),
('7-Day Streak', 'Log in for 7 consecutive days', '/badges/7-day-streak.png', 'participation', '{"streak": 7}', 'rare', 50),
('30-Day Streak', 'Log in for 30 consecutive days', '/badges/30-day-streak.png', 'participation', '{"streak": 30}', 'epic', 200),

-- Special badges
('Early Adopter', 'One of the first 100 users', '/badges/early-adopter.png', 'special', '{"user_id": "<=100"}', 'legendary', 100),
('Mayor''s Recognition', 'Recognized by the mayor', '/badges/mayor-recognition.png', 'special', '{"manual": true}', 'legendary', 250),
('Community Leader', 'Help resolve 10 issues', '/badges/community-leader.png', 'special', '{"issues_resolved": 10}', 'epic', 150);

-- Insert sample rewards
INSERT INTO rewards (name, description, category, points_required, quantity_available, image_url, is_active) VALUES
-- Merchandise
('Safa Nepal T-Shirt', 'Official Safa Nepal branded cotton t-shirt', 'merchandise', 500, 100, '/rewards/tshirt.jpg', true),
('Reusable Shopping Bag', 'Eco-friendly reusable shopping bag', 'merchandise', 200, 200, '/rewards/bag.jpg', true),
('Water Bottle', 'Stainless steel water bottle with logo', 'merchandise', 300, 150, '/rewards/bottle.jpg', true),
('Cap', 'Safa Nepal branded cap', 'merchandise', 250, 100, '/rewards/cap.jpg', true),

-- Coupons
('Restaurant 10% Discount', '10% off at partner restaurants', 'coupon', 150, 500, '/rewards/restaurant.jpg', true),
('Coffee Shop Voucher', 'Free coffee at partner cafes', 'coupon', 100, 1000, '/rewards/coffee.jpg', true),
('Grocery Discount', '5% off at partner grocery stores', 'coupon', 120, 500, '/rewards/grocery.jpg', true),

-- Events
('Tree Plantation Event', 'Participate in tree plantation event', 'event', 300, 50, '/rewards/tree.jpg', true),
('Beach Cleanup Event', 'Join the beach cleanup drive', 'event', 250, 75, '/rewards/beach.jpg', true),
('Workshop Registration', 'Environmental awareness workshop', 'event', 200, 100, '/rewards/workshop.jpg', true),

-- Safety Kits
('First Aid Kit', 'Basic first aid kit for emergencies', 'safety_kit', 400, 50, '/rewards/firstaid.jpg', true),
('Flashlight', 'LED flashlight with batteries', 'safety_kit', 180, 100, '/rewards/flashlight.jpg', true),
('Emergency Whistle', 'Safety whistle for emergencies', 'safety_kit', 80, 200, '/rewards/whistle.jpg', true);

-- Note: Do not insert user data in seed file for security reasons
-- Admin users should be created through secure setup process
