-- ReelsChat Seed Data
-- Test data for development

-- Insert test users
INSERT INTO users (id, username, email, password_hash, full_name, bio, avatar_url, is_verified) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'john_doe', 'john@example.com', '$2b$10$rKvFLw.YkN8z0qG5K0QvVe8gJ5vN3qWKl4ZxH5z9T7yJ5yH5z9T7y', 'John Doe', 'Travel enthusiast 🌍 | Coffee lover ☕', 'https://i.pravatar.cc/300?img=1', true),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'jane_smith', 'jane@example.com', '$2b$10$rKvFLw.YkN8z0qG5K0QvVe8gJ5vN3qWKl4ZxH5z9T7yJ5yH5z9T7y', 'Jane Smith', 'Fashion & Lifestyle 👗 | NYC', 'https://i.pravatar.cc/300?img=5', true),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'mike_wilson', 'mike@example.com', '$2b$10$rKvFLw.YkN8z0qG5K0QvVe8gJ5vN3qWKl4ZxH5z9T7yJ5yH5z9T7y', 'Mike Wilson', 'Tech geek 💻 | Gamer 🎮', 'https://i.pravatar.cc/300?img=12', false),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'sarah_johnson', 'sarah@example.com', '$2b$10$rKvFLw.YkN8z0qG5K0QvVe8gJ5vN3qWKl4ZxH5z9T7yJ5yH5z9T7y', 'Sarah Johnson', 'Fitness coach 💪 | Nutrition expert 🥗', 'https://i.pravatar.cc/300?img=9', true),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'alex_brown', 'alex@example.com', '$2b$10$rKvFLw.YkN8z0qG5K0QvVe8gJ5vN3qWKl4ZxH5z9T7yJ5yH5z9T7y', 'Alex Brown', 'Photographer 📸 | Nature lover 🌿', 'https://i.pravatar.cc/300?img=15', false);

-- Insert test reels
INSERT INTO reels (id, user_id, video_url, thumbnail_url, caption, duration, views_count, likes_count, comments_count) VALUES
('r1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://example.com/videos/reel1.mp4', 'https://picsum.photos/400/600?random=1', 'Amazing sunset in Bali 🌅 #travel #sunset', 30, 1524, 234, 45),
('r1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'https://example.com/videos/reel2.mp4', 'https://picsum.photos/400/600?random=2', 'OOTD vibes ✨ #fashion #style', 25, 2847, 456, 67),
('r1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://example.com/videos/reel3.mp4', 'https://picsum.photos/400/600?random=3', 'Epic gaming moment 🎮 #gaming #pcgaming', 45, 3921, 678, 89),
('r1eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'https://example.com/videos/reel4.mp4', 'https://picsum.photos/400/600?random=4', '30-min workout routine 💪 #fitness #workout', 60, 5234, 892, 123),
('r1eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'https://example.com/videos/reel5.mp4', 'https://picsum.photos/400/600?random=5', 'Morning in the forest 🌲 #nature #photography', 35, 4156, 743, 98),
('r1eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://example.com/videos/reel6.mp4', 'https://picsum.photos/400/600?random=6', 'Street food in Bangkok 🍜 #food #travel', 40, 6783, 1234, 156),
('r1eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'https://example.com/videos/reel7.mp4', 'https://picsum.photos/400/600?random=7', 'DIY fashion hacks ✂️ #diy #fashion', 50, 8945, 1567, 234),
('r1eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://example.com/videos/reel8.mp4', 'https://picsum.photos/400/600?random=8', 'New tech gadgets review 📱 #tech #review', 90, 12456, 2345, 345);

-- Insert test comments
INSERT INTO comments (id, reel_id, user_id, content, likes_count) VALUES
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'r1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'This is absolutely stunning! 😍', 23),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'r1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Where is this exactly?', 5),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'r1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Love your style! 💕', 34),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'r1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'That was insane! 🔥', 45),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'r1eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Great tips! Thanks for sharing', 67);

-- Insert replies to comments
INSERT INTO comments (id, reel_id, user_id, parent_comment_id, content, likes_count) VALUES
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'r1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'This is Uluwatu Beach in Bali!', 8),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'r1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Thank you so much! 🥰', 12);

-- Insert test likes
INSERT INTO likes (user_id, reel_id) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'r1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'r1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'r1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'r1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'r1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');

-- Insert likes for comments
INSERT INTO likes (user_id, comment_id) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');

-- Insert test followers
INSERT INTO followers (follower_id, following_id) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

-- Insert test conversations
INSERT INTO conversations (id, type, last_message_at) VALUES
('cv1ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'direct', CURRENT_TIMESTAMP - INTERVAL '5 minutes'),
('cv1ebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'direct', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
('cv1ebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'group', CURRENT_TIMESTAMP - INTERVAL '30 minutes');

-- Insert conversation participants
INSERT INTO conversation_participants (conversation_id, user_id, role, last_read_at) VALUES
('cv1ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'member', CURRENT_TIMESTAMP - INTERVAL '3 minutes'),
('cv1ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'member', CURRENT_TIMESTAMP - INTERVAL '5 minutes'),
('cv1ebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'member', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
('cv1ebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'member', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('cv1ebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin', CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
('cv1ebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'member', CURRENT_TIMESTAMP - INTERVAL '45 minutes'),
('cv1ebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'member', CURRENT_TIMESTAMP - INTERVAL '1 hour');

-- Insert test messages
INSERT INTO messages (id, conversation_id, sender_id, content, message_type, created_at) VALUES
('m1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'cv1ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Hey! How are you?', 'text', CURRENT_TIMESTAMP - INTERVAL '10 minutes'),
('m1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'cv1ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Hi! I''m doing great! Just posted a new reel 😊', 'text', CURRENT_TIMESTAMP - INTERVAL '8 minutes'),
('m1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'cv1ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Awesome! Let me check it out', 'text', CURRENT_TIMESTAMP - INTERVAL '5 minutes'),
('m1eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'cv1ebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Did you see my latest travel video?', 'text', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('m1eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'cv1ebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Yes! It was amazing 🔥', 'text', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
('m1eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'cv1ebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Welcome to the group everyone!', 'text', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
('m1eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'cv1ebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Thanks for adding me!', 'text', CURRENT_TIMESTAMP - INTERVAL '45 minutes'),
('m1eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'cv1ebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Excited to be here! 💪', 'text', CURRENT_TIMESTAMP - INTERVAL '30 minutes');

-- Update conversation last message references
UPDATE conversations SET last_message_id = 'm1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13' WHERE id = 'cv1ebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
UPDATE conversations SET last_message_id = 'm1eebc99-9c0b-4ef8-bb6d-6bb9bd380a15' WHERE id = 'cv1ebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
UPDATE conversations SET last_message_id = 'm1eebc99-9c0b-4ef8-bb6d-6bb9bd380a18' WHERE id = 'cv1ebc99-9c0b-4ef8-bb6d-6bb9bd380a13';