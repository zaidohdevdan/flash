import { PrismaClient } from './src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting exact updateMany for missing isArchived fields using Prisma Raw...');

    // Commands in MongoDB run against the database
    // "update" is the collection name, "updates" is the array of ops
    const result = await prisma.$runCommandRaw({
        update: "Report",
        updates: [
            {
                q: { isArchived: { $exists: false } }, // target missing fields
                u: { $set: { isArchived: false } },   // set to false
                multi: true                           // update many
            }
        ]
    });

    console.log(`Migration complete.`);
    console.dir(result, { depth: null });
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
