require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const connectDB = require('../config/db');

const sampleExpenses = [
  { category: 'Education', amount: 850, description: 'Semester Textbook & Lab Manual', daysAgo: 1 },
  { category: 'Food', amount: 180, description: 'Campus Cafeteria Lunch', daysAgo: 2 },
  { category: 'Transportation', amount: 350, description: 'Monthly Metro Smart Card Recharge', daysAgo: 3 },
  { category: 'Food', amount: 120, description: 'Coffee & Snacks with Project Team', daysAgo: 4 },
  { category: 'Entertainment', amount: 280, description: 'Weekend Movie Ticket', daysAgo: 6 },
  { category: 'Hostel', amount: 2500, description: 'Monthly Hostel Room Maintenance Fee', daysAgo: 8 },
  { category: 'Bills', amount: 499, description: 'Student Mobile Postpaid & 5G Data Pack', daysAgo: 10 },
  { category: 'Shopping', amount: 750, description: 'College Backpack & Stationery', daysAgo: 12 },
  { category: 'Health', amount: 220, description: 'First Aid Kit & Vitamin Supplements', daysAgo: 15 },
  { category: 'Food', amount: 250, description: 'Hostel Mess Dinner Feast', daysAgo: 18 }
];

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Preparing demo student account...');
    // Remove previous demo student data if exists
    await User.deleteMany({ email: 'student@ictak.edu' });

    const demoUser = await User.create({
      name: 'Aditya Kumar',
      email: 'student@ictak.edu',
      password: 'student123'
    });

    console.log(`[Seed] Demo student created: ${demoUser.email} (Password: student123)`);

    // Clear old expenses and budgets for this user
    await Expense.deleteMany({ user: demoUser._id });
    await Budget.deleteMany({ user: demoUser._id });

    // Create current month's budget
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    await Budget.create({
      user: demoUser._id,
      month: currentMonth,
      year: currentYear,
      amount: 8000
    });
    console.log(`[Seed] Current month (${currentMonth}/${currentYear}) budget set to ₹8,000`);

    // Create sample expenses
    const expenseDocs = sampleExpenses.map(item => {
      const expDate = new Date();
      expDate.setDate(expDate.getDate() - item.daysAgo);
      return {
        user: demoUser._id,
        category: item.category,
        amount: item.amount,
        description: item.description,
        date: expDate
      };
    });

    await Expense.insertMany(expenseDocs);
    console.log(`[Seed] Successfully inserted ${expenseDocs.length} realistic student expenses.`);

    console.log('[Seed] Database seeding completed successfully! You can now log in.');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] ${error.message}`);
    process.exit(1);
  }
};

seedData();
