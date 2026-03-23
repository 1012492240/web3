-- Active: 1741226676569@@127.0.0.1@5432@BGC_points
-- Roll back tx_flow status
UPDATE tx_flow
SET status = 'PENDING'
WHERE executed_at > '2025-04-03 00:00:00'

-- Query all tx_flows
select * from tx_flow where executed_at > '2025-04-03 00:00:00' and status != 'FAILED'

-- Backup all tx_flows
update tx_flow set status = 'FAILED'

-- HandleLockRelease test
-- Count all user with locked points
select * from user_balance where BGC_locked_points not in (1000, 3000, 0)

-- Count all group and community
select count(*) from user_info where type in ('GROUP', 'COMMUNITY')

-- Check the sum of locked points and tx_flow amount
select * from (
    SELECT 
    ub.address,
    ub.BGC_locked_points,
    tf.amount,
    COALESCE(ub.BGC_locked_points + tf.amount, ub.BGC_locked_points) AS combined
FROM user_balance ub
LEFT JOIN tx_flow tf 
    ON ub.address = tf.user_address 
    AND tf.status = 'CONFIRMED' 
    AND tf.type = 'LOCK_RELEASE'
WHERE ub.BGC_locked_points > 0
) as combined where combined.combined not in (1000, 3000)

select * from tx_flow where type = 'LOCK_RELEASE' and status = 'PENDING'

select * from tx_flow where user_address in ('9480824fcf30c83bb193f63541c44a91a55b2f4a', 'DPc5a7wJcNvgPca44xNcjhUU6viTpy4pF3iYXNmFrA9d', '3hX25PRSTCYo553oY18PKYFkN5294rrbjvcwLG1wFbFb')


-- Rerank all user
SELECT level, COUNT(*) AS user_count
FROM user_info
GROUP BY level;

select * from user_info

select * from user_info where level = 3;
select * from user_info where level = 5 and address not in ('e7e815cfdb63fc85db2c53270823636194db1bb0', '4ae6058342ec3b8693657a931d93264d18d2a615', '40ad52adedc941ebee4cca4bd735585c074a0638', 'f8e402abae38ed23084a7fbea8947b001f89baac', 'fb69a5c64849437def8fe063ba876beaf5f6bf3b');
select * from user_info where path like ('64%')

select * from user_info left join user_balance on user_info.address = user_balance.address where user_info.address = '40ea2722f23266053763266657df00f24c54123c'

-- Static Reward
select * from tx_flow where type = 'STAKE_STATIC_REWARD' and status = 'PENDING'

select * from (SELECT 
    address,
    BGC_points,
    BGC_staked_points,
    (0.01 * BGC_staked_points + 0.006 * BGC_points) AS total_reward
FROM user_balance where BGC_staked_points > 0 or BGC_points > 0) as ub left join(select * from tx_flow where status = 'PENDING' and type = 'STAKE_STATIC_REWARD') as tf on ub.address = tf.user_address


select count(*) from user_balance where BGC_staked_points > 0 or BGC_points > 0

delete from tx_flow where type = 'STAKE_STATIC_REWARD' and status = 'PENDING'

select * from tx_flow where type = 'NODE_REWARD'

select * from tx_flow where type = 'STAKE_DYNAMIC_REWARD' and status = 'PENDING'

select * from tx_flow where user_address = '540ece396b5c1a452d702b029eb3894c0509b9cf' and status = 'PENDING'

select * from tx_flow where type = 'STAKE_DYNAMIC_REWARD' and status = 'PENDING'

-- Check reward number
select superior, count(*) from user_info group by superior

-- Check static reward amount
select sum(amount) from tx_flow where type = 'STAKE_STATIC_REWARD' and status = 'PENDING'

select sum(amount) from tx_flow where type = 'STAKE_DYNAMIC_REWARD' and status = 'PENDING'


-- Check dynamic reward amount of all network
select id from user_info where path NOT LIKE '%.%';
select SUM(CAST(json_extract_path_text(description::json, 'subordinate_static') AS NUMERIC)) as total_subordinate_staked
from tx_flow
where user_address in (select address from user_info where path NOT LIKE '%.%')
  and type = 'STAKE_DYNAMIC_REWARD'
  and status = 'PENDING';

select SUM(amount) as amount
from tx_flow
where user_address in (select address from user_info where path NOT LIKE '%.%')
  and type = 'STAKE_STATIC_REWARD'
  and status = 'PENDING'; 

WITH dynamic_reward AS (
  SELECT SUM(CAST(json_extract_path_text(description::json, 'subordinate_staked') AS NUMERIC)) AS total_subordinate_staked
  FROM tx_flow
  WHERE user_address IN (SELECT address FROM user_info WHERE path NOT LIKE '%.%')
    AND type = 'STAKE_DYNAMIC_REWARD'
    AND status = 'PENDING'
),
static_reward AS (
  SELECT SUM(amount) AS amount
  FROM tx_flow
  WHERE user_address IN (SELECT address FROM user_info WHERE path NOT LIKE '%.%')
    AND type = 'STAKE_STATIC_REWARD'
    AND status = 'PENDING'
)
SELECT COALESCE(dynamic_reward.total_subordinate_staked, 0) + COALESCE(static_reward.amount, 0) AS total_reward
FROM dynamic_reward, static_reward;

select * from user_info where level = 3;

select us.level, us.path, us.id, t.amount as dynamic, b.amount as static, t.description  from 
(select address, level, path, id from user_info where path like '40.41.45.47.52.63%') as us 
left join (select * from tx_flow where type = 'STAKE_DYNAMIC_REWARD' and status = 'PENDING') t on t.user_address = us.address
left join (select * from tx_flow where type = 'STAKE_STATIC_REWARD' and status = 'PENDING') b on b.user_address = us.address


select * from tx_flow where user_address = '084697908d22feaa6d812a9443536079482410c1'

select count(*) from tx_flow, user_info where tx_flow.user_address = user_info.address and tx_flow.type = 'STAKE_DYNAMIC_REWARD' and user_info.type != 'NORMAL' and tx_flow.status = 'PENDING'

select count(*) from tx_flow where type = 'STAKE_DYNAMIC_NODE_REWARD' and status = 'PENDING'

select * from tx_flow where type = 'STAKE_DYNAMIC_NODE_REWARD'

-- Check spawn reward amount
select * from tx_flow, user_info where tx_flow.user_address = user_info.address and tx_flow.type = 'SPAWN_REWARD'

select * from user_info where address = 'AmyHmxrA6WQX1uzPrgxTRsMzAKDUbX4dHvwR9RjHMkdb'

delete from tx_flow where type = 'SPAWN_REWARD' and status = 'PENDING'

