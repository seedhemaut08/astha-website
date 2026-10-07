// client/src/imagePaths.js
// Backend (MongoDB) still sends .png/.jpg paths.
// Convert them to the optimised .webp versions.

const IMAGE_PATH = /^\/images\/.+\.(png|jpe?g)$/i;

// Paths whose letter-case in the database does not match the real file name
const CASE_FIXES = {
  '/images/devotion/Frame.webp': '/images/devotion/frame.webp'
};

export function toWebp(value) {
  if (typeof value === 'string' && IMAGE_PATH.test(value)) {
    const converted = value.replace(/\.(png|jpe?g)$/i, '.webp');
    return CASE_FIXES[converted] || converted;
  }
  if (Array.isArray(value)) {
    return value.map(toWebp);
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value)) {
      out[key] = toWebp(value[key]);
    }
    return out;
  }
  return value;
}