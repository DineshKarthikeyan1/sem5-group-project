import React, { useState } from "react";
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
import SpeechToText from "./SpeechToText";
import transactionParser from "../utils/transactionParser";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [voiceTranscription, setVoiceTranscription] = useState("");
  const [recentTransactions, setRecentTransactions] = useState([
    {
      id: 1,
      description: "Coffee at Starbucks",
      amount: -4.5,
      category: "Food & Drinks",
      date: "2025-01-07",
      type: "expense",
    },
    {
      id: 2,
      description: "Salary Deposit",
      amount: 3500.0,
      category: "Income",
      date: "2025-01-05",
      type: "income",
    },
    {
      id: 3,
      description: "Grocery Shopping",
      amount: -87.32,
      category: "Food & Drinks",
      date: "2025-01-04",
      type: "expense",
    },
    {
      id: 4,
      description: "Gas Station",
      amount: -45.0,
      category: "Transportation",
      date: "2025-01-03",
      type: "expense",
    },
  ]);

  // Handle voice transcription
  const handleVoiceTranscription = (text) => {
    console.log("Voice transcription received:", text);
    setVoiceTranscription(text);

    // Process the transcription to extract transaction details
    processVoiceTransaction(text);
  };

  // Process voice input to create transaction
  const processVoiceTransaction = (text) => {
    console.log("Processing voice transaction:", text);

    try {
      // Use the advanced transaction parser
      const transaction = transactionParser.parseTransaction(text);

      // Validate the transaction
      const validation = transactionParser.validateTransaction(transaction);

      if (validation.isValid) {
        // Add to transactions
        setRecentTransactions((prev) => [transaction, ...prev.slice(0, 9)]);
        console.log("Created transaction:", transaction);

        // Show success message (you can add a toast notification here)
        console.log("✅ Transaction added successfully!");
      } else {
        // Show validation errors
        console.error("Transaction validation failed:", validation.errors);
        // You can show these errors to the user
      }
    } catch (error) {
      console.error("Error processing voice transaction:", error);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">
                VoiceFinance
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>
                    {user.user_metadata?.full_name ||
                      user.user_metadata?.first_name ||
                      user.email}
                  </span>
                </div>
              )}
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
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
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
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
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <SpeechToText
                  onTranscription={handleVoiceTranscription}
                  placeholder="Say something like: 'I spent $15 on coffee at Starbucks' or 'I received $500 salary'"
                  className="text-gray-900"
                  showFileUpload={true}
                  autoSubmit={false}
                />

                {voiceTranscription && (
                  <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Processed:</strong> {voiceTranscription}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Transactions
                  </h3>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span>Add Manual</span>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-2 rounded-lg ${
                            transaction.type === "income"
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? (
                            <TrendingUp className="w-5 h-5" />
                          ) : (
                            <TrendingDown className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {transaction.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            transaction.type === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : ""}$
                          {Math.abs(transaction.amount).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {transaction.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Analytics */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">View Monthly Report</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <PieChart className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">Category Analysis</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <CreditCard className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">Export Data</span>
                </button>
              </div>
            </div>

            {/* Spending Insights */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Spending Insights
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Food & Drinks</span>
                    <span className="font-medium">42%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: "42%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Transportation</span>
                    <span className="font-medium">28%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: "28%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Shopping</span>
                    <span className="font-medium">20%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: "20%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Others</span>
                    <span className="font-medium">10%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
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
