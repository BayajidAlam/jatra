# Reporting Service

Analytics and reporting service for the Jatra Railway system.

## Port
- **3011**

## Features

### Sales Reports
- Daily/weekly/monthly revenue reports
- Booking trends and patterns
- Payment method analytics
- Refund statistics

### Operations Reports  
- Train utilization reports
- Route performance metrics
- Seat occupancy analytics
- Journey completion rates

### User Analytics
- User registration trends
- Active user metrics
- Booking behavior analysis
- User demographics

### Financial Reports
- Revenue by route
- Revenue by train
- Commission and fees breakdown
- Period-over-period comparisons

## API Endpoints

### Sales
- `GET /api/reports/sales/revenue` - Revenue reports with date range
- `GET /api/reports/sales/bookings` - Booking statistics
- `GET /api/reports/sales/trends` - Booking trends over time

### Operations
- `GET /api/reports/operations/trains` - Train utilization
- `GET /api/reports/operations/routes` - Route performance
- `GET /api/reports/operations/occupancy` - Seat occupancy rates

### Users
- `GET /api/reports/users/growth` - User growth metrics
- `GET /api/reports/users/activity` - User activity patterns
- `GET /api/reports/users/demographics` - User demographics

### Financial
- `GET /api/reports/financial/summary` - Financial summary
- `GET /api/reports/financial/by-route` - Revenue by route
- `GET /api/reports/financial/by-train` - Revenue by train
