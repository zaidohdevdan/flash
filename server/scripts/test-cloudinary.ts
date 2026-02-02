
import { PrismaClient } from '../src/generated/prisma';
import { MediaService } from '../src/services/MediaService';
import { PrismaMediaRepository } from '../src/repositories/implementations/PrismaMediaRepository';
import { prisma } from '../src/lib/prisma';

async function testCloudinary() {
    console.log('--- Testing Cloudinary Upload ---');
    const mediaRepo = new PrismaMediaRepository(prisma);
    const mediaService = new MediaService(mediaRepo);

    // Create a 1x1 transparent pixel GIF buffer
    const dummyBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

    try {
        const user = await prisma.user.findFirst({ where: { role: 'PROFESSIONAL' } });
        if (!user) throw new Error('User not found');

        console.log('Attempting upload to Cloudinary...');
        const media = await mediaService.uploadFromBuffer({
            buffer: dummyBuffer,
            userId: user.id,
            options: { folder: 'test_cleanup' }
        });

        console.log('Upload SUCCEEDED:', media.secureUrl);
        console.log('Media Record created in DB:', media.id);

        // Cleanup
        await mediaService.deleteByPublicId(media.publicId);
        console.log('Cloudinary media and DB record deleted.');

    } catch (error: any) {
        console.error('FAILED Cloudinary Test:');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

testCloudinary();
