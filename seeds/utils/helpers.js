/**
 * Helper utility functions for seeding data
 */

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a random UUID
 */
function generateId() {
  return uuidv4();
}

/**
 * Hash a password using bcrypt
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Get random element from array
 */
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get random elements from array
 */
function getRandomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Get random date within range
 */
function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Get random future date within range
 */
function getRandomFutureDate(daysMin = 1, daysMax = 60) {
  const now = new Date();
  const minDate = new Date(now.getTime() + daysMin * 24 * 60 * 60 * 1000);
  const maxDate = new Date(now.getTime() + daysMax * 24 * 60 * 60 * 1000);
  return getRandomDate(minDate, maxDate);
}

/**
 * Get random past date within range
 */
function getRandomPastDate(daysMin = 1, daysMax = 90) {
  const now = new Date();
  const minDate = new Date(now.getTime() - daysMax * 24 * 60 * 60 * 1000);
  const maxDate = new Date(now.getTime() - daysMin * 24 * 60 * 60 * 1000);
  return getRandomDate(minDate, maxDate);
}

/**
 * Generates a random boolean value with the specified probability
 * @param {number} probability - Probability of returning true (0 to 1)
 * @returns {boolean} - Random boolean
 */
function getRandomBoolean(probability = 0.5) {
  return Math.random() < probability;
}

/**
 * Generates a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Random integer
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  generateId,
  hashPassword,
  getRandomElement,
  getRandomElements,
  getRandomDate,
  getRandomFutureDate,
  getRandomPastDate,
  getRandomBoolean,
  getRandomInt
};
