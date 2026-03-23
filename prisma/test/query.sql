-- Get user_info and user_balance recommender 6ZS9F4wizE6KJAdux4EMsm1TXN4vvRQbZME97QAkp1W3
SELECT 
    ui.id,
    ui.address,
    ui.level,
    ui.type,
    ui.superior,
    ui.path,
    ui.last_activity,
    ui.created_at as user_created_at,
    ub.usdt_points,
    ub.BGC_points,
    ub.BGC_locked_points,
    ub.BGC_staked_points,
    ub.created_at as balance_created_at
FROM user_info ui
LEFT JOIN user_balance ub ON ui.address = ub.address
ORDER BY ui.id;

-- Select a user's tx_flow
SELECT * FROM tx_flow WHERE user_address = '9PuWtwsApVBnC2zSReGbHooSpNw5oS4z9FrTKPwWYrnC';

-- Get sum of points for level 1 users and all their subordinates
WITH level1_users AS (
    SELECT id, path, address
    FROM user_info
    WHERE level = 1
)
SELECT 
    l1.id as level1_user_id,
    l1.path as level1_user_path,
    l1.address as level1_user_address,
    COALESCE(l1_balance.BGC_points, 0) + COALESCE(SUM(ub.BGC_points), 0) as total_points,
    COALESCE(l1_balance.BGC_staked_points, 0) + COALESCE(SUM(ub.BGC_staked_points), 0) as total_staked_points,
    COUNT(DISTINCT ui.id) as number_of_subordinates
FROM level1_users l1
LEFT JOIN user_balance l1_balance ON l1.address = l1_balance.address
LEFT JOIN user_info ui ON ui.path LIKE l1.path || '.%'
LEFT JOIN user_balance ub ON ui.address = ub.address
GROUP BY l1.id, l1.path, l1.address, l1_balance.BGC_points, l1_balance.BGC_staked_points
ORDER BY l1.path;

-- For users with level > 1, count direct subordinates (one level lower)
WITH higher_level_users AS (
    SELECT id, path, address, level
    FROM user_info
    WHERE level > 1
)
SELECT 
    h.id as user_id,
    h.path as user_path,
    h.address as user_address,
    h.level as user_level,
    COALESCE(h_balance.BGC_points, 0) + COALESCE(SUM(ub.BGC_points), 0) as total_points,
    COALESCE(h_balance.BGC_staked_points, 0) + COALESCE(SUM(ub.BGC_staked_points), 0) as total_staked_points,
    COUNT(DISTINCT ui.id) as direct_subordinates
FROM higher_level_users h
LEFT JOIN user_balance h_balance ON h.address = h_balance.address
LEFT JOIN user_info ui ON 
    ui.path LIKE h.path || '.%' AND
    ui.level = h.level - 1  -- Only count subordinates exactly one level lower
LEFT JOIN user_balance ub ON ui.address = ub.address
GROUP BY h.id, h.path, h.address, h.level, h_balance.BGC_points, h_balance.BGC_staked_points
ORDER BY h.path;

WITH higher_level_users AS (
    SELECT id, path, address, level
    FROM user_info
)
SELECT 
    h.id as user_id,
    h.path as user_path,
    h.address as user_address,
    h.level as user_level,
    COALESCE(h_balance.BGC_points, 0) + COALESCE(SUM(ub.BGC_points), 0) as total_points,
    COALESCE(h_balance.BGC_staked_points, 0) + COALESCE(SUM(ub.BGC_staked_points), 0) as total_staked_points,
    COUNT(DISTINCT ui.id) as direct_subordinates
FROM higher_level_users h
LEFT JOIN user_balance h_balance ON h.address = h_balance.address
LEFT JOIN user_info ui ON 
    ui.path LIKE h.path || '.%' AND
    ui.level = h.level  -- Only count subordinates exactly one level lower
LEFT JOIN user_balance ub ON ui.address = ub.address
GROUP BY h.id, h.path, h.address, h.level, h_balance.BGC_points, h_balance.BGC_staked_points
ORDER BY h.path;

-- Query all subordinates of a specific user by userId
WITH user_path AS (
    SELECT path
    FROM user_info
    WHERE address = '690dfd942da56826c9d3079d5f083f7d18cb25a5'
)
SELECT * 
FROM user_info 
WHERE path LIKE (SELECT path || '.%' FROM user_path) and level != 0;

SELECT * from user_info left join user_balance on user_info.address = user_balance.address where user_info.type = 'NORMAL' order by level desc;

-- Count all user with different level
SELECT level, COUNT(*) as user_count
FROM user_info
GROUP BY level

-- Query all users with level 9
SELECT * from user_info where level in (8, 9)

SELECT MAX(
      CASE 
        WHEN path IS NULL THEN 0 
        ELSE array_length(string_to_array(path, '.'), 1)
      END
    ) as max_depth 
    FROM user_info


-- Query all the subordinates of the address and their mining
WITH params AS (
    SELECT 'mAviFvkej3CzLz37iVPzJhvFDoJd7y1Q4p867iRSXSg' as address
)
SELECT ub.address, 
       ub.BGC_staked_points, 
       ub.BGC_reward_cap, 
       ui.path,
       (SELECT SUM(ub2.BGC_staked_points) 
        FROM user_balance ub2
        JOIN user_info ui2 ON ub2.address = ui2.address
        WHERE ui2.path LIKE (
            SELECT path || '.%' FROM user_info WHERE address = p.address
        ) 
        AND ub2.address != p.address
        AND ub2.BGC_reward_cap != 0) as total_staked_points_with_reward_cap
FROM user_balance ub
JOIN user_info ui ON ub.address = ui.address
CROSS JOIN params p
WHERE ui.path LIKE (
    SELECT path || '.%' FROM user_info WHERE address = p.address
) AND ub.address != p.address

-- Query an address's performance and partial performance
WITH params AS (
    SELECT 'Huq9teXxc1aP5Baddvw9jUtgg1jAqDd5htqb3dApaxwL' as address
),
direct_subordinates AS (
    SELECT ui.address, ui.path
    FROM user_info ui
    CROSS JOIN params p
    WHERE ui.superior = p.address
),
subordinate_performance AS (
    SELECT 
        ds.address,
        ub.BGC_staked_points,
        ub.BGC_reward_cap,
        ds.path,
        (SELECT SUM(ub2.BGC_staked_points) 
         FROM user_balance ub2
         JOIN user_info ui2 ON ub2.address = ui2.address
         WHERE ui2.path LIKE (ds.path || '.%')
         AND ub2.address != ds.address
         AND ub2.BGC_reward_cap != 0) as total_staked_points_with_reward_cap,
        (CASE WHEN COALESCE(ub.BGC_reward_cap, 0) != 0 THEN COALESCE(ub.BGC_staked_points, 0) ELSE 0 END + 
         COALESCE((SELECT SUM(ub2.BGC_staked_points) 
                  FROM user_balance ub2
                  JOIN user_info ui2 ON ub2.address = ui2.address
                  WHERE ui2.path LIKE (ds.path || '.%')
                  AND ub2.address != ds.address
                  AND ub2.BGC_reward_cap != 0), 0)) as total_performance
    FROM direct_subordinates ds
    LEFT JOIN user_balance ub ON ds.address = ub.address
)
SELECT 
    sp.*,
    (SELECT SUM(sp2.total_performance) FROM subordinate_performance sp2) as grand_total_performance,
    (SELECT SUM(sp2.total_performance) FROM subordinate_performance sp2) - 
    (SELECT MAX(sp3.total_performance) FROM subordinate_performance sp3) as grand_total_excluding_largest,
    (SELECT SUM(sp2.BGC_staked_points) * 0.012 * 0.1 FROM subordinate_performance sp2 WHERE sp2.BGC_reward_cap != 0) as direct_total_mining
FROM subordinate_performance sp
ORDER BY total_performance DESC NULLS LAST;


select id, user_info.address, BGC_staked_points, BGC_reward_cap, BGC_node_dynamic_reward_cap from user_balance, user_info where user_balance.address = user_info.address order by id;

select * from user_info where path like '%10002%' and type is not null

update tx_flow set status = 'PENDING' where user_address = '9Tq8U9yaJD2PXxZaU7FD4zAYxhwpxZfbrcE9UgpCB59m' and type = 'NODE_REWARD'

update user_balance set  BGC_points = BGC_points + 12456, updated_at = now() where address = 'EVn3xgwnW3P5drC9RiQRqNYmLz1wtxgs3kJx7uSttmtM'


select user_balance where address in (
    '5rScdGaj5q7F9VZK4JFNgPd5ZKB7bnWzKCMKE4TuWu4K',
'CQnDKgsQcNj7VTBqCb5TDuGht9DSsmYHbu6KDZ1LXybV',
'F6MDsgCLa9essJywmJHKyeWXkw5hrBAS5EoG3YJaJtHH',
'AP9KBAxJvcnHcyVcHj5UA1VJCFGhaPg96CzBPeFfjrSM',
'AFH4gxbYeU83c8vQLmUJNBxGwLB76NRr7QfLbyQWF4EK',
'FMxbQCoZkB6b17Vo9f4j2JMVTmkxEnB2TD4g7tGwKLy6',
'6WGXgR1WpBaeT1Utgws9qJEyMMGPbVed9FdoytVoF2Qi',
'AJFYCqBtcojz7HBuUy3d9X1kt9QRMgux1EGxghzp4GzA',
'tJQyoBcT1PVtzpjeiDao99EwAhhw4Lq96t8hskRdTPN',
'94QMhdB6MNuJnZRupVSDFqLvVtguB1Mh2HFbQVWNTMbM',
'2zEFfm4zbcxbYa3Sdb2YsrkFajdLHtTKPfp6fWXx1eRV',
'6i6qQC7nU2GnxXHyio7FbteJAgPofHeGQbegiP857mUP',
'73maW5SaHMZDq2SUnX2zwEDFqdsceyJCSbyZpJZfs89o',
'9s3rnh74aCc4Xgze6iXjVgMKk47X8euczizvs4sUWtCi',
'AQQ6aU9mLa43txwSZs4SXjh6m7cU8bFhmFvVNLzj7T24',
'3f9WDc6bBnbBZZ7XzzmwaK3YxhYRqJ41KAGTxjSHNwFY',
'24NyAtEHabDAhHFfooapAZxEk51L7BXoCseQdFu5hrbe',
'CnCUcJhqCkrANN6Cv5EmTeP5S8SgpNa2EAGa9bngNN3t',
'CqrVBkTbhPD6YJFXA3hK8rVyPSvEUb6WLpCcPYUoPzuU',
'GbT7bUDZFasibGGgMF8YBLxca3ZqGeDZ7TUp8wVAGcq8',
'b6yHWMuD1RN4h2T7YXPHH2ZVA6WqaU1hopsA563ppdv',
'AcGLzyUZhvMJr9KU9AegaXtYcU8Myn7qqmkb9KHpRS6V',
'6dpRW8ZuBWdFVz2FZFftYPyobAAwLcRKHyS7QWZtHNpG',
'8FaZhfmFx7KcZFemjzFxqnZNd8x2vQVDx82qVXn8VXFo',
'7VNso6of3T9Ff7wet8RigR4Qa6QPJEFDwH7TYMW3Lam4',
'Hxaay8Xk7stuFGjfAnS2w8JfFaW2ZEeb36HZc2X671yi',
'GmNTWRBuLUMtzXHh7M6z3hu5CeWqUeQp5Zo7qhBFCxDR',
'CL2JwAtsz5P9T3PxkWvup1rN4HrvLrwqo9iFwJkqu97m',
'EPUW3AAGjRtHZcJA2iXGgRMQDwBLBHqqvwgCJhXDuTKd',
'8SBpFc9Zsbmb4oVw4g6QoLdJnFqhB1PooZRUjaL5nY3b',
'FVVz8P77YCQFszziiLGi34qZkNGCA1vrthrhPUHc1eFT',
'53e3XWxUqDRkZRZu6RLD2H8u7uev2tH453pUYBQhKrhj',
'EVn3xgwnW3P5drC9RiQRqNYmLz1wtxgs3kJx7uSttmtM',
'E4EkM42phPK7sDmhtMS4jegsu2cvzwbqf6nRNpyisRnF',
'BKaNQZQX1C8mYFeEQunyX24zA3HsJGPbzaQmVJ7hwh4g',
'2wy5xteR63vdenHa3Ny2zfBEJkR3N4LmBAAbZGL5dMJA',
'9b2bXJDrRtseoNph79UE1sByh6LsuUTEo3BNg3Exrj5',
'EmV9RoecdJ1CSKc7fc3AboFiCr6NPZyWCCxhMPpU3AWE',
'4FXQT7sPzJEjaTnCW7aBvALtF2aSY5dzLruVQWvKPkS2',
'Ho7sgMDN754qgEyytkV1ophRxZmiLEnef6wFZBZZmPqL',
'44RYSbF836GNJwnQKh6VXcerwWNqU8f3rDABYHDnQrbz',
'2v8A5YSeD3ieoMRSJzzMw9PQHq3dHPRH57B8DeHkq78r'
)

UPDATE user_balance
SET 
  BGC_staked_points = BGC_staked_points + 1310,
  BGC_reward_cap = BGC_reward_cap + 3930,
  updated_at = now()
WHERE address IN (
'5rScdGaj5q7F9VZK4JFNgPd5ZKB7bnWzKCMKE4TuWu4K',
'CQnDKgsQcNj7VTBqCb5TDuGht9DSsmYHbu6KDZ1LXybV',
'F6MDsgCLa9essJywmJHKyeWXkw5hrBAS5EoG3YJaJtHH',
'AP9KBAxJvcnHcyVcHj5UA1VJCFGhaPg96CzBPeFfjrSM',
'AFH4gxbYeU83c8vQLmUJNBxGwLB76NRr7QfLbyQWF4EK',
'FMxbQCoZkB6b17Vo9f4j2JMVTmkxEnB2TD4g7tGwKLy6',
'6WGXgR1WpBaeT1Utgws9qJEyMMGPbVed9FdoytVoF2Qi',
'AJFYCqBtcojz7HBuUy3d9X1kt9QRMgux1EGxghzp4GzA',
'tJQyoBcT1PVtzpjeiDao99EwAhhw4Lq96t8hskRdTPN',
'94QMhdB6MNuJnZRupVSDFqLvVtguB1Mh2HFbQVWNTMbM',
'2zEFfm4zbcxbYa3Sdb2YsrkFajdLHtTKPfp6fWXx1eRV',
'6i6qQC7nU2GnxXHyio7FbteJAgPofHeGQbegiP857mUP',
'73maW5SaHMZDq2SUnX2zwEDFqdsceyJCSbyZpJZfs89o',
'9s3rnh74aCc4Xgze6iXjVgMKk47X8euczizvs4sUWtCi',
'AQQ6aU9mLa43txwSZs4SXjh6m7cU8bFhmFvVNLzj7T24',
'3f9WDc6bBnbBZZ7XzzmwaK3YxhYRqJ41KAGTxjSHNwFY',
'24NyAtEHabDAhHFfooapAZxEk51L7BXoCseQdFu5hrbe',
'CnCUcJhqCkrANN6Cv5EmTeP5S8SgpNa2EAGa9bngNN3t',
'CqrVBkTbhPD6YJFXA3hK8rVyPSvEUb6WLpCcPYUoPzuU',
'GbT7bUDZFasibGGgMF8YBLxca3ZqGeDZ7TUp8wVAGcq8',
'b6yHWMuD1RN4h2T7YXPHH2ZVA6WqaU1hopsA563ppdv',
'AcGLzyUZhvMJr9KU9AegaXtYcU8Myn7qqmkb9KHpRS6V',
'6dpRW8ZuBWdFVz2FZFftYPyobAAwLcRKHyS7QWZtHNpG',
'8FaZhfmFx7KcZFemjzFxqnZNd8x2vQVDx82qVXn8VXFo',
'7VNso6of3T9Ff7wet8RigR4Qa6QPJEFDwH7TYMW3Lam4',
'Hxaay8Xk7stuFGjfAnS2w8JfFaW2ZEeb36HZc2X671yi',
'GmNTWRBuLUMtzXHh7M6z3hu5CeWqUeQp5Zo7qhBFCxDR',
'CL2JwAtsz5P9T3PxkWvup1rN4HrvLrwqo9iFwJkqu97m',
'EPUW3AAGjRtHZcJA2iXGgRMQDwBLBHqqvwgCJhXDuTKd',
'8SBpFc9Zsbmb4oVw4g6QoLdJnFqhB1PooZRUjaL5nY3b',
'FVVz8P77YCQFszziiLGi34qZkNGCA1vrthrhPUHc1eFT',
'53e3XWxUqDRkZRZu6RLD2H8u7uev2tH453pUYBQhKrhj',
'EVn3xgwnW3P5drC9RiQRqNYmLz1wtxgs3kJx7uSttmtM',
'E4EkM42phPK7sDmhtMS4jegsu2cvzwbqf6nRNpyisRnF',
'BKaNQZQX1C8mYFeEQunyX24zA3HsJGPbzaQmVJ7hwh4g',
'2wy5xteR63vdenHa3Ny2zfBEJkR3N4LmBAAbZGL5dMJA',
'9b2bXJDrRtseoNph79UE1sByh6LsuUTEo3BNg3Exrj5',
'EmV9RoecdJ1CSKc7fc3AboFiCr6NPZyWCCxhMPpU3AWE',
'4FXQT7sPzJEjaTnCW7aBvALtF2aSY5dzLruVQWvKPkS2',
'Ho7sgMDN754qgEyytkV1ophRxZmiLEnef6wFZBZZmPqL',
'44RYSbF836GNJwnQKh6VXcerwWNqU8f3rDABYHDnQrbz',
'2v8A5YSeD3ieoMRSJzzMw9PQHq3dHPRH57B8DeHkq78r'
);
