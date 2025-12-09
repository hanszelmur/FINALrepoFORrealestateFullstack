import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

export interface ProcessedImages {
    resized: string;
    thumbnail: string;
}

/**
 * Process uploaded image: resize main image and create thumbnail
 * @param filePath - Original file path
 * @returns Object with paths to resized and thumbnail images
 */
export async function processImage(filePath: string): Promise<ProcessedImages> {
    const directory = path.dirname(filePath);
    const filename = path.basename(filePath, path.extname(filePath));
    const ext = '.jpg'; // Always output as JPEG

    const resizedPath = path.join(directory, `${filename}-1200x800${ext}`);
    const thumbnailPath = path.join(directory, `${filename}-thumb${ext}`);

    try {
        // Resize main image to 1200x800
        await sharp(filePath)
            .resize(1200, 800, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 85 })
            .toFile(resizedPath);

        // Create thumbnail 400x300
        await sharp(filePath)
            .resize(400, 300, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 80 })
            .toFile(thumbnailPath);

        // Delete original file
        try {
            await fs.unlink(filePath);
        } catch (error: any) {
            if (error.code !== 'ENOENT') {
                console.error('Warning: Could not delete original file:', error.message);
            }
        }

        return {
            resized: resizedPath,
            thumbnail: thumbnailPath
        };
    } catch (error) {
        // Clean up on error
        try {
            await fs.unlink(filePath);
            if (await fileExists(resizedPath)) await fs.unlink(resizedPath);
            if (await fileExists(thumbnailPath)) await fs.unlink(thumbnailPath);
        } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
        }
        throw error;
    }
}

/**
 * Delete image files (main and thumbnail)
 * @param photoPath - Path to main photo
 * @param thumbnailPath - Path to thumbnail
 */
export async function deleteImages(photoPath: string, thumbnailPath: string): Promise<void> {
    try {
        if (await fileExists(photoPath)) {
            await fs.unlink(photoPath);
        }
    } catch (error) {
        console.error('Error deleting main photo:', error);
    }

    try {
        if (await fileExists(thumbnailPath)) {
            await fs.unlink(thumbnailPath);
        }
    } catch (error) {
        console.error('Error deleting thumbnail:', error);
    }
}

/**
 * Check if file exists
 * @param filePath - Path to check
 */
async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Ensure upload directory exists
 * @param directory - Directory path
 */
export async function ensureUploadDirectory(directory: string): Promise<void> {
    try {
        await fs.mkdir(directory, { recursive: true });
    } catch (error) {
        throw new Error(`Failed to create upload directory: ${error}`);
    }
}
