/**
 * Cloudinary Image Transformations
 * Predefined transformation presets for different use cases
 */

/**
 * Card preview transformation (for customer viewing)
 * 600x800px, optimized quality
 */
const cardPreviewTransform = {
  width: 600,
  height: 800,
  crop: 'fill',
  gravity: 'center',
  quality: 'auto:good',
  fetch_format: 'auto',
  dpr: 'auto',
  flags: 'progressive'
};

/**
 * Thumbnail transformation (for lists/grids)
 * 200x300px, optimized quality
 */
const thumbnailTransform = {
  width: 200,
  height: 300,
  crop: 'fill',
  gravity: 'center',
  quality: 'auto:eco',
  fetch_format: 'auto',
  dpr: 'auto'
};

/**
 * Delivery proof transformation (for mailer photos)
 * 800x600px, watermarked
 */
const deliveryProofTransform = {
  width: 800,
  height: 600,
  crop: 'limit',
  quality: 'auto:good',
  fetch_format: 'auto',
  overlay: {
    text: 'NearRun Delivery Proof',
    font_family: 'Arial',
    font_size: 30,
    font_weight: 'bold',
    opacity: 30
  },
  gravity: 'south_east',
  x: 10,
  y: 10
};

/**
 * Full size transformation (original quality)
 * For printing or high-res viewing
 */
const fullSizeTransform = {
  quality: 'auto:best',
  fetch_format: 'auto',
  flags: 'progressive'
};

/**
 * Avatar/profile picture transformation
 * 200x200px circle crop
 */
const avatarTransform = {
  width: 200,
  height: 200,
  crop: 'fill',
  gravity: 'face',
  radius: 'max',
  quality: 'auto:good',
  fetch_format: 'auto',
  dpr: 'auto'
};

/**
 * Get transformation by name
 * @param {string} name - Transformation preset name
 * @returns {Object} Transformation configuration
 */
function getTransformation(name) {
  const transforms = {
    card_preview: cardPreviewTransform,
    thumbnail: thumbnailTransform,
    delivery_proof: deliveryProofTransform,
    full_size: fullSizeTransform,
    avatar: avatarTransform
  };

  return transforms[name] || fullSizeTransform;
}

/**
 * Build transformation string for Cloudinary URL
 * @param {Object} transform - Transformation object
 * @returns {string} Transformation string
 */
function buildTransformString(transform) {
  const parts = [];

  if (transform.width) parts.push(`w_${transform.width}`);
  if (transform.height) parts.push(`h_${transform.height}`);
  if (transform.crop) parts.push(`c_${transform.crop}`);
  if (transform.gravity) parts.push(`g_${transform.gravity}`);
  if (transform.quality) parts.push(`q_${transform.quality}`);
  if (transform.fetch_format) parts.push(`f_${transform.fetch_format}`);
  if (transform.dpr) parts.push(`dpr_${transform.dpr}`);
  if (transform.radius) parts.push(`r_${transform.radius}`);
  if (transform.flags) parts.push(`fl_${transform.flags}`);

  return parts.join(',');
}

/**
 * Create custom transformation for responsive images
 * @param {number} width - Target width
 * @param {number} height - Target height (optional)
 * @param {Object} options - Additional options
 * @returns {Object} Transformation object
 */
function createResponsiveTransform(width, height = null, options = {}) {
  const transform = {
    width,
    crop: options.crop || 'fill',
    quality: options.quality || 'auto:good',
    fetch_format: 'auto',
    dpr: 'auto',
    ...options
  };

  if (height) {
    transform.height = height;
  }

  return transform;
}

module.exports = {
  cardPreviewTransform,
  thumbnailTransform,
  deliveryProofTransform,
  fullSizeTransform,
  avatarTransform,
  getTransformation,
  buildTransformString,
  createResponsiveTransform
};
