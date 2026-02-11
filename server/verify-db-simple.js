const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/compiler_app';

const QuestionSchema = new mongoose.Schema({
    id: { type: String },
    content: { type: String },
    type: { type: String },
    externalUrl: { type: String }
});

const TaskSchema = new mongoose.Schema({
    id: { type: Number },
    title: { type: String },
    questions: [QuestionSchema]
});

const Task = mongoose.model('Task', TaskSchema);

async function checkTasks() {
    try {
        await mongoose.connect(MONGO_URI);

        const tasks = await Task.find({ id: { $in: [2, 3] } });

        tasks.forEach(task => {
            console.log(`Task: ${task.title} (ID: ${task.id})`);
            console.log(`Questions: ${task.questions.length}`);
            if (task.questions.length > 0) {
                console.log('Sample Q:', task.questions[0].id, task.questions[0].externalUrl);
            }
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkTasks();
