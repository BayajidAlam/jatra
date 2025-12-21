package circuitbreaker

import (
	"sync"
	"time"
)

// State represents the circuit breaker state
type State int

const (
	StateClosed State = iota
	StateOpen
	StateHalfOpen
)

// CircuitBreaker implements the circuit breaker pattern
type CircuitBreaker struct {
	maxFailures     int
	timeout         time.Duration
	halfOpenTimeout time.Duration

	mu              sync.RWMutex
	state           State
	failures        int
	lastFailureTime time.Time
	lastStateChange time.Time
}

// NewCircuitBreaker creates a new circuit breaker
func NewCircuitBreaker(maxFailures int, timeout, halfOpenTimeout time.Duration) *CircuitBreaker {
	return &CircuitBreaker{
		maxFailures:     maxFailures,
		timeout:         timeout,
		halfOpenTimeout: halfOpenTimeout,
		state:           StateClosed,
		lastStateChange: time.Now(),
	}
}

// Execute runs the given function through the circuit breaker
func (cb *CircuitBreaker) Execute(fn func() error) error {
	if !cb.canExecute() {
		return ErrCircuitOpen
	}

	err := fn()

	if err != nil {
		cb.recordFailure()
		return err
	}

	cb.recordSuccess()
	return nil
}

// canExecute checks if the request can be executed
func (cb *CircuitBreaker) canExecute() bool {
	cb.mu.Lock()
	defer cb.mu.Unlock()

	now := time.Now()

	switch cb.state {
	case StateClosed:
		return true

	case StateOpen:
		// Check if we should transition to half-open
		if now.Sub(cb.lastStateChange) >= cb.timeout {
			cb.state = StateHalfOpen
			cb.lastStateChange = now
			return true
		}
		return false

	case StateHalfOpen:
		// Allow limited requests in half-open state
		return true

	default:
		return false
	}
}

// recordFailure records a failed request
func (cb *CircuitBreaker) recordFailure() {
	cb.mu.Lock()
	defer cb.mu.Unlock()

	cb.failures++
	cb.lastFailureTime = time.Now()

	switch cb.state {
	case StateClosed:
		if cb.failures >= cb.maxFailures {
			cb.state = StateOpen
			cb.lastStateChange = time.Now()
		}

	case StateHalfOpen:
		// Any failure in half-open state reopens the circuit
		cb.state = StateOpen
		cb.lastStateChange = time.Now()
	}
}

// recordSuccess records a successful request
func (cb *CircuitBreaker) recordSuccess() {
	cb.mu.Lock()
	defer cb.mu.Unlock()

	switch cb.state {
	case StateHalfOpen:
		// Success in half-open state closes the circuit
		cb.state = StateClosed
		cb.failures = 0
		cb.lastStateChange = time.Now()

	case StateClosed:
		// Reset failure counter on success
		if cb.failures > 0 {
			// Gradually decrease failures on success
			cb.failures = cb.failures / 2
		}
	}
}

// GetState returns the current state of the circuit breaker
func (cb *CircuitBreaker) GetState() State {
	cb.mu.RLock()
	defer cb.mu.RUnlock()
	return cb.state
}

// GetFailures returns the current failure count
func (cb *CircuitBreaker) GetFailures() int {
	cb.mu.RLock()
	defer cb.mu.RUnlock()
	return cb.failures
}

// Reset manually resets the circuit breaker
func (cb *CircuitBreaker) Reset() {
	cb.mu.Lock()
	defer cb.mu.Unlock()

	cb.state = StateClosed
	cb.failures = 0
	cb.lastStateChange = time.Now()
}

// ErrCircuitOpen is returned when the circuit is open
var ErrCircuitOpen = &CircuitOpenError{}

type CircuitOpenError struct{}

func (e *CircuitOpenError) Error() string {
	return "circuit breaker is open"
}

// IsCircuitOpen checks if an error is a circuit open error
func IsCircuitOpen(err error) bool {
	_, ok := err.(*CircuitOpenError)
	return ok
}
