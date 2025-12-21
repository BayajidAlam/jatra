-- Extend lock TTL for multiple seats atomically
-- Only extends if lock exists and belongs to the user

local journeyId = ARGV[1]
local userId = ARGV[2]
local newTtl = tonumber(ARGV[3])
local seatCount = tonumber(ARGV[4])

local extendedCount = 0

for i = 5, 4 + seatCount do
    local seatId = ARGV[i]
    local key = "seat:lock:" .. journeyId .. ":" .. seatId
    
    -- Check if lock exists and belongs to this user
    local lockOwner = redis.call("GET", key)
    if lockOwner == userId then
        -- Extend TTL
        redis.call("EXPIRE", key, newTtl)
        extendedCount = extendedCount + 1
    end
end

return extendedCount
