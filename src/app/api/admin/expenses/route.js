import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import dbConnect from "@/lib/dbConnect";
import Expense from "@/models/Expense";

// ─────────────────────────────────────────────
// GET /api/admin/expenses
// Fetch all expenses with summary stats
// ─────────────────────────────────────────────
export async function GET(request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    await dbConnect();

    const expenses = await Expense.find({}).sort({ date: -1, createdAt: -1 }).lean();

    const totalExpenseAmount = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    const categoryBreakdown = expenses.reduce((acc, item) => {
      const cat = item.category || "Other";
      acc[cat] = (acc[cat] || 0) + (Number(item.amount) || 0);
      return acc;
    }, {});

    return NextResponse.json(
      {
        success: true,
        count: expenses.length,
        totalExpenseAmount,
        categoryBreakdown,
        data: expenses,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/expenses error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch expenses", error: error.message },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// POST /api/admin/expenses
// Create a new expense record
// ─────────────────────────────────────────────
export async function POST(request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, amount, category, date, notes } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: "Expense title is required." },
        { status: 400 }
      );
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return NextResponse.json(
        { success: false, message: "Valid positive amount is required." },
        { status: 400 }
      );
    }

    const validCategories = ['Salary', 'Packaging', 'Utilities', 'Nursery Care', 'Other'];
    const chosenCategory = validCategories.includes(category) ? category : 'Other';

    await dbConnect();

    const expense = await Expense.create({
      title: title.trim(),
      amount: parsedAmount,
      category: chosenCategory,
      date: date ? new Date(date) : new Date(),
      notes: notes ? notes.trim() : "",
      createdBy: admin.name || admin.email || "Admin",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Expense recorded successfully!",
        data: expense,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/expenses error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to record expense", error: error.message },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// DELETE /api/admin/expenses
// Delete an expense record
// ─────────────────────────────────────────────
export async function DELETE(request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {
        // body might be empty, that's fine
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Expense ID is required." },
        { status: 400 }
      );
    }

    await dbConnect();

    const deleted = await Expense.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Expense not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Expense deleted successfully!",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/admin/expenses error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete expense", error: error.message },
      { status: 500 }
    );
  }
}
