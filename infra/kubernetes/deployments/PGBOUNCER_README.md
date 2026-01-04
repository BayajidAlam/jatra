# PgBouncer Connection Pooling

## Overview

PgBouncer acts as a lightweight connection pooler between your microservices and PostgreSQL. It reduces the connection overhead and prevents connection exhaustion.

## Benefits

- **Connection Reuse**: Shares connections across multiple clients
- **Prevents Exhaustion**: Protects PostgreSQL from 100+ simultaneous connections
- **Transaction Mode**: Each transaction gets a connection, optimal for microservices
- **Lower Latency**: Reuses existing connections instead of creating new ones
- **Resource Efficiency**: 2 PgBouncer pods can handle 1000+ client connections with only 100 DB connections

## Configuration

### Pool Settings

- `pool_mode = transaction`: Connection released after each transaction
- `max_client_conn = 1000`: Total client connections allowed
- `default_pool_size = 25`: Connections per database
- `max_db_connections = 100`: Total PostgreSQL connections (stays under default 100 limit)

### How to Use

#### Option 1: Update All Services (Recommended)

Change `DATABASE_URL` in all service deployments from:

```
postgresql://jatra_user:jatra_password@postgres-service:5432/auth_db
```

To:

```
postgresql://jatra_user:jatra_password@pgbouncer-service:5432/auth_db
```

#### Option 2: Gradual Migration

1. Deploy PgBouncer: `kubectl apply -f infra/kubernetes/deployments/pgbouncer.yaml`
2. Test with one service first (e.g., search-service)
3. Monitor connection metrics
4. Roll out to all services

### Update Prisma Connection

In each service's `.env` or K8s secret:

```bash
# Before
DATABASE_URL=postgresql://jatra_user:jatra_password@postgres-service:5432/auth_db

# After (via PgBouncer)
DATABASE_URL=postgresql://jatra_user:jatra_password@pgbouncer-service:5432/auth_db
```

### Monitoring

Check PgBouncer stats:

```bash
# Connect to PgBouncer admin console
kubectl exec -it -n jatra deploy/pgbouncer -- psql -p 5432 -U jatra_user pgbouncer

# Inside pgbouncer console
SHOW POOLS;      # View pool statistics
SHOW STATS;      # Connection statistics
SHOW DATABASES;  # Database configurations
SHOW CLIENTS;    # Active client connections
SHOW SERVERS;    # Active server connections
```

### Connection Math

Before PgBouncer:

- 11 services × 2 pods × 10 Prisma connections = 220 connections
- PostgreSQL max_connections = 100
- **Result**: Connection refused errors ❌

After PgBouncer:

- 11 services × 2 pods → PgBouncer (1000 client connections)
- PgBouncer → PostgreSQL (100 connections, pooled)
- **Result**: All services work smoothly ✅

### Troubleshooting

**PgBouncer won't start:**

- Check `userlist.txt` format: `"username" "password"`
- Verify postgres-service is reachable

**Services can't connect:**

- Check if service is using `pgbouncer-service:5432`
- Verify credentials match
- Check PgBouncer logs: `kubectl logs -n jatra -l app=pgbouncer`

**Slow queries:**

- Transaction mode releases connections after each transaction
- For long-running analytics queries, consider direct PostgreSQL connection or read replica

### Production Considerations

1. **High Availability**: Scale PgBouncer replicas to 3+
2. **Resource Limits**: Adjust based on load testing
3. **Pool Sizes**: Tune per service needs (read-heavy vs write-heavy)
4. **Monitoring**: Integrate with Prometheus for metrics
5. **Secrets**: Use AWS Secrets Manager instead of ConfigMap for credentials
