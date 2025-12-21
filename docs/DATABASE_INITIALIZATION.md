# Database Initialization - Automated Setup

## Overview

The database initialization is **fully automated** and **idempotent** - it can be run multiple times without issues.

## What It Does

### 1. Schema Creation (Idempotent)

- ✅ Creates all necessary ENUMs (Role, TrainType, CoachType, BookingStatus, PaymentStatus, etc.)
- ✅ Creates all database tables with proper relationships
- ✅ Creates indexes for optimized queries
- ✅ Skips if already exists - safe to run multiple times

### 2. Seed Data (Idempotent)

- ✅ Inserts 5 Bangladesh railway stations (Dhaka, Chittagong, Sylhet, Rajshahi, Khulna)
- ✅ Inserts 4 intercity trains
- ✅ Uses `ON CONFLICT DO NOTHING` - no duplicates created

### 3. Database Verification

- ✅ Verifies all 11 databases are accessible
- ✅ Creates necessary ENUMs in each database
- ✅ Ready for service deployments

## Databases Initialized

| Database            | Tables/ENUMs                                              | Status |
| ------------------- | --------------------------------------------------------- | ------ |
| auth_db             | users, refresh_tokens, Role enum                          | ✅     |
| schedule_db         | stations, trains, coaches, journeys, TrainType, CoachType | ✅     |
| booking_db          | BookingStatus enum                                        | ✅     |
| payment_db          | PaymentStatus, PaymentMethod enums                        | ✅     |
| seat_reservation_db | SeatStatus enum                                           | ✅     |
| ticket_db           | TicketStatus enum                                         | ✅     |
| notification_db     | NotificationType, NotificationStatus enums                | ✅     |
| user_db             | Accessible                                                | ✅     |
| search_db           | Accessible                                                | ✅     |
| admin_db            | Accessible                                                | ✅     |
| reporting_db        | Accessible                                                | ✅     |

## How It Works

### Automatic Execution

The initialization runs automatically during Jenkins deployment:

```groovy
stage('Initialize Database') {
    - Deletes old init job if exists
    - Applies init-database.yaml
    - Waits for completion (max 5 minutes)
    - Shows logs on failure
}
```

### Manual Execution

You can also run it manually:

```bash
# Delete old job
kubectl delete job init-database -n jatra --ignore-not-found=true

# Run initialization
kubectl apply -f infra/kubernetes/jobs/init-database.yaml

# Check status
kubectl get job init-database -n jatra

# View logs
kubectl logs job/init-database -n jatra
```

## Connection Details

- **Host**: `postgres-0.postgres-service` (direct to PostgreSQL for DDL)
- **User**: `jatra_user`
- **Databases**: 11 service databases + 4 system databases
- **Note**: Uses direct PostgreSQL connection (not pgbouncer) for schema operations

## Idempotency Features

✅ **CREATE TYPE IF NOT EXISTS** - Checks before creating ENUMs  
✅ **CREATE TABLE IF NOT EXISTS** - Checks before creating tables  
✅ **CREATE INDEX IF NOT EXISTS** - Checks before creating indexes  
✅ **ON CONFLICT DO NOTHING** - Prevents duplicate seed data  
✅ **Filtered output** - Suppresses NOTICE messages for cleaner logs

## Seed Data

### Stations

```sql
DHK - Dhaka (23.8103, 90.4125)
CTG - Chittagong (22.3569, 91.7832)
SYL - Sylhet (24.8949, 91.8687)
RJS - Rajshahi (24.3745, 88.6042)
KHL - Khulna (22.8456, 89.5403)
```

### Trains

```sql
SUBORNO-701 - Suborno Express (INTERCITY)
TURNA-741 - Turna Nishitha (INTERCITY)
SONAR-BANGLA-759 - Sonar Bangla Express (INTERCITY)
UPABAN-731 - Upaban Express (INTERCITY)
```

## Benefits

🎯 **No Manual Work**: Runs automatically on every deployment  
🔄 **Idempotent**: Safe to run multiple times  
🚀 **Fast**: Completes in ~5-10 seconds  
✅ **Verified**: Tests all database connections  
🌱 **Seeded**: Ready with sample data for testing  
📋 **Complete**: All tables, indexes, and relationships created

## Fresh Deployment

When you spin up a fresh Kubernetes cluster:

1. **Jenkins runs** → Builds services
2. **Deploys infrastructure** → PostgreSQL, Redis, RabbitMQ
3. **Runs init-database job** → Creates all schemas and seed data ✅
4. **Deploys services** → All services connect to ready databases
5. **Ready to use** → No manual intervention needed! 🎉

## Troubleshooting

### Check job status

```bash
kubectl get job init-database -n jatra
```

### View full logs

```bash
kubectl logs job/init-database -n jatra
```

### Check if tables exist

```bash
kubectl exec postgres-0 -n jatra -- psql -U jatra_user -d auth_db -c "\dt"
kubectl exec postgres-0 -n jatra -- psql -U jatra_user -d schedule_db -c "\dt"
```

### Verify seed data

```bash
# Check stations
curl http://192.168.49.2:30000/api/stations

# Check trains
curl http://192.168.49.2:30000/api/trains
```

## Next Steps

When you need to add migrations:

1. Add new SQL commands to `init-database.yaml`
2. Use `CREATE TABLE IF NOT EXISTS` pattern
3. Use `ON CONFLICT DO NOTHING` for seed data
4. Job will apply changes on next run automatically
