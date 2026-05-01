import mongoose from 'mongoose';

const TokenSchema = mongoose.Schema({
    token: {
      type: String,
      required: true,
      unique: true,
    },
    authorID: {
      type: String,
      required: true,
      // no unique here
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7d
      index: { expires: 0 }  // MongoDB TTL — auto deletes after expiry
    }
  }, { timestamps: true });

export const RefTokenModel = mongoose.model("refreshTokens", TokenSchema);