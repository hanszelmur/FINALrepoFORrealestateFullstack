import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export const processImage = async (
    inputPath: string,
    outputPath: string,
    width: number,
    height: number
): Promise<void> => {
    await sharp(inputPath)
        .resize(width, height, {
            fit: 'cover',
            position: 'center'
        })
        .jpeg({ quality: 90 })
        .toFile(outputPath);
};

export const createThumbnail = async (
    inputPath: string,
    thumbnailPath: string
): Promise<void> => {
    await processImage(inputPath, thumbnailPath, 400, 300);
};

export const resizeMainImage = async (
    inputPath: string,
    outputPath: string
): Promise<void> => {
    await processImage(inputPath, outputPath, 1200, 800);
};

export const processPropertyPhoto = async (
    file: Express.Multer.File
): Promise<{ photoPath: string; thumbnailPath: string }> => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads/properties';
    const filename = path.basename(file.path, path.extname(file.path));
    
    const mainImagePath = path.join(uploadDir, `${filename}-main.jpg`);
    const thumbnailPath = path.join(uploadDir, `${filename}-thumb.jpg`);

    // Resize main image
    await resizeMainImage(file.path, mainImagePath);
    
    // Create thumbnail
    await createThumbnail(file.path, thumbnailPath);

    // Delete original uploaded file using async method
    try {
        await fs.promises.unlink(file.path);
    } catch (error) {
        console.error('Error deleting original file:', error);
    }

    return {
        photoPath: mainImagePath,
        thumbnailPath: thumbnailPath
    };
};
