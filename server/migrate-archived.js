const { MongoClient } = require('mongodb');

async function main() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error("DATABASE_URL not found");
        process.exit(1);
    }
    const client = new MongoClient(url);

    try {
        await client.connect();
        const db = client.db('flash'); // Check DB name if needed
        const reportsCollection = db.collection('Report');

        console.log('Starting exact updateMany for missing isArchived fields...');
        const result = await reportsCollection.updateMany(
            { isArchived: { $exists: false } }, // Target documents without the field
            { $set: { isArchived: false } }     // Set it to false
        );

        console.log(`Migration complete. Matched ${result.matchedCount} reports, modified ${result.modifiedCount} reports.`);
    } finally {
        await client.close();
    }
}

main().catch(console.error);
