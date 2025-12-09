import { customAlphabet } from 'nanoid';

// Tạo nanoid với alphabet custom (URL-safe)
// Loại bỏ các ký tự dễ nhầm lẫn: 0, O, I, l
const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 10);

/**
 * Generate unique shareId for notes
 * @returns {string} 10-character unique ID
 */
export const generateShareId = () => {
  return nanoid();
};

/**
 * Generate unique shareId and check for duplicates in database
 * @param {Model} Model - Mongoose model to check against
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<string>} Unique shareId
 */
export const generateUniqueShareId = async (Model, maxRetries = 5) => {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    const shareId = generateShareId();
    
    // Check if shareId already exists
    const exists = await Model.findOne({ shareId });
    
    if (!exists) {
      return shareId;
    }
    
    attempts++;
  }
  
  throw new Error('Failed to generate unique shareId after maximum retries');
};

export default { generateShareId, generateUniqueShareId };

