-- Active: 1741226676569@@127.0.0.1@5432@BGC_points
-- Delete user and related records
DELETE FROM user_balance WHERE address = 'AmyHmxrA6WQX1uzPrgxTRsMzAKDUbX4dHvwR9RjHMkdb';
DELETE FROM user_info WHERE address = 'AmyHmxrA6WQX1uzPrgxTRsMzAKDUbX4dHvwR9RjHMkdb';

-- Delete all tx_flow records from today
DELETE FROM tx_flow 
WHERE user_address = 'AmyHmxrA6WQX1uzPrgxTRsMzAKDUbX4dHvwR9RjHMkdb';

delete from tx_flow where type = 'LOCK_RELEASE';

delete from tx_flow where type in ('STAKE_DYNAMIC_REWARD', 'STAKE_STATIC_REWARD', 'HOLDING_STATIC_REWARD', 'STAKE_DYNAMIC_NODE_REWARD', 'SPAWN_REWARD') and status = 'PENDING'

delete from tx_flow where type in ('AIRDROP')

delete from tx_flow where executed_at > '2025-06-04 22:40:00'

delete from transaction

delete from schedule_process

delete from user_balance

delete from user_info

delete from transaction

delete from tx_flow

delete from performance_history

DELETE FROM tx_flow WHERE type IN (
    'STAKE_STATIC_REWARD',
    'STAKE_STATIC_DIRECT_REWARD',
    'STAKE_DYNAMIC_REWARD',
    'STAKE_DYNAMIC_INCUBATION_REWARD',
    'STAKE_DYNAMIC_NODE_REWARD',
    'STAKE_DYNAMIC_NODE_INCUBATION_REWARD',
    'MARKET_EXPENSE',
    'SECURITY_FUND'
)

DELETE from schedule_process

update user_balance set 
    BGC_reward_cap = 3 * BGC_staked_points,
    BGC_node_dynamic_reward_cap = (
        SELECT 
            CASE 
                WHEN type = 'COMMUNITY' THEN 30000
                WHEN type = 'GROUP' THEN 5000
                ELSE BGC_node_dynamic_reward_cap
            END
        FROM user_info 
        WHERE user_info.address = user_balance.address
    )
