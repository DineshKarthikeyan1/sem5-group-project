import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const SimpleVoiceTransaction = () => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // Simple speech recognition using browser's built-in API
  const startListening = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      setResult({
        success: false,
        error:
          "Speech recognition not supported in this browser. Try Chrome or Edge.",
      });
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsRecording(true);
      setResult(null);
      console.log("🎤 Listening...");
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscription(text);
      console.log("📝 Heard:", text);
      processTransaction(text);
    };

    recognition.onerror = (event) => {
      setIsRecording(false);
      setResult({
        success: false,
        error: `Speech recognition error: ${event.error}`,
      });
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  // Enhanced transaction processing - handles multiple transactions
  const processTransaction = async (text) => {
    if (!user?.id) {
      setResult({
        success: false,
        error: "User not authenticated",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Parse multiple transactions from the text
      const transactions = parseMultipleTransactions(text);

      if (transactions.length === 0) {
        setResult({
          success: false,
          error:
            'Could not find any transactions in your speech. Try saying something like "I spent $25 on coffee" or "I spent $15 on coffee and received $500 salary"',
        });
        setIsProcessing(false);
        return;
      }

      // Prepare transactions for database insertion
      const transactionData = transactions.map((transaction) => ({
        user_id: user.id,
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        type: transaction.type,
      }));

      // Insert all transactions into Supabase
      const { data, error } = await supabase
        .from("transactions")
        .insert(transactionData)
        .select();

      if (error) {
        throw error;
      }

      setResult({
        success: true,
        transactions: data,
        originalText: text,
        message: `${data.length} transaction${
          data.length > 1 ? "s" : ""
        } created successfully!`,
      });

      // Refresh transactions
      loadTransactions();
    } catch (error) {
      console.error("Transaction error:", error);
      setResult({
        success: false,
        error: error.message,
        suggestion: error.message.includes(
          'relation "transactions" does not exist'
        )
          ? "You need to create the transactions table first. Check the setup instructions."
          : "Try speaking more clearly with amounts and descriptions.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Enhanced parser for multiple transactions
  const parseMultipleTransactions = (text) => {
    const transactions = [];

    // Split text by common conjunctions that separate transactions
    const separators =
      /\s+and\s+(?=.*\$)|,\s*and\s+(?=.*\$)|,\s+(?=.*\$)|;\s*(?=.*\$)/gi;
    const segments = text.split(separators);

    // If no separators found, treat as single transaction
    if (segments.length === 1) {
      const transaction = parseSimpleTransaction(text);
      if (transaction.amount > 0) {
        transactions.push(transaction);
      }
      return transactions;
    }

    // Process each segment
    segments.forEach((segment, index) => {
      const trimmedSegment = segment.trim();
      if (!trimmedSegment) return;

      // For segments after the first, we might need to add context
      let processedSegment = trimmedSegment;

      // If segment doesn't start with "I", add context from previous patterns
      if (
        index > 0 &&
        !processedSegment
          .toLowerCase()
          .match(/^(i\s+)?(spent|received|earned|got|paid)/)
      ) {
        // Check if it looks like an income or expense based on keywords
        const lowerSegment = processedSegment.toLowerCase();
        if (
          lowerSegment.includes("salary") ||
          lowerSegment.includes("received") ||
          lowerSegment.includes("earned")
        ) {
          processedSegment = `I received ${processedSegment}`;
        } else {
          processedSegment = `I spent ${processedSegment}`;
        }
      }

      const transaction = parseSimpleTransaction(processedSegment);
      if (transaction.amount > 0) {
        transactions.push(transaction);
      }
    });

    return transactions;
  };

  // Simple transaction parser (enhanced for better parsing)
  const parseSimpleTransaction = (text) => {
    const lowerText = text.toLowerCase();

    // Extract amount (look for $X.XX or X dollars)
    let amount = 0;
    const dollarMatch = text.match(/\$(\d+(?:\.\d{2})?)/);
    const dollarsMatch = text.match(/(\d+(?:\.\d{2})?)\s*dollars?/i);

    if (dollarMatch) {
      amount = parseFloat(dollarMatch[1]);
    } else if (dollarsMatch) {
      amount = parseFloat(dollarsMatch[1]);
    }

    // Determine type (income vs expense)
    const incomeWords = [
      "received",
      "earned",
      "got paid",
      "salary",
      "income",
      "bonus",
      "paycheck",
      "payment",
    ];
    const expenseWords = ["spent", "paid", "bought", "purchased", "cost"];

    const hasIncomeWord = incomeWords.some((word) => lowerText.includes(word));
    const hasExpenseWord = expenseWords.some((word) =>
      lowerText.includes(word)
    );

    // Default to expense if ambiguous, but prefer income if income words are present
    let type = "expense";
    if (hasIncomeWord && !hasExpenseWord) {
      type = "income";
    } else if (hasIncomeWord && hasExpenseWord) {
      // If both are present, use context clues
      const incomeIndex = Math.min(
        ...incomeWords
          .map((word) => {
            const index = lowerText.indexOf(word);
            return index === -1 ? Infinity : index;
          })
          .filter((i) => i !== Infinity)
      );

      const expenseIndex = Math.min(
        ...expenseWords
          .map((word) => {
            const index = lowerText.indexOf(word);
            return index === -1 ? Infinity : index;
          })
          .filter((i) => i !== Infinity)
      );

      type = incomeIndex < expenseIndex ? "income" : "expense";
    }

    // Enhanced category detection
    let category = "other";
    if (
      lowerText.includes("coffee") ||
      lowerText.includes("food") ||
      lowerText.includes("restaurant") ||
      lowerText.includes("lunch") ||
      lowerText.includes("dinner") ||
      lowerText.includes("breakfast") ||
      lowerText.includes("meal")
    ) {
      category = "food";
    } else if (
      lowerText.includes("gas") ||
      lowerText.includes("fuel") ||
      lowerText.includes("uber") ||
      lowerText.includes("taxi") ||
      lowerText.includes("transport")
    ) {
      category = "transport";
    } else if (
      lowerText.includes("grocery") ||
      lowerText.includes("groceries") ||
      lowerText.includes("supermarket")
    ) {
      category = "groceries";
    } else if (
      lowerText.includes("salary") ||
      lowerText.includes("paycheck") ||
      lowerText.includes("wage")
    ) {
      category = "salary";
    } else if (
      lowerText.includes("shopping") ||
      lowerText.includes("clothes") ||
      lowerText.includes("clothing")
    ) {
      category = "shopping";
    } else if (
      lowerText.includes("entertainment") ||
      lowerText.includes("movie") ||
      lowerText.includes("game")
    ) {
      category = "entertainment";
    }

    // Clean description
    let description = text;

    // Remove amount from description
    if (dollarMatch) {
      description = description.replace(dollarMatch[0], "").trim();
    }
    if (dollarsMatch) {
      description = description
        .replace(dollarsMatch[0] + " dollars", "")
        .trim();
    }

    // Remove common prefixes
    const prefixesToRemove = [
      /^i\s+(spent|paid|bought|purchased)\s*/i,
      /^i\s+(received|earned|got)\s*/i,
      /^(spent|paid|bought|purchased)\s*/i,
      /^(received|earned|got)\s*/i,
      /^on\s+/i,
      /^for\s+/i,
      /^at\s+/i,
    ];

    prefixesToRemove.forEach((prefix) => {
      description = description.replace(prefix, "").trim();
    });

    // If description is empty or too short, create a default based on category
    if (!description || description.length < 3) {
      if (category === "food") {
        description = "Food purchase";
      } else if (category === "transport") {
        description = "Transportation";
      } else if (category === "salary") {
        description = "Salary payment";
      } else {
        description = type === "income" ? "Income" : "Expense";
      }
    }

    return {
      amount,
      description: description || "Transaction",
      category,
      type,
    };
  };

  // Load recent transactions
  const loadTransactions = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  // Load transactions on mount
  React.useEffect(() => {
    loadTransactions();
  }, [user]);

  // Create table helper
  const createTable = async () => {
    try {
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

      if (error) throw error;

      setResult({
        success: true,
        message: "Table created successfully! Try recording again.",
      });
    } catch (error) {
      setResult({
        success: false,
        error:
          "Could not create table automatically. Please use the Supabase dashboard.",
        suggestion:
          "Go to Supabase Dashboard → SQL Editor and create the transactions table manually.",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          🎤 Simple Voice Transactions
        </h2>

        {/* Record Button */}
        <div className="text-center mb-6">
          <button
            onClick={startListening}
            disabled={isRecording || isProcessing}
            className={`w-20 h-20 rounded-full text-white text-2xl font-bold transition-all duration-200 ${
              isRecording
                ? "bg-red-500 animate-pulse"
                : "bg-blue-500 hover:bg-blue-600"
            } disabled:opacity-50`}
          >
            {isRecording ? "🔴" : "🎤"}
          </button>

          <p className="mt-3 text-gray-600 dark:text-gray-400">
            {isRecording
              ? "Listening... Speak now!"
              : "Click to start recording"}
          </p>

          {isProcessing && (
            <p className="mt-2 text-blue-600">Processing transaction...</p>
          )}
        </div>

        {/* Transcription */}
        {transcription && (
          <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>You said:</strong> "{transcription}"
            </p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              result.success
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            }`}
          >
            <h3
              className={`font-semibold mb-2 ${
                result.success
                  ? "text-green-800 dark:text-green-200"
                  : "text-red-800 dark:text-red-200"
              }`}
            >
              {result.success ? "✅ Success!" : "❌ Error"}
            </h3>

            {result.success && result.transactions && (
              <div className="text-sm space-y-3">
                {result.transactions.map((transaction, index) => (
                  <div
                    key={transaction.id || index}
                    className="p-3 bg-white dark:bg-gray-800 rounded border"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Transaction {index + 1}
                      </h4>
                      <span
                        className={`font-bold ${
                          transaction.type === "income"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}$
                        {transaction.amount}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                      <p>
                        <strong>Description:</strong> {transaction.description}
                      </p>
                      <p>
                        <strong>Category:</strong> {transaction.category}
                      </p>
                      <p>
                        <strong>Type:</strong> {transaction.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Fallback for single transaction (backward compatibility) */}
            {result.success && result.transaction && !result.transactions && (
              <div className="text-sm space-y-1">
                <p>
                  <strong>Amount:</strong> ${result.transaction.amount}
                </p>
                <p>
                  <strong>Description:</strong> {result.transaction.description}
                </p>
                <p>
                  <strong>Category:</strong> {result.transaction.category}
                </p>
                <p>
                  <strong>Type:</strong> {result.transaction.type}
                </p>
              </div>
            )}

            {result.error && (
              <div className="text-sm">
                <p className="text-red-700 dark:text-red-300">{result.error}</p>
                {result.suggestion && (
                  <p className="mt-2 text-red-600 dark:text-red-400">
                    💡 {result.suggestion}
                  </p>
                )}
                {result.error.includes("does not exist") && (
                  <button
                    onClick={createTable}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    🔧 Try to Create Table
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Recent Transactions
            </h3>
            <div className="space-y-2">
              {transactions.map((transaction, index) => (
                <div
                  key={transaction.id || index}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {transaction.category} • {transaction.type}
                    </p>
                  </div>
                  <div
                    className={`font-bold ${
                      transaction.type === "income"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}$
                    {transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            💡 How to Use
          </h3>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <p>• Click the microphone and speak clearly</p>
            <p>
              <strong>Single transactions:</strong>
            </p>
            <p className="ml-4">- "I spent $25 on coffee"</p>
            <p className="ml-4">- "I received $500 salary payment"</p>
            <p>
              <strong>Multiple transactions:</strong>
            </p>
            <p className="ml-4">
              - "I spent $15 on coffee and received $500 salary"
            </p>
            <p className="ml-4">- "I paid $50 for groceries and $20 for gas"</p>
            <p className="ml-4">
              - "I bought lunch for $12, and got $100 bonus"
            </p>
            <p>• Works best in Chrome or Edge browsers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleVoiceTransaction;
