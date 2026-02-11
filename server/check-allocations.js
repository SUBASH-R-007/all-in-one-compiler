
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

        const orders = await UserQuestionOrder.find({ taskId: 1 });
        console.log(`Found ${orders.length} allocations for Task 1.`);
        orders.forEach(o => {
            console.log(`User: ${o.username}, Questions: ${o.questionOrder.length} [${o.questionOrder.join(', ')}]`);
        });

        const orders4 = await UserQuestionOrder.find({ taskId: 4 });
        console.log(`Found ${orders4.length} allocations for Task 4.`);
        orders4.forEach(o => {
            console.log(`User: ${o.username}, Questions: ${o.questionOrder.length} [${o.questionOrder.join(', ')}]`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
