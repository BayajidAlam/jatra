package proxy

import (
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/BayajidAlam/jatra/api-gateway/circuitbreaker"
	"github.com/gin-gonic/gin"
)

var (
	// Circuit breakers per service
	serviceCircuitBreakers = make(map[string]*circuitbreaker.CircuitBreaker)
)

func init() {
	// Initialize circuit breakers for each service
	// Max 5 failures, 30s timeout, 10s half-open
	serviceCircuitBreakers["auth"] = circuitbreaker.NewCircuitBreaker(5, 30*time.Second, 10*time.Second)
	serviceCircuitBreakers["schedule"] = circuitbreaker.NewCircuitBreaker(5, 30*time.Second, 10*time.Second)
	serviceCircuitBreakers["booking"] = circuitbreaker.NewCircuitBreaker(5, 30*time.Second, 10*time.Second)
	serviceCircuitBreakers["payment"] = circuitbreaker.NewCircuitBreaker(5, 30*time.Second, 10*time.Second)
	serviceCircuitBreakers["seat"] = circuitbreaker.NewCircuitBreaker(5, 30*time.Second, 10*time.Second)
	serviceCircuitBreakers["ticket"] = circuitbreaker.NewCircuitBreaker(5, 30*time.Second, 10*time.Second)
	serviceCircuitBreakers["notification"] = circuitbreaker.NewCircuitBreaker(5, 30*time.Second, 10*time.Second)
	serviceCircuitBreakers["user"] = circuitbreaker.NewCircuitBreaker(5, 30*time.Second, 10*time.Second)
	serviceCircuitBreakers["search"] = circuitbreaker.NewCircuitBreaker(5, 30*time.Second, 10*time.Second)
	serviceCircuitBreakers["admin"] = circuitbreaker.NewCircuitBreaker(5, 30*time.Second, 10*time.Second)
	serviceCircuitBreakers["reporting"] = circuitbreaker.NewCircuitBreaker(5, 30*time.Second, 10*time.Second)
}

func getServiceName(targetURL string) string {
	// Extract service name from URL (e.g., "http://auth-service:3001" -> "auth")
	if strings.Contains(targetURL, "auth-service") {
		return "auth"
	} else if strings.Contains(targetURL, "schedule-service") {
		return "schedule"
	} else if strings.Contains(targetURL, "booking-service") {
		return "booking"
	} else if strings.Contains(targetURL, "payment-service") {
		return "payment"
	} else if strings.Contains(targetURL, "seat-reservation-service") {
		return "seat"
	} else if strings.Contains(targetURL, "ticket-service") {
		return "ticket"
	} else if strings.Contains(targetURL, "notification-service") {
		return "notification"
	} else if strings.Contains(targetURL, "user-service") {
		return "user"
	} else if strings.Contains(targetURL, "search-service") {
		return "search"
	} else if strings.Contains(targetURL, "admin-service") {
		return "admin"
	} else if strings.Contains(targetURL, "reporting-service") {
		return "reporting"
	}
	return "unknown"
}

func ProxyRequest(targetURL string) gin.HandlerFunc {
	serviceName := getServiceName(targetURL)
	cb := serviceCircuitBreakers[serviceName]

	return func(c *gin.Context) {
		path := c.Request.URL.Path
		// Strip /api prefix when forwarding to backend services
		if strings.HasPrefix(path, "/api/") {
			path = strings.TrimPrefix(path, "/api")
		}
		query := c.Request.URL.RawQuery
		fullURL := targetURL + path
		if query != "" {
			fullURL += "?" + query
		}

		// Execute request through circuit breaker
		err := cb.Execute(func() error {
			req, err := http.NewRequest(c.Request.Method, fullURL, c.Request.Body)
			if err != nil {
				return err
			}

			for key, values := range c.Request.Header {
				for _, value := range values {
					req.Header.Add(key, value)
				}
			}

			if userId, exists := c.Get("userId"); exists {
				req.Header.Set("X-User-ID", userId.(string))
			}
			if email, exists := c.Get("email"); exists {
				req.Header.Set("X-User-Email", email.(string))
			}
			if role, exists := c.Get("role"); exists {
				req.Header.Set("X-User-Role", role.(string))
			}

			client := &http.Client{Timeout: 30 * time.Second}
			resp, err := client.Do(req)
			if err != nil {
				return err
			}
			defer resp.Body.Close()

			// Consider 5xx errors as failures
			if resp.StatusCode >= 500 {
				// Still return response to client, but record as failure
				for key, values := range resp.Header {
					for _, value := range values {
						c.Writer.Header().Add(key, value)
					}
				}
				c.Status(resp.StatusCode)
				io.Copy(c.Writer, resp.Body)
				return &ServiceError{StatusCode: resp.StatusCode}
			}

			for key, values := range resp.Header {
				for _, value := range values {
					c.Writer.Header().Add(key, value)
				}
			}

			c.Status(resp.StatusCode)
			io.Copy(c.Writer, resp.Body)
			return nil
		})

		if err != nil {
			if circuitbreaker.IsCircuitOpen(err) {
				c.JSON(http.StatusServiceUnavailable, gin.H{
					"error":   "Service temporarily unavailable",
					"message": "Circuit breaker is open. Service is experiencing issues.",
					"service": serviceName,
				})
				return
			}

			// Other errors (network, timeout, etc.)
			if _, ok := err.(*ServiceError); !ok {
				c.JSON(http.StatusBadGateway, gin.H{
					"error":   "Service unavailable",
					"message": err.Error(),
					"service": serviceName,
				})
			}
		}
	}
}

// ServiceError represents a 5xx error from the backend service
type ServiceError struct {
	StatusCode int
}

func (e *ServiceError) Error() string {
	return "service returned error status"
}
