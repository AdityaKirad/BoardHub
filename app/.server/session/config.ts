export const SESSION_EXPIRES_AGE = 30 * 24 * 60 * 60;
export const SESSION_UPDATE_AGE = 15 * 24 * 60 * 60;
export const SESSION_CACHE_AGE = 5 * 60;
export const MAX_SESSIONS = 5;

/**
 * @param {number} time - The duration in seconds
 * @default 600 seconds (10 minutes)
 * @returns {Date} Calculated expiration date
 */
export const getExpirationDate = (time = 600) =>
  new Date(Date.now() + time * 1000);
