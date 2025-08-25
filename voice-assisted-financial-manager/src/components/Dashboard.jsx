import React, { useState, useEffect } from "react";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  CreditCard,
  PieChart,
  Settings,
  User,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import SpeechToText from "./SpeechToText";
import transactionParser from "../utils/transactionParser";
import ThemeToggle from "./ThemeToggle";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [voiceTranscription, setVoiceTranscription] = useState("");
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [voiceResult, setVoiceResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDebugger, setShowDebugger] = useState(false);

  // Load transactions from Supabase
  const loadTransactions = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      console.log("🔍 Loading transactions from Supabase for user:", user.id);

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("❌ Error loading transactions:", error);
        // If table doesn't exist, show helpful message
        if (error.message.includes('relation "transactions" does not exist')) {
          setVoiceResult({
            success: false,
            error: "Transactions table doesn't exist. Please create it first.",
            suggestion:
              "Use the Simple Voice feature to create the table automatically.",
          });
        }
        return;
      }

      console.log("✅ Loaded transactions:", data);
      setRecentTransactions(data || []);
    } catch (error) {
      console.error("❌ Error loading transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load transactions on component mount
  useEffect(() => {
    loadTransactions();
  }, [user]);

  // Handle voice transcription
  const handleVoiceTranscription = async (text) => {
    console.log("🎤 Voice transcription received:", text);
    setVoiceTranscription(text);
    setVoiceResult(null);

    // Process the transcription to extract transaction details
    await processVoiceTransaction(text);
  };

  // Process voice input to create transaction and save to Supabase
  const processVoiceTransaction = async (text) => {
    if (!user?.id) {
      setVoiceResult({
        success: false,
        error: "User not authenticated",
      });
      return;
    }

    setIsProcessingVoice(true);
    console.log("🔄 Processing voice transaction:", text);

    try {
      // Use the advanced transaction parser
      const parsedTransaction = transactionParser.parseTransaction(text);
      console.log("📝 Parsed transaction:", parsedTransaction);

      // Validate the transaction
      const validation =
        transactionParser.validateTransaction(parsedTransaction);

      if (!validation.isValid) {
        setVoiceResult({
          success: false,
          error: validation.errors.join(", "),
          originalText: text,
        });
        return;
      }

      // Prepare transaction for Supabase
      const transactionData = {
        user_id: user.id,
        amount:
          parsedTransaction.type === "income"
            ? Math.abs(parsedTransaction.amount)
            : -Math.abs(parsedTransaction.amount),
        description: parsedTransaction.description,
        category: parsedTransaction.category,
        type: parsedTransaction.type,
      };

      console.log("💾 Saving to Supabase:", transactionData);
      console.log("🔍 Supabase Query Details:", {
        table: "transactions",
        operation: "INSERT",
        data: transactionData,
        user_id: user.id,
      });

      // Insert into Supabase
      const { data, error } = await supabase
        .from("transactions")
        .insert([transactionData])
        .select();

      if (error) {
        console.error("❌ Supabase error:", error);
        console.error("❌ Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        setVoiceResult({
          success: false,
          error: error.message,
          originalText: text,
          suggestion: error.message.includes(
            'relation "transactions" does not exist'
          )
            ? "You need to create the transactions table first. Use the debugger's 'Create Table' button."
            : "Please try again or check your database connection.",
        });
        return;
      }

      console.log("✅ Transaction saved successfully:", data[0]);
      console.log("✅ Supabase response:", { data, error: null });

      // Show success result
      setVoiceResult({
        success: true,
        transaction: data[0],
        originalText: text,
        message: "Transaction created and saved to database!",
      });

      // Reload transactions to show the new one
      await loadTransactions();
    } catch (error) {
      console.error("❌ Error processing voice transaction:", error);
      setVoiceResult({
        success: false,
        error: error.message,
        originalText: text,
      });
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const toggleVoiceInput = () => {
    setShowVoiceInput(!showVoiceInput);
  };

  const stats = [
    {
      title: "Monthly Income",
      value: "$3,500.00",
      change: "+12.5%",
      trend: "up",
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      title: "Monthly Expenses",
      value: "$2,147.82",
      change: "-8.2%",
      trend: "down",
      icon: <TrendingDown className="w-6 h-6" />,
    },
    {
      title: "Available Balance",
      value: "$1,352.18",
      change: "+24.7%",
      trend: "up",
      icon: <DollarSign className="w-6 h-6" />,
    },
    {
      title: "Transactions",
      value: "47",
      change: "+5",
      trend: "up",
      icon: <CreditCard className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 transition-colors duration-300">
                VoiceFinance
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle size="sm" />
              {user && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  <User className="w-4 h-4" />
                  <span>
                    {user.user_metadata?.full_name ||
                      user.user_metadata?.first_name ||
                      user.email}
                  </span>
                </div>
              )}
              <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                onClick={() => signOut()}
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Voice Input Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 rounded-2xl p-6 text-white transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Voice Transaction Input
                </h2>
                <p className="text-primary-100">
                  Use AI-powered speech recognition to add transactions
                  naturally
                </p>
              </div>
              <button
                onClick={toggleVoiceInput}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200"
              >
                <MessageSquare className="w-5 h-5" />
                <span>{showVoiceInput ? "Hide" : "Show"} Voice Input</span>
              </button>
            </div>

            {showVoiceInput && (
              <div className="bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-xl p-4 transition-colors duration-300">
                <SpeechToText
                  onTranscription={handleVoiceTranscription}
                  placeholder="Say something like: 'I spent $15 on coffee at Starbucks' or 'I received $500 salary'"
                  className="text-gray-900 dark:text-white"
                  showFileUpload={true}
                  autoSubmit={false}
                />

                {/* Processing Status */}
                {isProcessingVoice && (
                  <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors duration-300">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        Processing and saving transaction...
                      </p>
                    </div>
                  </div>
                )}

                {/* Voice Result */}
                {voiceResult && (
                  <div
                    className={`mt-4 p-3 rounded-lg border transition-colors duration-300 ${
                      voiceResult.success
                        ? "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800"
                        : "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800"
                    }`}
                  >
                    <div
                      className={`text-sm ${
                        voiceResult.success
                          ? "text-green-800 dark:text-green-300"
                          : "text-red-800 dark:text-red-300"
                      }`}
                    >
                      <p className="font-medium mb-1">
                        {voiceResult.success ? "✅ Success!" : "❌ Error"}
                      </p>

                      {voiceResult.originalText && (
                        <p className="mb-2">
                          <strong>You said:</strong> "{voiceResult.originalText}
                          "
                        </p>
                      )}

                      {voiceResult.success && voiceResult.transaction && (
                        <div className="space-y-1">
                          <p>
                            <strong>Amount:</strong> $
                            {Math.abs(voiceResult.transaction.amount).toFixed(
                              2
                            )}
                          </p>
                          <p>
                            <strong>Description:</strong>{" "}
                            {voiceResult.transaction.description}
                          </p>
                          <p>
                            <strong>Category:</strong>{" "}
                            {voiceResult.transaction.category}
                          </p>
                          <p>
                            <strong>Type:</strong>{" "}
                            {voiceResult.transaction.type}
                          </p>
                        </div>
                      )}

                      {voiceResult.error && (
                        <div>
                          <p>{voiceResult.error}</p>
                          {voiceResult.suggestion && (
                            <p className="mt-2 font-medium">
                              💡 {voiceResult.suggestion}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {voiceTranscription && !voiceResult && !isProcessingVoice && (
                  <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg transition-colors duration-300">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      <strong>Transcribed:</strong> "{voiceTranscription}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Voice Transaction Debugger */}
        {showDebugger && (
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  🔍 Voice Transaction Debugger
                </h2>
                <button
                  onClick={() => setShowDebugger(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              {/* Test Buttons */}
              <div className="mb-4 flex flex-wrap gap-3">
                <button
                  onClick={async () => {
                    console.log("🔍 Testing database connection...");
                    try {
                      const { data, error } = await supabase
                        .from("transactions")
                        .select("id")
                        .limit(1);

                      if (error) {
                        console.error("❌ Database connection failed:", error);
                        setVoiceResult({
                          success: false,
                          error: `Database connection failed: ${error.message}`,
                          suggestion: error.message.includes(
                            'relation "transactions" does not exist'
                          )
                            ? "You need to create the transactions table first."
                            : "Check your Supabase connection.",
                        });
                      } else {
                        console.log("✅ Database connection successful");
                        setVoiceResult({
                          success: true,
                          message:
                            "Database connection successful! Transactions table exists.",
                        });
                      }
                    } catch (error) {
                      console.error("❌ Connection test failed:", error);
                      setVoiceResult({
                        success: false,
                        error: `Connection test failed: ${error.message}`,
                      });
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Test DB Connection
                </button>

                <button
                  onClick={async () => {
                    console.log("🔧 Creating transactions table...");
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

                      if (error) {
                        console.error("❌ Failed to create table:", error);
                        setVoiceResult({
                          success: false,
                          error: `Failed to create table: ${error.message}`,
                          suggestion:
                            "You may need to create the table manually in Supabase dashboard.",
                        });
                      } else {
                        console.log("✅ Table created successfully");
                        setVoiceResult({
                          success: true,
                          message: "Transactions table created successfully!",
                        });
                      }
                    } catch (error) {
                      console.error("❌ Error creating table:", error);
                      setVoiceResult({
                        success: false,
                        error: `Error creating table: ${error.message}`,
                      });
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Create Table
                </button>

                <button
                  onClick={() => loadTransactions()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Reload Transactions
                </button>
              </div>

              {/* Debug Info */}
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                <p>
                  <strong>User ID:</strong> {user?.id || "Not authenticated"}
                </p>
                <p>
                  <strong>Email:</strong> {user?.email || "N/A"}
                </p>
                <p>
                  <strong>Transactions loaded:</strong>{" "}
                  {recentTransactions.length}
                </p>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                  How to Debug:
                </h4>
                <ol className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                  <li>
                    1. Click "Test DB Connection" to verify your database setup
                  </li>
                  <li>2. If table doesn't exist, click "Create Table"</li>
                  <li>
                    3. Use the voice input above and watch the console for
                    detailed logs
                  </li>
                  <li>
                    4. Check your browser's Developer Tools → Console for
                    detailed query information
                  </li>
                  <li>
                    5. Verify transactions appear in your Supabase dashboard
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors duration-300">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 transition-colors duration-300">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <span
                      className={`text-sm font-medium ${
                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      vs last month
                    </span>
                  </div>
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    stat.trend === "up"
                      ? "bg-green-100 text-green-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                    Recent Transactions
                  </h3>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span>Add Manual</span>
                  </button>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2 text-gray-600 dark:text-gray-300 transition-colors duration-300">
                      Loading transactions...
                    </span>
                  </div>
                ) : recentTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-300">
                      No transactions yet
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 transition-colors duration-300">
                      Use voice input above to create your first transaction!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`p-2 rounded-lg ${
                              transaction.type === "income"
                                ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {transaction.type === "income" ? (
                              <TrendingUp className="w-5 h-5" />
                            ) : (
                              <TrendingDown className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">
                              {transaction.description}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                              {transaction.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              transaction.type === "income"
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            } transition-colors duration-300`}
                          >
                            {transaction.amount > 0 ? "+" : ""}$
                            {Math.abs(transaction.amount).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            {new Date(
                              transaction.created_at || transaction.date
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Analytics */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">
                    View Monthly Report
                  </span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <PieChart className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">
                    Category Analysis
                  </span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <CreditCard className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">
                    Export Data
                  </span>
                </button>
                <button
                  onClick={() => setShowDebugger(!showDebugger)}
                  className="w-full flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                >
                  <MessageSquare className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span className="font-medium text-orange-700 dark:text-orange-300">
                    🎤 {showDebugger ? "Hide" : "Show"} Voice Debugger
                  </span>
                </button>
              </div>
            </div>

            {/* Spending Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                Spending Insights
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                      Food & Drinks
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">
                      42%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 transition-colors duration-300">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: "42%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                      Transportation
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">
                      28%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 transition-colors duration-300">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: "28%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                      Shopping
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">
                      20%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 transition-colors duration-300">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: "20%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                      Others
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">
                      10%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 transition-colors duration-300">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: "10%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
