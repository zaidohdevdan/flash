import { config } from 'dotenv';
import { z } from 'zod'

config({path: '../.env'})

const envSchema = z.object({
    // Database MongoDb
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

    // JWT Secret
    JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters'),

    // GitHub Token
    TOKEN_GIT: z.string().min(1, 'TOKEN_GIT is required'),

    // Cloudinary
    CLOUDINARY_CLOUD_NAME: z.string(),
    CLOUDINARY_API_KEY: z.string(),
    CLOUDINARY_API_SECRET: z.string(),
})

export const env = envSchema.parse(process.env)
export type EnvVariables = typeof env