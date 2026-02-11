require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
// const csv = require('csv-parser'); // Removed dependency

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/compiler_app';

const QuestionSchema = new mongoose.Schema({
    id: { type: String },
    content: { type: String, required: true },
    type: { type: String },
    language: { type: String },
    codeSnippet: { type: String },
    sampleInput: { type: String },
    sampleOutput: { type: String },
    externalUrl: { type: String }
});

const TaskSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    difficulty: { type: String },
    points: { type: Number },
    type: { type: String },
    questions: [QuestionSchema]
});

const Task = mongoose.model('Task', TaskSchema);

// Simple CSV parser helper since csv-parser might not be installed
function parseCSV(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n');
    const headers = lines[0].trim().split(',');
    const results = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].trim().split(',');
        const obj = {};
        // Handle potential commas in fields (basic implementations)
        if (values.length === headers.length) {
            for (let j = 0; j < headers.length; j++) {
                obj[headers[j].trim()] = values[j].trim();
            }
            results.push(obj);
        }
    }
    return results;
}

async function updateTaskQuestions(taskId, csvPath, type) {
    try {
        console.log(`Processing Task ID ${taskId} from ${csvPath}...`);
        const task = await Task.findOne({ id: taskId });

        const data = parseCSV(csvPath);
        console.log(`Parsed ${data.length} challenges.`);

        // Map CSV data to Question schema
        const newQuestions = data.map(row => ({
            id: row.ChallengeID,
            content: `Hackerrank Challenge: ${row.ChallengeID}`, // Placeholder content
            type: type,
            externalUrl: row.URL.startsWith('http') ? row.URL : `https://${row.URL}`
        }));

        if (task) {
            console.log(`Task ID ${taskId} found. Updating questions...`);
            const result = await Task.updateOne(
                { id: taskId },
                { $set: { questions: newQuestions } }
            );
            console.log(`Updated Task ${taskId}. Modified: ${result.modifiedCount}`);
        } else {
            console.log(`Task ID ${taskId} not found. Skipping.`);
        }
    } catch (err) {
        console.error(`Error updating Task ${taskId}:`, err);
    }
}

async function main() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Verify connection
        if (mongoose.connection.readyState !== 1) {
            console.error('MongoDB not connected');
            return;
        }

        const debugCSV = path.join(__dirname, 'New folder', 'HackerrankChallenges-Debug.csv');
        const codingCSV = path.join(__dirname, 'New folder', 'HackerrankChallenges-Coding.csv');

        // Read and parse CSVs
        const debugQuestions = fs.existsSync(debugCSV) ? parseCSV(debugCSV).map(row => ({
            id: row.ChallengeID,
            content: `Hackerrank Debugging Challenge: ${row.ChallengeID}`,
            type: 'debugging',
            externalUrl: row.URL.startsWith('http') ? row.URL : `https://${row.URL}`
        })) : [];

        const codingQuestions = fs.existsSync(codingCSV) ? parseCSV(codingCSV).map(row => ({
            id: row.ChallengeID,
            content: `Hackerrank Coding Challenge: ${row.ChallengeID}`,
            type: 'coding',
            externalUrl: row.URL.startsWith('http') ? row.URL : `https://${row.URL}`
        })) : [];


        console.log(`Parsed ${debugQuestions.length} debug challenges.`);
        console.log(`Parsed ${codingQuestions.length} coding challenges.`);

        // Update Task 2 (Debug)
        if (debugQuestions.length > 0) {
            const result = await Task.updateOne(
                { id: 2 },
                { $set: { questions: debugQuestions } }
            );
            console.log(`Updated Task 2 (Debug): ${result.modifiedCount}`);
        } else {
            console.log("Debug CSV not found or empty, skipping Task 2 update.");
        }

        // Update Task 3 (Coding)
        if (codingQuestions.length > 0) {
            const result = await Task.updateOne(
                { id: 3 },
                { $set: { questions: codingQuestions } }
            );
            console.log(`Updated Task 3 (Coding): ${result.modifiedCount}`);
        } else {
            console.log("Coding CSV not found or empty, skipping Task 3 update.");
        }

    } catch (err) {
        console.error('Script error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Done');
    }
}

main();
