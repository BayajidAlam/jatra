package proxy

import (
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func ProxyRequest(targetURL string) gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery
		fullURL := targetURL + path
		if query != "" {
			fullURL += "?" + query
		}

		req, err := http.NewRequest(c.Request.Method, fullURL, c.Request.Body)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create proxy request"})
			return
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
			c.JSON(http.StatusBadGateway, gin.H{"error": "Service unavailable"})
			return
		}
		defer resp.Body.Close()

		for key, values := range resp.Header {
			for _, value := range values {
				c.Writer.Header().Add(key, value)
			}
		}

		c.Status(resp.StatusCode)
		io.Copy(c.Writer, resp.Body)
	}
}
