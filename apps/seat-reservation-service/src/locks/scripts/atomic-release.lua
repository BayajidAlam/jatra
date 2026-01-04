-- Atomic multi-seat lock release with Lua script
-- Ensures all seats belonging to a lock are released atomically

local journeyId = ARGV[1]
local userId = ARGV[2]
local seatCount = tonumber(ARGV[3])

local releasedCount = 0

for i = 4, 3 + seatCount do
    local seatId = ARGV[i]
    local key = "seat:lock:" .. journeyId .. ":" .. seatId
    
    -- Only release if lock exists and belongs to this user
    local lockOwner = redis.call("GET", key)
    if lockOwner == userId then
        redis.call("DEL", key)
        releasedCount = releasedCount + 1
    end
end

return releasedCount
