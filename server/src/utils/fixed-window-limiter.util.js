const createFixedWindowLimiter = ({ limit, windowMs, now = Date.now }) => {
  const buckets = new Map();

  return {
    allow(key) {
      const currentTime = now();
      let bucket = buckets.get(key);

      if (!bucket || currentTime - bucket.startedAt >= windowMs) {
        bucket = { startedAt: currentTime, count: 0 };
      }

      if (bucket.count >= limit) {
        buckets.set(key, bucket);
        return false;
      }

      bucket.count += 1;
      buckets.set(key, bucket);
      return true;
    },
    clear(key) {
      buckets.delete(key);
    },
  };
};

module.exports = { createFixedWindowLimiter };
