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

// Define UserQuestionOrder schema
const UserQuestionOrderSchema = new mongoose.Schema({
    username: String,
    taskId: Number,
    questionOrder: [String],
    createdAt: { type: Date, default: Date.now }
});

const UserQuestionOrder = mongoose.model('UserQuestionOrder', UserQuestionOrderSchema);

async function resetQuestionOrders() {
    try {
        console.log('Clearing all UserQuestionOrder entries...');

        const result = await UserQuestionOrder.deleteMany({});

        console.log(`Deleted ${result.deletedCount} question order entries`);
        console.log('\nAll users will now get fresh random question allocations!');
        console.log('Users should refresh their browser to see the new allocations.');

        process.exit(0);
    } catch (error) {
        console.error('Error resetting question orders:', error);
        process.exit(1);
    }
}

resetQuestionOrders();
