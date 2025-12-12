-- Atomic multi-seat locking with Lua script
-- This ensures all seats are locked atomically or none are locked

local journeyId = ARGV[1]
local userId = ARGV[2]
local ttl = tonumber(ARGV[3])
local seatCount = tonumber(ARGV[4])

-- Check availability of all seats first
for i = 5, 4 + seatCount do
    local seatId = ARGV[i]
    local key = "seat:lock:" .. journeyId .. ":" .. seatId
    
    -- If any seat is already locked, abort entire operation
    if redis.call("EXISTS", key) == 1 then
        return {0, seatId}  -- {success=false, failedSeatId}
    end
end

-- All seats available, lock them all
local lockedSeats = {}
for i = 5, 4 + seatCount do
    local seatId = ARGV[i]
    local key = "seat:lock:" .. journeyId .. ":" .. seatId
    
    -- Set lock with TTL and user info
    redis.call("SET", key, userId, "EX", ttl)
    table.insert(lockedSeats, seatId)
end

-- Return success with list of locked seats
return {1, table.concat(lockedSeats, ",")}  -- {success=true, lockedSeats}
