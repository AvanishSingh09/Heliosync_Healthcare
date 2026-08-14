import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  jwtSecret: process.env.JWT_SECRET || 'heliosync-development-secret-key-2026',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
};

export const prisma = new PrismaClient();
