import React, { useState } from "react";
import {
  inspectDatabase,
  getTableStructure,
  checkAuthTables,
} from "../utils/databaseInspector.js";

const DatabaseInspector = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authInfo, setAuthInfo] = useState(null);

  const runInspection = async () => {
    setLoading(true);
    try {
      console.log("🚀 Starting database inspection...");

      // Check authentication first
      const authResults = await checkAuthTables();
      setAuthInfo(authResults);

      // Inspect database structure
      const dbResults = await inspectDatabase();
      setResults(dbResults);

      // If we found tables, get their structures
      if (dbResults.tables && dbResults.tables.length > 0) {
        const tableStructures = {};
        for (const tableName of dbResults.tables) {
          const structure = await getTableStructure(tableName);
          tableStructures[tableName] = structure;
        }
        setResults((prev) => ({ ...prev, structures: tableStructures }));
      }
    } catch (error) {
      console.error("Inspection failed:", error);
      setResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          🔍 Supabase Database Inspector
        </h2>

        <button
          onClick={runInspection}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mb-6 disabled:opacity-50"
        >
          {loading ? "🔄 Inspecting..." : "🚀 Inspect Database"}
        </button>

        {/* Authentication Info */}
        {authInfo && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              🔐 Authentication Status
            </h3>
            <div className="text-sm space-y-1">
              <p>
                Current User:{" "}
                {authInfo.currentUser
                  ? "✅ Authenticated"
                  : "❌ Not authenticated"}
              </p>
              <p>
                Profiles Table:{" "}
                {authInfo.profilesTable ? "✅ Accessible" : "❌ Not found"}
              </p>
              {authInfo.profilesError && (
                <p className="text-red-600">Error: {authInfo.profilesError}</p>
              )}
            </div>
          </div>
        )}

        {/* Database Results */}
        {results && (
          <div className="space-y-4">
            {results.error ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                  ❌ Error
                </h3>
                <p className="text-red-700 dark:text-red-300">
                  {results.error}
                </p>
                {results.suggestion && (
                  <p className="text-red-600 dark:text-red-400 mt-2">
                    💡 {results.suggestion}
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    ✅ Database Inspection Results
                  </h3>
                  <p className="text-green-700 dark:text-green-300">
                    Method: {results.method} | {results.message}
                  </p>
                  <p className="text-green-700 dark:text-green-300">
                    Found {results.tables?.length || 0} tables
                  </p>
                </div>

                {/* Tables List */}
                {results.tables && results.tables.length > 0 && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      📊 Database Tables
                    </h3>
                    <div className="grid gap-2">
                      {results.tables.map((table, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <span className="text-blue-600 dark:text-blue-400">
                            📋
                          </span>
                          <span className="font-mono text-sm">{table}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Table Structures */}
                {results.structures && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      🏗️ Table Structures
                    </h3>
                    {Object.entries(results.structures).map(
                      ([tableName, structure]) => (
                        <div
                          key={tableName}
                          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            📋 {tableName}
                          </h4>
                          {structure.error ? (
                            <p className="text-red-600 dark:text-red-400">
                              ❌ {structure.error}
                            </p>
                          ) : (
                            <div className="text-sm">
                              <p className="text-gray-600 dark:text-gray-400">
                                Rows: {structure.rowCount}
                              </p>
                              {structure.sampleData &&
                                structure.sampleData.length > 0 && (
                                  <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                                    {JSON.stringify(
                                      structure.sampleData[0],
                                      null,
                                      2
                                    )}
                                  </pre>
                                )}
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
            💡 Note
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300 text-sm">
            This inspector will show you what tables exist in your Supabase
            database and their basic structure. Check the browser console for
            detailed logs during inspection.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DatabaseInspector;
