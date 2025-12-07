package middleware

import (
	"sync"
	"time"

	"github.com/BayajidAlam/jatra/api-gateway/config"
	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

type visitor struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

var (
	visitors = make(map[string]*visitor)
	mu       sync.RWMutex
)

func init() {
	go cleanupVisitors()
}

func cleanupVisitors() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		mu.Lock()
		for ip, v := range visitors {
			if time.Since(v.lastSeen) > 10*time.Minute {
				delete(visitors, ip)
			}
		}
		mu.Unlock()
	}
}

func getVisitor(ip string) *rate.Limiter {
	mu.Lock()
	defer mu.Unlock()
	v, exists := visitors[ip]
	if !exists {
		limiter := rate.NewLimiter(
			rate.Limit(config.AppConfig.RateLimitRequests)/rate.Limit(config.AppConfig.RateLimitWindowSeconds),
			config.AppConfig.RateLimitRequests,
		)
		visitors[ip] = &visitor{limiter, time.Now()}
		return limiter
	}
	v.lastSeen = time.Now()
	return v.limiter
}

func RateLimiter() gin.HandlerFunc {
	return func(c *gin.Context) {
		limiter := getVisitor(c.ClientIP())
		if !limiter.Allow() {
			c.JSON(429, gin.H{"error": "Rate limit exceeded"})
			c.Abort()
			return
		}
		c.Next()
	}
}
