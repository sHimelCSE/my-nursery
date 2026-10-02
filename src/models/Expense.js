import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an expense title'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an expense amount'],
      min: [0, 'Amount cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Please select an expense category'],
      enum: ['Salary', 'Packaging', 'Utilities', 'Nursery Care', 'Other'],
      default: 'Other',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: String,
      default: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Expense) {
  delete mongoose.models.Expense;
}

const Expense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);

export default Expense;
