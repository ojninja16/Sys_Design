// Simple S3-like storage service (mock)
export interface StorageFile {
  key: string;
  content: string;
  size: number;
  uploadedAt: string;
}

class MockStorageService {
  private files: Map<string, StorageFile> = new Map();

  async uploadFile(key: string, content: string): Promise<string> {
    const file: StorageFile = {
      key,
      content,
      size: content.length,
      uploadedAt: new Date().toISOString()
    };
    
    this.files.set(key, file);
    console.log(`📁 Uploaded file: ${key} (${file.size} bytes)`);
    return key;
  }

  async downloadFile(key: string): Promise<string | null> {
    const file = this.files.get(key);
    if (file) {
      console.log(`📥 Downloaded file: ${key}`);
      return file.content;
    }
    return null;
  }

  async deleteFile(key: string): Promise<boolean> {
    const deleted = this.files.delete(key);
    if (deleted) {
      console.log(`🗑️ Deleted file: ${key}`);
    }
    return deleted;
  }

  async listFiles(prefix: string = ''): Promise<string[]> {
    const keys = Array.from(this.files.keys())
      .filter(key => key.startsWith(prefix));
    console.log(`📋 Listed ${keys.length} files with prefix: ${prefix}`);
    return keys;
  }

  getFileUrl(key: string): string {
    return `https://mock-s3-bucket.s3.amazonaws.com/${key}`;
  }

  getStats() {
    return {
      totalFiles: this.files.size,
      totalSize: Array.from(this.files.values()).reduce((sum, file) => sum + file.size, 0)
    };
  }
}

// Singleton instance
export const storage = new MockStorageService();

/* 
// Real S3 implementation would be:
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

export class S3StorageService {
  private bucketName = process.env.S3_BUCKET_NAME || 'ai-app-generator';

  async uploadFile(key: string, content: string): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: key,
      Body: content,
      ContentType: 'application/zip'
    };
    
    const result = await s3.upload(params).promise();
    return result.Key;
  }

  async downloadFile(key: string): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: key
    };
    
    const result = await s3.getObject(params).promise();
    return result.Body?.toString() || '';
  }
}
*/