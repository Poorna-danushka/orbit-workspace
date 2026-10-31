const env = require('../config/env');

const isAllowedSocketOrigin = (origin) => !origin || env.CORS_ORIGINS.includes(origin);

module.exports = { isAllowedSocketOrigin };
