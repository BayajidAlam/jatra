package config

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                      string
	GinMode                   string
	JWTAccessSecret           string
	JWTRefreshSecret          string
	AuthServiceURL            string
	ScheduleServiceURL        string
	SeatReservationServiceURL string
	PaymentServiceURL         string
	BookingServiceURL         string
	TicketServiceURL          string
	NotificationServiceURL    string
	UserServiceURL            string
	SearchServiceURL          string
	AdminServiceURL           string
	ReportingServiceURL       string
	RateLimitRequests         int
	RateLimitWindowSeconds    int
	CORSAllowedOrigins        []string
	CORSAllowedMethods        []string
	CORSAllowedHeaders        []string
	LogLevel                  string
}

var AppConfig *Config

func LoadConfig() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	rateLimitRequests, _ := strconv.Atoi(getEnv("RATE_LIMIT_REQUESTS", "100"))
	rateLimitWindow, _ := strconv.Atoi(getEnv("RATE_LIMIT_WINDOW_SECONDS", "60"))

	AppConfig = &Config{
		Port:                      getEnv("PORT", "3000"),
		GinMode:                   getEnv("GIN_MODE", "debug"),
		JWTAccessSecret:           getEnv("JWT_ACCESS_SECRET", "your-secret-key-change-in-production"),
		JWTRefreshSecret:          getEnv("JWT_REFRESH_SECRET", "your-refresh-secret-key-change-in-production"),
		AuthServiceURL:            getEnv("AUTH_SERVICE_URL", "http://localhost:3001"),
		ScheduleServiceURL:        getEnv("SCHEDULE_SERVICE_URL", "http://localhost:3002"),
		SeatReservationServiceURL: getEnv("SEAT_RESERVATION_SERVICE_URL", "http://localhost:3003"),
		PaymentServiceURL:         getEnv("PAYMENT_SERVICE_URL", "http://localhost:3004"),
		BookingServiceURL:         getEnv("BOOKING_SERVICE_URL", "http://localhost:3005"),
		TicketServiceURL:          getEnv("TICKET_SERVICE_URL", "http://localhost:3006"),
		NotificationServiceURL:    getEnv("NOTIFICATION_SERVICE_URL", "http://localhost:3007"),
		UserServiceURL:            getEnv("USER_SERVICE_URL", "http://localhost:3008"),
		SearchServiceURL:          getEnv("SEARCH_SERVICE_URL", "http://localhost:3009"),
		AdminServiceURL:           getEnv("ADMIN_SERVICE_URL", "http://localhost:3010"),
		ReportingServiceURL:       getEnv("REPORTING_SERVICE_URL", "http://localhost:3011"),
		RateLimitRequests:         rateLimitRequests,
		RateLimitWindowSeconds:    rateLimitWindow,
		CORSAllowedOrigins:        strings.Split(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:3001,http://localhost:5173"), ","),
		CORSAllowedMethods:        strings.Split(getEnv("CORS_ALLOWED_METHODS", "GET,POST,PUT,PATCH,DELETE,OPTIONS"), ","),
		CORSAllowedHeaders:        strings.Split(getEnv("CORS_ALLOWED_HEADERS", "Content-Type,Authorization"), ","),
		LogLevel:                  getEnv("LOG_LEVEL", "info"),
	}

	log.Println("✅ Configuration loaded successfully")
	log.Printf("🌐 API Gateway will run on port: %s", AppConfig.Port)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
