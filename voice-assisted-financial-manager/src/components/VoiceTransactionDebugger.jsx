import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import SpeechToText from "./SpeechToText";
import transactionParser from "../utils/transactionParser";
import TransactionService from "../services/transactionService";

const VoiceTransactionDebugger = () => {
  const { user } = useAuth();
  const [debugLogs, setDebugLogs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState("");

  const addLog = (type, message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs((prev) => [
      {
        id: Date.now(),
        timestamp,
        type, // 'info', 'success', 'error', 'query'
        message,
        data,
      },
      ...prev.slice(0, 19),
    ]); // Keep last 20 logs
  };

  const clearLogs = () => {
    setDebugLogs([]);
  };

  // Test database connection
  const testConnection = async () => {
    addLog("info", "Testing Supabase connection...");

    try {
      // First test basic connection
      const { data, error } = await supabase
        .from("transactions")
        .select("id")
        .limit(1);

      if (error) {
        addLog("error", "Database connection failed", error);
        if (error.message.includes('relation "transactions" does not exist')) {
          addLog(
            "info",
            "Transactions table does not exist. You need to create it first."
          );
        }
      } else {
        addLog(
          "success",
          "Database connection successful - transactions table exists"
        );

        // Now get count using proper syntax
        const { count, error: countError } = await supabase
          .from("transactions")
          .select("*", { count: "exact", head: true });

        if (countError) {
          addLog("error", "Failed to get transaction count", countError);
        } else {
          addLog("info", `Found ${count} total transactions in database`);
        }
      }
    } catch (error) {
      addLog("error", "Connection test failed", error);
    }
  };

  // Create table
  const createTable = async () => {
    addLog("info", "Creating transactions table...");

    const result = await TransactionService.createTransactionsTable();

    if (result.success) {
      addLog("success", "Table created successfully");
    } else {
      addLog("error", "Failed to create table", result.error);
    }
  };

  // Handle voice transcription with full debugging
  const handleVoiceTranscription = async (text) => {
    setTranscription(text);
    setIsProcessing(true);

    addLog("info", `Voice transcription received: "${text}"`);

    if (!user?.id) {
      addLog("error", "User not authenticated");
      setIsProcessing(false);
      return;
    }

    try {
      // Step 1: Parse transaction(s)
      addLog("info", "Parsing transaction(s) from speech...");
      const parsedResult = transactionParser.parseTransaction(text);
      const parsedTransactions = Array.isArray(parsedResult)
        ? parsedResult
        : [parsedResult];

      addLog(
        "success",
        `Parsed ${parsedTransactions.length} transaction(s)`,
        parsedTransactions
      );

      // Step 2: Validate transaction(s)
      addLog("info", "Validating transaction(s)...");
      const validation = transactionParser.validateTransaction(parsedResult);

      if (!validation.isValid) {
        addLog("error", "Transaction validation failed", validation.errors);
        setIsProcessing(false);
        return;
      }

      addLog("success", "Transaction validation passed");

      // Step 3: Prepare data for Supabase
      const transactionDataArray = parsedTransactions.map((transaction) => ({
        user_id: user.id,
        amount:
          transaction.type === "income"
            ? Math.abs(transaction.amount)
            : -Math.abs(transaction.amount),
        description: transaction.description,
        category: transaction.category,
        type: transaction.type,
      }));

      addLog(
        "info",
        `Prepared ${transactionDataArray.length} transaction(s) for Supabase`,
        transactionDataArray
      );

      // Step 4: Execute Supabase query
      addLog(
        "query",
        `Executing INSERT query for ${transactionDataArray.length} transaction(s)...`
      );

      const { data, error } = await supabase
        .from("transactions")
        .insert(transactionDataArray)
        .select();

      // Log the exact query details
      addLog("query", "Supabase INSERT query details", {
        table: "transactions",
        operation: "INSERT",
        data: transactionDataArray,
        returning: "SELECT *",
        count: transactionDataArray.length,
      });

      if (error) {
        addLog("error", "Supabase query failed", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
      } else {
        addLog(
          "success",
          `${data.length} transaction(s) saved to Supabase successfully!`,
          data
        );

        // Test if we can read them back
        addLog("info", "Verifying transactions were saved...");
        const transactionIds = data.map((t) => t.id);
        const { data: verifyData, error: verifyError } = await supabase
          .from("transactions")
          .select("*")
          .in("id", transactionIds);

        if (verifyError) {
          addLog("error", "Failed to verify saved transactions", verifyError);
        } else {
          addLog(
            "success",
            `${verifyData.length} transaction(s) verified in database`,
            verifyData
          );
        }
      }
    } catch (error) {
      addLog("error", "Unexpected error during processing", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Load recent transactions
  const loadTransactions = async () => {
    if (!user?.id) {
      addLog("error", "Cannot load transactions: user not authenticated");
      return;
    }

    addLog("info", "Loading recent transactions...");

    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      addLog("query", "Supabase SELECT query executed", {
        table: "transactions",
        operation: "SELECT",
        filters: { user_id: user.id },
        orderBy: "created_at DESC",
        limit: 5,
      });

      if (error) {
        addLog("error", "Failed to load transactions", error);
      } else {
        addLog("success", `Loaded ${data.length} transactions`, data);
      }
    } catch (error) {
      addLog("error", "Unexpected error loading transactions", error);
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case "success":
        return "text-green-700 bg-green-50 border-green-200";
      case "error":
        return "text-red-700 bg-red-50 border-red-200";
      case "query":
        return "text-blue-700 bg-blue-50 border-blue-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          🔍 Voice Transaction Debugger
        </h2>

        {/* User Info */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            User Information
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-400">
            <strong>User ID:</strong> {user?.id || "Not authenticated"}
          </p>
          <p className="text-sm text-blue-800 dark:text-blue-400">
            <strong>Email:</strong> {user?.email || "N/A"}
          </p>
        </div>

        {/* Control Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={testConnection}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Test DB Connection
          </button>
          <button
            onClick={createTable}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Create Table
          </button>
          <button
            onClick={loadTransactions}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Load Transactions
          </button>
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Clear Logs
          </button>
        </div>

        {/* Voice Input */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Voice Input Test
          </h3>
          <SpeechToText
            onTranscription={handleVoiceTranscription}
            placeholder="Say something like: 'I spent $25 on coffee at Starbucks'"
            showFileUpload={true}
          />

          {isProcessing && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-yellow-800">
                  Processing transaction...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Debug Logs */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Debug Logs ({debugLogs.length})
          </h3>

          {debugLogs.length === 0 ? (
            <p className="text-gray-500 italic">
              No logs yet. Try testing the connection or using voice input.
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {debugLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg border text-sm ${getLogColor(
                    log.type
                  )}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium">
                          {log.type.toUpperCase()}
                        </span>
                        <span className="text-xs opacity-75">
                          {log.timestamp}
                        </span>
                      </div>
                      <p className="mb-1">{log.message}</p>
                      {log.data && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs font-medium opacity-75">
                            Show Details
                          </summary>
                          <pre className="mt-1 text-xs bg-black/10 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceTransactionDebugger;
