#!/usr/bin/env node
/**
 * Redis Configuration Test
 * Tests Redis connection and basic operations for Jatra Railway services
 */

const Redis = require("redis");

const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD || "jatra_redis_pass",
};

async function testRedis() {
  console.log("🔴 Testing Redis Configuration...\n");

  console.log("Configuration:");
  console.log(`  Host: ${REDIS_CONFIG.host}`);
  console.log(`  Port: ${REDIS_CONFIG.port}`);
  console.log(`  Password: ${REDIS_CONFIG.password ? "***" : "none"}\n`);

  let client;

  try {
    // Create Redis client
    client = Redis.createClient({
      socket: {
        host: REDIS_CONFIG.host,
        port: REDIS_CONFIG.port,
      },
      password: REDIS_CONFIG.password,
    });

    client.on("error", (err) => console.error("❌ Redis Client Error:", err));

    // Connect
    await client.connect();
    console.log("✅ Connected to Redis\n");

    // Test 1: PING
    const pong = await client.ping();
    console.log(`✅ PING: ${pong}`);

    // Test 2: SET/GET
    await client.set("test:key", "Hello Jatra Railway!");
    const value = await client.get("test:key");
    console.log(`✅ SET/GET: ${value}`);

    // Test 3: SET with TTL (for seat locks)
    await client.setEx("test:lock:seat:A1", 10, "user123");
    const lockValue = await client.get("test:lock:seat:A1");
    const ttl = await client.ttl("test:lock:seat:A1");
    console.log(`✅ SET with TTL: ${lockValue} (expires in ${ttl}s)`);

    // Test 4: HASH operations (for cached data)
    await client.hSet("test:journey:123", {
      trainName: "Suborno Express",
      fromStation: "Dhaka",
      toStation: "Chittagong",
      availableSeats: "150",
    });
    const journey = await client.hGetAll("test:journey:123");
    console.log("✅ HASH operations:", journey);

    // Test 5: Database selection
    await client.select(0);
    console.log("✅ DB 0 selected (Seat Locks)");

    await client.select(1);
    console.log("✅ DB 1 selected (Search Cache)");

    // Clean up test keys
    await client.select(0);
    await client.del("test:key", "test:lock:seat:A1", "test:journey:123");
    console.log("\n✅ Test keys cleaned up");

    // Server info
    const info = await client.info("server");
    const versionMatch = info.match(/redis_version:(\S+)/);
    const version = versionMatch ? versionMatch[1] : "unknown";
    console.log(`\n📊 Redis Server Version: ${version}`);

    console.log("\n🎉 All Redis tests passed!");
    console.log("\n📝 Redis Usage:");
    console.log("  - DB 0: Seat reservation locks (seat-reservation-service)");
    console.log("  - DB 1: Search results cache (search-service)");
    console.log("  - Lock TTL: 600 seconds (10 minutes)");
    console.log("  - Cache TTL: 300-7200 seconds (5 min - 2 hours)");
  } catch (error) {
    console.error("\n❌ Redis Test Failed:", error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.quit();
      console.log("\n🔌 Disconnected from Redis");
    }
  }
}

testRedis();
