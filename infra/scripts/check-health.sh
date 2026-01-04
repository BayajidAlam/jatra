#!/bin/bash

# Script to check health of all Jatra services in Kubernetes
# Usage: ./check-health.sh

echo "🏥 Checking health of all Jatra services..."
echo ""

NAMESPACE="jatra"

# Check if namespace exists
if ! kubectl get namespace $NAMESPACE &> /dev/null; then
    echo "❌ Namespace '$NAMESPACE' not found"
    exit 1
fi

# Get all deployments
DEPLOYMENTS=$(kubectl get deployments -n $NAMESPACE -o jsonpath='{.items[*].metadata.name}')

echo "Services:"
echo "========================================="

for DEPLOYMENT in $DEPLOYMENTS; do
    # Get desired and ready replicas
    DESIRED=$(kubectl get deployment $DEPLOYMENT -n $NAMESPACE -o jsonpath='{.spec.replicas}')
    READY=$(kubectl get deployment $DEPLOYMENT -n $NAMESPACE -o jsonpath='{.status.readyReplicas}')
    READY=${READY:-0}
    
    if [ "$READY" -eq "$DESIRED" ]; then
        echo "✅ $DEPLOYMENT: $READY/$DESIRED replicas ready"
    else
        echo "❌ $DEPLOYMENT: $READY/$DESIRED replicas ready"
    fi
done

echo ""
echo "StatefulSets:"
echo "========================================="

# Check StatefulSets (postgres, rabbitmq)
STATEFULSETS=$(kubectl get statefulsets -n $NAMESPACE -o jsonpath='{.items[*].metadata.name}')

for STATEFULSET in $STATEFULSETS; do
    DESIRED=$(kubectl get statefulset $STATEFULSET -n $NAMESPACE -o jsonpath='{.spec.replicas}')
    READY=$(kubectl get statefulset $STATEFULSET -n $NAMESPACE -o jsonpath='{.status.readyReplicas}')
    READY=${READY:-0}
    
    if [ "$READY" -eq "$DESIRED" ]; then
        echo "✅ $STATEFULSET: $READY/$DESIRED replicas ready"
    else
        echo "❌ $STATEFULSET: $READY/$DESIRED replicas ready"
    fi
done

echo ""
echo "Pods:"
echo "========================================="
kubectl get pods -n $NAMESPACE

echo ""
echo "Services:"
echo "========================================="
kubectl get svc -n $NAMESPACE

echo ""
echo "HPA Status:"
echo "========================================="
kubectl get hpa -n $NAMESPACE

echo ""
echo "Ingress:"
echo "========================================="
kubectl get ingress -n $NAMESPACE

echo ""
echo "Recent Events:"
echo "========================================="
kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | tail -10
