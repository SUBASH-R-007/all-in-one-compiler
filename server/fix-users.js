require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/compiler_app';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Define User model (without strict schema)
const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

async function fixUsers() {
    try {
        console.log('Finding users without email...');

        // Update all users that don't have an email field
        const result = await User.updateMany(
            { email: { $exists: false } },
            { $set: { email: 'noemail@placeholder.com' } }
        );

        console.log(`Updated ${result.modifiedCount} users with default email`);

        // Also check for null or empty emails
        const result2 = await User.updateMany(
            { $or: [{ email: null }, { email: '' }] },
            { $set: { email: 'noemail@placeholder.com' } }
        );

        console.log(`Updated ${result2.modifiedCount} users with null/empty email`);

        // List all users to verify
        const users = await User.find({});
        console.log('\nAll users:');
        users.forEach(user => {
            console.log(`  - ${user.username}: ${user.email || 'NO EMAIL'}`);
        });

        console.log('\nMigration complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing users:', error);
        process.exit(1);
    }
}

fixUsers();
