import React, { useState } from "react";
import { Play, Volume2, Lightbulb } from "lucide-react";
import SpeechToText from "./SpeechToText";
import transactionParser from "../utils/transactionParser";

const VoiceDemo = () => {
  const [demoTransactions, setDemoTransactions] = useState([]);
  const [lastTranscription, setLastTranscription] = useState("");

  const handleDemoTranscription = (text) => {
    setLastTranscription(text);

    try {
      const transaction = transactionParser.parseTransaction(text);
      const validation = transactionParser.validateTransaction(transaction);

      if (validation.isValid) {
        setDemoTransactions((prev) => [transaction, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error("Demo transaction error:", error);
    }
  };

  const examplePhrases = [
    "I spent $15 on coffee at Starbucks",
    "Paid $45 for gas at Shell station",
    "Received $500 salary payment",
    "Bought groceries for $87.50",
    "Got $20 cashback from ATM",
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🎤 Voice-to-Transaction Demo
        </h1>
        <p className="text-lg text-gray-600">
          Experience AI-powered speech recognition with Groq Whisper
        </p>
      </div>

      {/* Speech Input Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Volume2 className="w-5 h-5 mr-2 text-blue-600" />
          Try Voice Input
        </h2>

        <SpeechToText
          onTranscription={handleDemoTranscription}
          placeholder="Say something like: 'I spent $15 on coffee at Starbucks'"
          showFileUpload={true}
          autoSubmit={false}
        />
      </div>

      {/* Example Phrases */}
      <div className="bg-blue-50 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-900">
          <Lightbulb className="w-5 h-5 mr-2" />
          Try These Example Phrases
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {examplePhrases.map((phrase, index) => (
            <div
              key={index}
              className="bg-white p-3 rounded-lg border border-blue-200 text-sm"
            >
              <Play className="w-4 h-4 inline mr-2 text-blue-600" />"{phrase}"
            </div>
          ))}
        </div>
      </div>

      {/* Last Transcription */}
      {lastTranscription && (
        <div className="bg-green-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-2 text-green-900">
            Last Transcription
          </h3>
          <p className="text-green-800 bg-white p-3 rounded-lg border border-green-200">
            "{lastTranscription}"
          </p>
        </div>
      )}

      {/* Demo Transactions */}
      {demoTransactions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Generated Transactions</h3>
          <div className="space-y-3">
            {demoTransactions.map((transaction, index) => (
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
                    {transaction.type === "income" ? "+" : "-"}
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
                    ${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">{transaction.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-6 bg-white rounded-xl shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Volume2 className="w-6 h-6 text-blue-600" />
          </div>
          <h4 className="font-semibold mb-2">AI Speech Recognition</h4>
          <p className="text-sm text-gray-600">
            Powered by Groq's Whisper model for accurate transcription
          </p>
        </div>

        <div className="text-center p-6 bg-white rounded-xl shadow-sm">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-6 h-6 text-green-600" />
          </div>
          <h4 className="font-semibold mb-2">Smart Parsing</h4>
          <p className="text-sm text-gray-600">
            Automatically extracts amounts, categories, and transaction types
          </p>
        </div>

        <div className="text-center p-6 bg-white rounded-xl shadow-sm">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-6 h-6 text-purple-600" />
          </div>
          <h4 className="font-semibold mb-2">Natural Language</h4>
          <p className="text-sm text-gray-600">
            Speak naturally - no need to follow strict formats
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceDemo;
