export const SESSION_EXPIRES_AGE = 30 * 24 * 60 * 60;
export const SESSION_UPDATE_AGE = 15 * 24 * 60 * 60;
export const SESSION_CACHE_AGE = 5 * 60;
export const MAX_SESSIONS = 5;

/**
 * @param {number} [time=600] - The duration in seconds
 * @returns {Date} Calculated expiration date
 */
export const getExpirationDate = (time = 600) =>
  new Date(Date.now() + time * 1000);

export const isDateExpired = (date: Date) =>
  new Date().getTime() > date.getTime();
