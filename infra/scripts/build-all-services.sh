#!/bin/bash

# Build all microservices Docker images in parallel
# Usage: ./build-all-services.sh [max-parallel-builds]

MAX_PARALLEL=${1:-4}  # Default to 4 parallel builds
WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Service configurations: name:tag
services=(
  "auth-service:1.0"
  "booking-service:1.0"
  "notification-service:1.0"
  "payment-service:1.0"
  "schedule-service:1.0"
  "seat-reservation-service:1.0"
  "ticket-service:1.0"
  "user-service:1.0"
  "admin-service:1.0"
  "reporting-service:1.0"
  "search-service:1.0"
)

echo "🚀 Building ${#services[@]} services with max $MAX_PARALLEL parallel builds..."
echo "📁 Workspace: $WORKSPACE_ROOT"
echo ""

# Track build status
declare -A build_pids
declare -A build_logs
failed_builds=()

# Build function
build_service() {
  local service_config=$1
  IFS=':' read -r service tag <<< "$service_config"
  
  local log_file="/tmp/docker-build-$service.log"
  build_logs[$service]=$log_file
  
  echo "🔨 Building jatra/$service:$tag..."
  
  if docker build \
    -t "jatra/$service:$tag" \
    -f "apps/$service/Dockerfile" \
    "$WORKSPACE_ROOT" > "$log_file" 2>&1; then
    
    local size=$(docker images "jatra/$service:$tag" --format "{{.Size}}")
    echo "✅ $service built successfully ($size)"
    return 0
  else
    echo "❌ $service build failed (see $log_file)"
    return 1
  fi
}

# Build services with parallelism control
build_count=0
for service_config in "${services[@]}"; do
  IFS=':' read -r service tag <<< "$service_config"
  
  # Wait if we've hit the parallel limit
  while [ $(jobs -r | wc -l) -ge $MAX_PARALLEL ]; do
    sleep 1
  done
  
  # Start build in background
  build_service "$service_config" &
  build_pids[$service]=$!
  ((build_count++))
done

# Wait for all builds to complete
echo ""
echo "⏳ Waiting for all builds to complete..."
failed=0

for service in "${!build_pids[@]}"; do
  pid=${build_pids[$service]}
  if wait $pid; then
    : # Success, already logged
  else
    failed_builds+=("$service")
    ((failed++))
  fi
done

# Summary
echo ""
echo "======================================"
echo "📊 Build Summary"
echo "======================================"
echo "Total services: ${#services[@]}"
echo "Successful: $((${#services[@]} - failed))"
echo "Failed: $failed"

if [ $failed -gt 0 ]; then
  echo ""
  echo "❌ Failed builds:"
  for service in "${failed_builds[@]}"; do
    echo "  - $service (log: ${build_logs[$service]})"
  done
  exit 1
else
  echo ""
  echo "🎉 All services built successfully!"
  echo ""
  echo "📦 Images created:"
  docker images | grep "jatra/" | grep -E "$(IFS="|"; echo "${services[*]%%:*}")"
fi
