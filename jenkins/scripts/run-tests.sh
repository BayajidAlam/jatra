#!/bin/bash
# Run tests for changed or all services

set -e

BUILD_MODE=$1
CHANGED_SERVICES=$2

echo "🧪 Running tests..."
echo "Build Mode: ${BUILD_MODE}"
echo "Changed Services: ${CHANGED_SERVICES}"

# Determine which services to test
if [ "${BUILD_MODE}" = "ALL_SERVICES" ] || [ -z "${CHANGED_SERVICES}" ]; then
    SERVICES_TO_TEST="auth-service booking-service payment-service seat-reservation-service schedule-service ticket-service notification-service"
else
    SERVICES_TO_TEST="${CHANGED_SERVICES}"
fi

echo "Services to test: ${SERVICES_TO_TEST}"

# Track test results
FAILED_TESTS=""
PASSED_TESTS=""

for service in ${SERVICES_TO_TEST}; do
    SERVICE_DIR="apps/${service}"
    
    if [ ! -d "${SERVICE_DIR}" ]; then
        echo "⚠️  Service directory not found: ${SERVICE_DIR}, skipping..."
        continue
    fi
    
    echo ""
    echo "Testing ${service}..."
    
    # Check if package.json exists (Node.js service)
    if [ -f "${SERVICE_DIR}/package.json" ]; then
        cd "${SERVICE_DIR}"
        
        # Check if test script exists
        if grep -q '"test"' package.json; then
            echo "  Running npm test..."
            if npm test 2>&1 | tee test-output.log; then
                echo "  ✅ Tests passed for ${service}"
                PASSED_TESTS="${PASSED_TESTS} ${service}"
            else
                echo "  ❌ Tests failed for ${service}"
                FAILED_TESTS="${FAILED_TESTS} ${service}"
            fi
        else
            echo "  ⚠️  No test script found in package.json, skipping..."
            PASSED_TESTS="${PASSED_TESTS} ${service}"
        fi
        
        cd - > /dev/null
    # Check if it's a Go service
    elif [ -f "${SERVICE_DIR}/go.mod" ]; then
        cd "${SERVICE_DIR}"
        
        echo "  Running go test..."
        if go test ./... -v 2>&1 | tee test-output.log; then
            echo "  ✅ Tests passed for ${service}"
            PASSED_TESTS="${PASSED_TESTS} ${service}"
        else
            echo "  ❌ Tests failed for ${service}"
            FAILED_TESTS="${FAILED_TESTS} ${service}"
        fi
        
        cd - > /dev/null
    else
        echo "  ⚠️  Unknown service type, skipping tests..."
        PASSED_TESTS="${PASSED_TESTS} ${service}"
    fi
done

# Summary
echo ""
echo "📊 Test Summary:"
echo "================"
echo "Passed: ${PASSED_TESTS:-none}"
echo "Failed: ${FAILED_TESTS:-none}"

if [ -n "${FAILED_TESTS}" ]; then
    echo ""
    echo "❌ Some tests failed. Review the logs above."
    exit 1
fi

echo ""
echo "✅ All tests passed!"
exit 0
