
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/compiler_app';

const QuestionSchema = new mongoose.Schema({
    id: String,
    content: String,
    type: String,
    externalUrl: String
});

const TaskSchema = new mongoose.Schema({
    id: Number,
    title: String,
    questions: [QuestionSchema],
    type: String, // debug for mismatch
    difficulty: String
});

const Task = mongoose.model('Task', TaskSchema);

async function checkTasks() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const tasks = await Task.find({ id: { $in: [1, 4] } });

        if (tasks.length === 0) {
            console.log('No tasks found with ID 1 or 4.');
            return;
        }

        tasks.forEach(task => {
            console.log(`\nTask ${task.id}: ${task.title}`);
            console.log(`Type: ${task.type}`);
            console.log(`Difficulty: ${task.difficulty}`);
            console.log(`Questions count: ${task.questions ? task.questions.length : 0}`);
            if (task.questions && task.questions.length > 0) {
                console.log('Sample Q:', JSON.stringify(task.questions[0], null, 2));
            } else {
                console.log('No questions found for this task in DB.');
            }
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkTasks();
