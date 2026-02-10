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

// Define Task schema (without strict validation)
const Task = mongoose.model('Task', new mongoose.Schema({}, { strict: false }));

async function fixQuestionIds() {
    try {
        console.log('Finding tasks with questions without IDs...\n');

        const tasks = await Task.find({});
        let totalFixed = 0;

        for (const task of tasks) {
            if (!task.questions || task.questions.length === 0) {
                console.log(`Task ${task.id}: No questions`);
                continue;
            }

            let modified = false;

            for (let i = 0; i < task.questions.length; i++) {
                const question = task.questions[i];

                if (!question.id) {
                    // Generate ID for this question
                    const questionId = `r${task.id}-q${i + 1}`;
                    question.id = questionId;
                    modified = true;
                    totalFixed++;
                    console.log(`  ✓ Added ID ${questionId} to question ${i + 1}`);
                }
            }

            if (modified) {
                await task.save();
                console.log(`  → Saved task ${task.id} with ${task.questions.length} questions\n`);
            } else {
                console.log(`Task ${task.id}: All ${task.questions.length} questions already have IDs ✓\n`);
            }
        }

        console.log(`\n✅ Migration complete! Fixed ${totalFixed} questions across ${tasks.length} tasks.`);
        console.log('All questions now have proper IDs for allocation.');

        process.exit(0);
    } catch (error) {
        console.error('Error fixing question IDs:', error);
        process.exit(1);
    }
}

fixQuestionIds();
