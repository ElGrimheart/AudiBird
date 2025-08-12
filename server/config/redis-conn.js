// Potentially redundant - currently passing redis connection directly to service workers
import Redis from 'ioredis';

const options = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
};

if (process.env.REDIS_TLS === 'true') {
  options.tls = {};
}

const redisConn = new Redis(options);

export default redisConn;