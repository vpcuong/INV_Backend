import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';

// Allowed file types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// File size limits (in bytes)
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Multer configuration for file uploads
 */
export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
      callback(null, filename);
    },
  }),
  fileFilter: (req, file, callback) => {
    const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

    if (!allowedTypes.includes(file.mimetype)) {
      return callback(
        new BadRequestException(
          `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
        ),
        false
      );
    }

    callback(null, true);
  },
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
};

/**
 * Image-only upload configuration
 */
export const imageUploadConfig: MulterOptions = {
  ...multerConfig,
  fileFilter: (req, file, callback) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      return callback(
        new BadRequestException(
          `Only image files are allowed. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`
        ),
        false
      );
    }
    callback(null, true);
  },
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
};
