import { env } from '../config/env';
import crypto from 'crypto';

/**
 * Cloudinary Storage Architecture
 * Provides signed upload signatures for client direct-to-cloud uploads,
 * asset transformations, and secure alumni verification document uploads.
 */
export interface CloudinarySignatureResult {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

export class UploadService {
  private static isConfigured(): boolean {
    return Boolean(
      env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
    );
  }

  /**
   * Generates a signed upload signature for direct browser-to-Cloudinary upload.
   * This avoids bottlenecking the Node.js server with large binary file streams.
   */
  static generateUploadSignature(
    folder = 'alumni-connect/documents',
    tags = 'verification'
  ): CloudinarySignatureResult {
    const timestamp = Math.round(new Date().getTime() / 1000);

    if (!this.isConfigured()) {
      // In development mode without credentials, return simulation signature
      return {
        signature: 'mock_signature_dev_mode',
        timestamp,
        apiKey: env.CLOUDINARY_API_KEY || 'demo_api_key',
        cloudName: env.CLOUDINARY_CLOUD_NAME || 'demo',
        folder,
      };
    }

    // SHA-1 signature based on Cloudinary API signing protocol:
    // folder=xxx&tags=xxx&timestamp=xxx + api_secret
    const paramsToSign = `folder=${folder}&tags=${tags}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

    return {
      signature,
      timestamp,
      apiKey: env.CLOUDINARY_API_KEY,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      folder,
    };
  }

  /**
   * Returns standard transformation URL for user avatars
   */
  static getOptimizedAvatarUrl(publicId: string, cloudName = env.CLOUDINARY_CLOUD_NAME): string {
    return `https://res.cloudinary.com/${cloudName}/image/upload/c_thumb,w_200,h_200,g_face,q_auto,f_auto/${publicId}`;
  }
}
