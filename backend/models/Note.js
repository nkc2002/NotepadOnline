import mongoose from 'mongoose';
import { generateUniqueShareId } from '../utils/nanoid.js';

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      maxlength: [1000000, 'Content cannot exceed 1MB'],
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null for guest notes
      index: true,
    },
    shareId: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple null values but unique non-null values
      index: true,
    },
    expireAt: {
      type: Date,
      default: null,
      index: true, // TTL index for automatic deletion
    },
    editToken: {
      type: String,
      default: null,
      select: false, // Don't return editToken by default for security
    },
    views: {
      type: Number,
      default: 0,
    },
    isEncrypted: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 50,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Indexes
noteSchema.index({ shareId: 1 }, { unique: true, sparse: true });
noteSchema.index({ owner: 1 });
noteSchema.index({ isPublic: 1, createdAt: -1 });
noteSchema.index({ owner: 1, createdAt: -1 });

// TTL index for guest notes - automatically delete after expireAt
noteSchema.index(
  { expireAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { expireAt: { $exists: true, $ne: null } },
  }
);

// Pre-save middleware to generate unique shareId and editToken
noteSchema.pre('save', async function (next) {
  try {
    // Generate shareId if not exists and note is public or has expireAt
    if (!this.shareId && (this.isPublic || this.expireAt)) {
      this.shareId = await generateUniqueShareId(mongoose.model('Note'));
    }

    // Set default expireAt for guest notes (notes without owner)
    if (!this.owner && !this.expireAt) {
      // Guest notes expire after 7 days by default
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);
      this.expireAt = expiryDate;
    }

    // Generate editToken for guest notes if not exists
    if (!this.owner && !this.editToken && this.isNew) {
      const { generateEditToken, hashEditToken } = await import('../utils/jwt.js');
      const plainToken = generateEditToken();
      this.editToken = hashEditToken(plainToken);
      // Store plain token temporarily to return to user
      this._plainEditToken = plainToken;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Pre-update middleware to check shareId uniqueness on update
noteSchema.pre('findOneAndUpdate', async function (next) {
  try {
    const update = this.getUpdate();

    // If shareId is being updated, check for uniqueness
    if (update.shareId || update.$set?.shareId) {
      const newShareId = update.shareId || update.$set.shareId;
      const docId = this.getQuery()._id;

      const existing = await mongoose.model('Note').findOne({
        shareId: newShareId,
        _id: { $ne: docId },
      });

      if (existing) {
        throw new Error('ShareId already exists');
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Method to increment view count
noteSchema.methods.incrementViews = async function () {
  this.views += 1;
  await this.save();
};

// Method to check if note is expired
noteSchema.methods.isExpired = function () {
  if (!this.expireAt) return false;
  return new Date() > this.expireAt;
};

// Method to check if user can edit
noteSchema.methods.canEdit = function (userId) {
  if (!this.owner) return false; // Guest notes cannot be edited
  return this.owner.toString() === userId.toString();
};

// Method to verify edit token for guest notes
noteSchema.methods.verifyEditToken = async function (token) {
  if (!this.editToken) return false;
  const { verifyEditToken } = await import('../utils/jwt.js');
  return verifyEditToken(token, this.editToken);
};

// Method to get public JSON (safe for sharing)
noteSchema.methods.toPublicJSON = function (includeEditToken = false) {
  const json = {
    id: this._id,
    title: this.title,
    content: this.content,
    shareId: this.shareId,
    isPublic: this.isPublic,
    views: this.views,
    tags: this.tags,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    expiresAt: this.expireAt,
    isGuest: !this.owner,
  };

  // Include plain editToken only when creating new guest note
  if (includeEditToken && this._plainEditToken) {
    json.editToken = this._plainEditToken;
  }

  return json;
};

// Static method to find by shareId
noteSchema.statics.findByShareId = async function (shareId) {
  return await this.findOne({ shareId });
};

// Static method to find user notes
noteSchema.statics.findUserNotes = async function (userId, options = {}) {
  const { page = 1, limit = 10, sort = '-createdAt' } = options;

  return await this.find({ owner: userId })
    .sort(sort)
    .limit(limit)
    .skip((page - 1) * limit)
    .select('-__v');
};

// Static method to find public notes
noteSchema.statics.findPublicNotes = async function (options = {}) {
  const { page = 1, limit = 10, sort = '-createdAt' } = options;

  return await this.find({
    isPublic: true,
    $or: [{ expireAt: null }, { expireAt: { $gt: new Date() } }],
  })
    .sort(sort)
    .limit(limit)
    .skip((page - 1) * limit)
    .select('-__v');
};

const Note = mongoose.model('Note', noteSchema);

export default Note;
