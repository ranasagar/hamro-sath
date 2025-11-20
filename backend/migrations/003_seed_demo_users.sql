-- Seed demo users for Hamro Saath - Safa Nepal
-- Password for all demo users: password123
-- Hashed using bcrypt with 10 rounds

-- Insert demo users
INSERT INTO users (email, username, password_hash, full_name, phone, ward_id, role, is_verified, avatar_url) VALUES
('sitarai@safa.com', 'sitarai', '$2a$10$6fxH0fAX9RQxZWCnDmT1tOAfvys6/9lA0q/ckMg2NRM85AeV2AeVK', 'Sita Rai', '+977-9841234567', 10, 'citizen', true, 'https://picsum.photos/id/1005/100/100'),
('aaravsharma@safa.com', 'aaravsharma', '$2a$10$6fxH0fAX9RQxZWCnDmT1tOAfvys6/9lA0q/ckMg2NRM85AeV2AeVK', 'Aarav Sharma', '+977-9841234568', 15, 'citizen', true, 'https://picsum.photos/id/1011/100/100'),
('demouser@safa.com', 'demouser', '$2a$10$6fxH0fAX9RQxZWCnDmT1tOAfvys6/9lA0q/ckMg2NRM85AeV2AeVK', 'Demo User', '+977-9841234569', 20, 'citizen', true, 'https://picsum.photos/id/1025/100/100'),
('rajeshhamal@safa.com', 'rajeshhamal', '$2a$10$6fxH0fAX9RQxZWCnDmT1tOAfvys6/9lA0q/ckMg2NRM85AeV2AeVK', 'Rajesh Hamal', '+977-9841234570', 5, 'citizen', true, 'https://picsum.photos/id/1027/100/100'),
('admin@safa.com', 'admin', '$2a$10$6fxH0fAX9RQxZWCnDmT1tOAfvys6/9lA0q/ckMg2NRM85AeV2AeVK', 'Admin User', '+977-9841234571', 1, 'admin', true, 'https://picsum.photos/id/1040/100/100')
ON CONFLICT (email) DO NOTHING;

-- Get user IDs for stats initialization
DO $$
DECLARE
    v_user_id INT;
BEGIN
    -- Initialize stats for each demo user
    FOR v_user_id IN SELECT id FROM users WHERE email IN ('sitarai@safa.com', 'aaravsharma@safa.com', 'demouser@safa.com', 'rajeshhamal@safa.com', 'admin@safa.com')
    LOOP
        INSERT INTO user_stats (
            user_id, 
            total_points, 
            issues_reported, 
            issues_resolved, 
            recycle_count, 
            recycle_weight_kg, 
            volunteer_hours, 
            current_streak, 
            longest_streak
        ) VALUES (
            v_user_id, 
            100,  -- Starting points
            0, 
            0, 
            0, 
            0.0, 
            0, 
            0, 
            0
        )
        ON CONFLICT (user_id) DO NOTHING;
    END LOOP;
END $$;
