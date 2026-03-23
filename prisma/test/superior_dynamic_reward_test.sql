-- Test data for superior dynamic reward calculation

-- Clear existing test data
DELETE FROM tx_flow WHERE user_address IN ('user1', 'user2', 'user3', 'user4');
DELETE FROM user_info WHERE address IN ('user1', 'user2', 'user3', 'user4');

-- Insert test users with different levels
-- user1 (V1) -> user2 (V2) -> user3 (V3) -> user4 (V4)
INSERT INTO user_info (address, level, superior, created_at, updated_at) VALUES
('user1', 1, 'user2', NOW(), NOW()),  -- V1 user with V2 superior
('user2', 2, 'user3', NOW(), NOW()),  -- V2 user with V3 superior
('user3', 3, 'user4', NOW(), NOW()),  -- V3 user with V4 superior
('user4', 4, NULL, NOW(), NOW());     -- V4 user with no superior

-- Insert stake rewards for user1
INSERT INTO tx_flow (
    user_address, 
    amount, 
    type, 
    token_type, 
    status, 
    created_at
) VALUES 
-- Static reward: 1000 BGC
('user1', 1000, 'STAKE_STATIC_REWARD', 'BGC', 'PENDING', NOW()),
-- Dynamic reward: 500 BGC
('user1', 500, 'STAKE_DYNAMIC_REWARD', 'BGC', 'PENDING', NOW());

-- Expected results:
-- For user2 (V2 superior of user1):
-- Static reward contribution: 1000 * 0.2 = 200
-- Dynamic reward contribution: (500 / 0.1) * 0.2 = 1000
-- Total superior dynamic reward: 1200 BGC

-- Query to check results
SELECT 
    ui.address,
    ui.level,
    ui.superior,
    tf.type,
    tf.amount,
    tf.status
FROM user_info ui
LEFT JOIN tx_flow tf ON ui.address = tf.user_address
WHERE ui.address IN ('user1', 'user2', 'user3', 'user4')
ORDER BY ui.level, tf.type;

-- Query to check superior's reward
SELECT 
    tf.user_address,
    tf.amount,
    tf.type,
    tf.status,
    tf.created_at
FROM tx_flow tf
WHERE tf.user_address = 'user2' 
AND tf.type = 'STAKE_DYNAMIC_REWARD'
AND tf.created_at >= CURRENT_DATE;
