/**
 * Cloudinary Integration
 * Handle image uploads, transformations, and deletions
 */

const cloudinary = require('cloudinary').v2;
const config = require('../config');
const transforms = require('./transforms');

let initialized = false;

/**
 * Initialize Cloudinary
 */
function initialize() {
  if (initialized || config.mockMode) {
    return;
  }

  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: config.cloudinary.secure
  });

  initialized = true;
  console.log('Cloudinary initialized');
}

/**
 * Upload image from buffer
 * @param {Buffer} buffer - Image buffer
 * @param {string} folder - Cloudinary folder (e.g., 'nearrun/cards')
 * @param {string} publicId - Optional public ID
 * @param {Object} options - Additional upload options
 * @returns {Promise<Object>} Upload result
 */
async function uploadImage(buffer, folder, publicId = null, options = {}) {
  console.log(`Uploading image to folder: ${folder}`);

  if (config.mockMode) {
    return {
      public_id: publicId || `mock/${folder}/${Date.now()}`,
      secure_url: `https://res.cloudinary.com/mock/image/upload/${folder}/mock.jpg`,
      url: `http://res.cloudinary.com/mock/image/upload/${folder}/mock.jpg`,
      format: 'jpg',
      width: 1200,
      height: 1600,
      bytes: 150000,
      created_at: new Date().toISOString()
    };
  }

  initialize();

  try {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder,
        resource_type: 'image',
        ...options
      };

      if (publicId) {
        uploadOptions.public_id = publicId;
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Error uploading to Cloudinary:', error.message);
            reject(new Error(`Failed to upload image: ${error.message}`));
          } else {
            console.log(`Image uploaded: ${result.public_id}`);
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('Error uploading image:', error.message);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

/**
 * Upload image from URL
 * @param {string} url - Image URL
 * @param {string} folder - Cloudinary folder
 * @param {Object} options - Additional upload options
 * @returns {Promise<Object>} Upload result
 */
async function uploadFromUrl(url, folder, options = {}) {
  console.log(`Uploading image from URL to folder: ${folder}`);

  if (config.mockMode) {
    return {
      public_id: `mock/${folder}/${Date.now()}`,
      secure_url: url,
      url: url,
      format: 'jpg',
      width: 1200,
      height: 1600,
      bytes: 150000,
      created_at: new Date().toISOString()
    };
  }

  initialize();

  try {
    const result = await cloudinary.uploader.upload(url, {
      folder,
      resource_type: 'image',
      ...options
    });

    console.log(`Image uploaded from URL: ${result.public_id}`);
    return result;
  } catch (error) {
    console.error('Error uploading from URL:', error.message);
    throw new Error(`Failed to upload from URL: ${error.message}`);
  }
}

/**
 * Delete image
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
async function deleteImage(publicId) {
  console.log(`Deleting image: ${publicId}`);

  if (config.mockMode) {
    return {
      result: 'ok',
      public_id: publicId
    };
  }

  initialize();

  try {
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      console.log(`Image deleted: ${publicId}`);
    } else {
      console.warn(`Image deletion returned: ${result.result}`);
    }

    return result;
  } catch (error) {
    console.error('Error deleting image:', error.message);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

/**
 * Get optimized image URL with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {Object|string} options - Transformation options or preset name
 * @returns {string} Transformed image URL
 */
function getOptimizedUrl(publicId, options = {}) {
  if (config.mockMode) {
    return `https://res.cloudinary.com/mock/image/upload/t_${options.preset || 'default'}/${publicId}`;
  }

  initialize();

  let transformation;

  // If options is a string, treat it as a preset name
  if (typeof options === 'string') {
    transformation = transforms.getTransformation(options);
  } else if (options.preset) {
    transformation = transforms.getTransformation(options.preset);
  } else {
    transformation = options;
  }

  try {
    const url = cloudinary.url(publicId, {
      transformation,
      secure: true
    });

    return url;
  } catch (error) {
    console.error('Error generating optimized URL:', error.message);
    throw new Error(`Failed to generate optimized URL: ${error.message}`);
  }
}

/**
 * Get multiple image URLs with different transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {Array<string>} presets - Array of preset names
 * @returns {Object} Object with preset names as keys and URLs as values
 */
function getMultipleUrls(publicId, presets = ['thumbnail', 'card_preview', 'full_size']) {
  const urls = {};

  presets.forEach(preset => {
    urls[preset] = getOptimizedUrl(publicId, preset);
  });

  return urls;
}

/**
 * Upload and get URLs for all presets
 * @param {Buffer} buffer - Image buffer
 * @param {string} folder - Cloudinary folder
 * @param {string} publicId - Optional public ID
 * @returns {Promise<Object>} Upload result with URLs
 */
async function uploadWithUrls(buffer, folder, publicId = null) {
  const result = await uploadImage(buffer, folder, publicId);

  const urls = getMultipleUrls(result.public_id);

  return {
    ...result,
    urls
  };
}

/**
 * Get image metadata
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Image metadata
 */
async function getImageMetadata(publicId) {
  if (config.mockMode) {
    return {
      public_id: publicId,
      format: 'jpg',
      width: 1200,
      height: 1600,
      bytes: 150000,
      created_at: new Date().toISOString()
    };
  }

  initialize();

  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error('Error getting image metadata:', error.message);
    throw new Error(`Failed to get image metadata: ${error.message}`);
  }
}

module.exports = {
  initialize,
  uploadImage,
  uploadFromUrl,
  deleteImage,
  getOptimizedUrl,
  getMultipleUrls,
  uploadWithUrls,
  getImageMetadata,
  transforms
};
