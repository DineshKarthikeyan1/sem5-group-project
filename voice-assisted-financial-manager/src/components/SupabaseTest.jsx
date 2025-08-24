import React, { useState, useEffect } from "react";
import { testSupabaseConnection, testSignup } from "../utils/testSupabase";
import { supabase } from "../lib/supabase";

const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState("Testing...");
  const [testEmail, setTestEmail] = useState("test@example.com");
  const [testPassword, setTestPassword] = useState("testpassword123");
  const [testResult, setTestResult] = useState("");

  useEffect(() => {
    const testConnection = async () => {
      const result = await testSupabaseConnection();
      if (result.success) {
        setConnectionStatus("✅ Connected to Supabase");
      } else {
        setConnectionStatus(`❌ Connection failed: ${result.error}`);
      }
    };

    testConnection();
  }, []);

  const handleTestSignup = async () => {
    setTestResult("Testing signup...");
    const result = await testSignup(testEmail, testPassword);

    if (result.success) {
      setTestResult("✅ Signup test successful!");
    } else {
      setTestResult(`❌ Signup test failed: ${result.error}`);
    }
  };

  const handleTestAuth = async () => {
    try {
      console.log("Testing direct Supabase auth...");
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      if (error) {
        setTestResult(`❌ Direct auth test failed: ${error.message}`);
      } else {
        setTestResult("✅ Direct auth test successful!");
        console.log("Auth data:", data);
      }
    } catch (err) {
      setTestResult(`❌ Direct auth test error: ${err.message}`);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md mx-auto mt-8 transition-colors duration-300">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Supabase Connection Test
      </h2>

      <div className="mb-4">
        <p className="font-medium text-gray-900 dark:text-white">
          Connection Status:
        </p>
        <p
          className={
            connectionStatus.includes("✅")
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }
        >
          {connectionStatus}
        </p>
      </div>

      <div className="mb-4">
        <p className="font-medium mb-2 text-gray-900 dark:text-white">
          Environment Variables:
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          URL: {import.meta.env.VITE_SUPABASE_URL || "Missing"}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Anon Key:{" "}
          {import.meta.env.VITE_SUPABASE_ANON_KEY ? "Present" : "Missing"}
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
          Test Email:
        </label>
        <input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
          Test Password:
        </label>
        <input
          type="password"
          value={testPassword}
          onChange={(e) => setTestPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
        />
      </div>

      <div className="space-y-2 mb-4">
        <button
          onClick={handleTestSignup}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Test Signup (via Service)
        </button>

        <button
          onClick={handleTestAuth}
          className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
        >
          Test Direct Supabase Auth
        </button>

        <button
          onClick={async () => {
            try {
              setTestResult("Testing project settings...");
              const { data, error } = await supabase.auth.getSession();
              if (error) {
                setTestResult(`❌ Cannot access auth: ${error.message}`);
                return;
              }
              const {
                data: { user },
              } = await supabase.auth.getUser();
              setTestResult(
                `✅ Project accessible. Current user: ${
                  user ? user.email : "None"
                }`
              );
            } catch (err) {
              setTestResult(`❌ Project test error: ${err.message}`);
            }
          }}
          className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600"
        >
          Test Project Settings
        </button>
      </div>

      {testResult && (
        <div className="mt-4">
          <p className="font-medium">Test Result:</p>
          <p
            className={
              testResult.includes("✅") ? "text-green-600" : "text-red-600"
            }
          >
            {testResult}
          </p>
        </div>
      )}
    </div>
  );
};

export default SupabaseTest;
