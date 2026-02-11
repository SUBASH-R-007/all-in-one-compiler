
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/compiler_app';

const run = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Define schema
        const UserQuestionOrder = mongoose.model('UserQuestionOrder', new mongoose.Schema({
            username: String,
            taskId: Number,
            questionOrder: [String]
        }));

        // Reset for Task 1 and 4
        const result = await UserQuestionOrder.deleteMany({ taskId: { $in: [1, 4] } });
        console.log(`Deleted ${result.deletedCount} allocations for Task 1 and 4.`);

        console.log('Reset complete.');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
