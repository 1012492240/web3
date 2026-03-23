-- Active: 1752634191802@@pgm-0iw9471i4z54zf55ko.pgsql.japan.rds.aliyuncs.com@5435@BGC_points
UPDATE user_balance
SET 
    BGC_staked_points = CASE
        WHEN ui.type = 'GROUP' THEN 1000
        WHEN ui.type = 'COMMUNITY' THEN 3000
        ELSE BGC_staked_points
    END,
    BGC_reward_cap = CASE
        WHEN ui.type = 'GROUP' THEN 3000
        WHEN ui.type = 'COMMUNITY' THEN 9000
        ELSE BGC_reward_cap
    END,
    BGC_node_dynamic_reward_cap = CASE
        WHEN ui.type = 'GROUP' THEN 5000
        WHEN ui.type = 'COMMUNITY' THEN 30000
        ELSE BGC_node_dynamic_reward_cap
    END,
    updated_at = NOW()
FROM user_info ui
WHERE user_balance.address = ui.address
AND ui.type IN ('GROUP', 'COMMUNITY');