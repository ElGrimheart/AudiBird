// Background service workers
import '../workers/new-detection-worker.js'
import '../workers/daily-summary-worker.js';
import '../workers/new-user-worker.js';
import '../workers/low-storage-worker.js';
import 'dotenv/config';

console.log('New detection worker initialized');
console.log('Daily summary worker initialized');
console.log('New user worker initialized');
console.log('Low storage worker initialized');