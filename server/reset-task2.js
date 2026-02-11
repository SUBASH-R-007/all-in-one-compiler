
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/compiler_app';

const run = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Define schema minimally
        const UserQuestionOrder = mongoose.model('UserQuestionOrder', new mongoose.Schema({
            username: String,
            taskId: Number,
            questionOrder: [String]
        }));

        // Delete all allocations for Task 2
        const result = await UserQuestionOrder.deleteMany({ taskId: 2 });
        console.log(`Deleted ${result.deletedCount} allocations for Task 2.`);

        console.log('Reset complete.');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
