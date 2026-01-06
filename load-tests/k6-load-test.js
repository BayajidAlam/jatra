import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 1000 }, // Ramp up to 1000 users
    { duration: '4m', target: 10000 }, // Sustain 10000 users
    { duration: '5m', target: 20000 }, // Ramp to 20000 users (Stress)
    { duration: '1m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests should be below 200ms
  },
};

const BASE_URL = 'http://localhost:3000'; // Or your ALB URL

export default function () {
  // 1. Search for Trains
  const searchRes = http.get(`${BASE_URL}/api/search?from=Dhaka&to=Chittagong&date=2026-01-15`);
  check(searchRes, {
    'search status is 200': (r) => r.status === 200,
    'search duration < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);

  // 2. View a specific Train (simulated)
  // const trainId = searchRes.json()[0]?.id; 
  // if (trainId) {
  //    http.get(`${BASE_URL}/api/trains/${trainId}`);
  // }
}
