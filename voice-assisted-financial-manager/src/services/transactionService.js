import { supabase } from "../lib/supabase";

/**
 * Transaction Service
 * Handles all transaction-related database operations
 */

export class TransactionService {
  // Create a new transaction
  static async createTransaction(userId, transactionData) {
    try {
      console.log("💾 Creating transaction:", transactionData);

      const { data, error } = await supabase
        .from("transactions")
        .insert([
          {
            user_id: userId,
            amount: transactionData.amount,
            description: transactionData.description,
            category: transactionData.category,
            type: transactionData.type,
          },
        ])
        .select();

      if (error) {
        throw error;
      }

      console.log("✅ Transaction created:", data[0]);
      return { success: true, data: data[0] };
    } catch (error) {
      console.error("❌ Error creating transaction:", error);
      return { success: false, error: error.message };
    }
  }

  // Create multiple transactions at once
  static async createMultipleTransactions(userId, transactionsData) {
    try {
      console.log(
        `💾 Creating ${transactionsData.length} transactions:`,
        transactionsData
      );

      const transactionRecords = transactionsData.map((transactionData) => ({
        user_id: userId,
        amount: transactionData.amount,
        description: transactionData.description,
        category: transactionData.category,
        type: transactionData.type,
      }));

      const { data, error } = await supabase
        .from("transactions")
        .insert(transactionRecords)
        .select();

      if (error) {
        throw error;
      }

      console.log(`✅ ${data.length} transactions created:`, data);
      return { success: true, data: data };
    } catch (error) {
      console.error("❌ Error creating transactions:", error);
      return { success: false, error: error.message };
    }
  }

  // Get user's transactions
  static async getUserTransactions(userId, limit = 10) {
    try {
      console.log("🔍 Loading transactions for user:", userId);

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      console.log("✅ Loaded transactions:", data?.length || 0);
      return { success: true, data: data || [] };
    } catch (error) {
      console.error("❌ Error loading transactions:", error);
      return { success: false, error: error.message };
    }
  }

  // Get transaction statistics
  static async getTransactionStats(userId) {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("amount, type, created_at")
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const monthlyTransactions = data.filter((t) => {
        const date = new Date(t.created_at);
        return (
          date.getMonth() === currentMonth && date.getFullYear() === currentYear
        );
      });

      const income = monthlyTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const expenses = monthlyTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return {
        success: true,
        data: {
          monthlyIncome: income,
          monthlyExpenses: expenses,
          balance: income - expenses,
          transactionCount: monthlyTransactions.length,
        },
      };
    } catch (error) {
      console.error("❌ Error calculating stats:", error);
      return { success: false, error: error.message };
    }
  }

  // Create transactions table if it doesn't exist
  static async createTransactionsTable() {
    try {
      console.log("🔧 Creating transactions table...");

      const { error } = await supabase.rpc("exec", {
        sql: `
          CREATE TABLE IF NOT EXISTS transactions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            amount DECIMAL(10,2) NOT NULL,
            description TEXT,
            category TEXT,
            type TEXT CHECK (type IN ('income', 'expense')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY IF NOT EXISTS "Users can only see their own transactions" ON transactions
            FOR ALL USING (auth.uid() = user_id);
        `,
      });

      if (error) {
        throw error;
      }

      console.log("✅ Transactions table created successfully");
      return { success: true };
    } catch (error) {
      console.error("❌ Error creating table:", error);
      return { success: false, error: error.message };
    }
  }

  // Check if transactions table exists
  static async checkTableExists() {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("id")
        .limit(1);

      return { exists: !error, error: error?.message };
    } catch (error) {
      return { exists: false, error: error.message };
    }
  }
}

export default TransactionService;
