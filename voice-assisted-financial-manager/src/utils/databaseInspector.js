import { supabase } from "../lib/supabase.js";

/**
 * Database Inspector Utility
 * Fetches and displays all tables and their relationships in your Supabase database
 */

export const inspectDatabase = async () => {
  try {
    console.log("🔍 Inspecting Supabase Database...");

    // Get all tables in the public schema
    const { data: tables, error: tablesError } = await supabase.rpc(
      "get_schema_tables"
    );

    if (tablesError) {
      console.log(
        "⚠️ RPC function not available, trying alternative method..."
      );

      // Alternative: Try to query information_schema (may require elevated permissions)
      const { data: altTables, error: altError } = await supabase
        .from("information_schema.tables")
        .select("table_name, table_type")
        .eq("table_schema", "public");

      if (altError) {
        console.log("❌ Cannot access schema information directly");
        console.log("🔧 Let's check what we can access...");

        // Try common table names for financial apps
        const commonTables = [
          "users",
          "profiles",
          "transactions",
          "categories",
          "accounts",
          "budgets",
          "goals",
          "recurring_transactions",
        ];

        const existingTables = [];

        for (const tableName of commonTables) {
          try {
            const { data, error } = await supabase
              .from(tableName)
              .select("*")
              .limit(1);

            if (!error) {
              existingTables.push(tableName);
              console.log(`✅ Found table: ${tableName}`);
            }
          } catch (e) {
            // Table doesn't exist or no access
          }
        }

        return {
          method: "probe",
          tables: existingTables,
          message: "Probed for common financial app tables",
        };
      }

      return {
        method: "information_schema",
        tables: altTables,
        message: "Retrieved from information_schema",
      };
    }

    return {
      method: "rpc",
      tables: tables,
      message: "Retrieved using RPC function",
    };
  } catch (error) {
    console.error("❌ Database inspection failed:", error);
    return {
      error: error.message,
      suggestion: "Check your Supabase connection and permissions",
    };
  }
};

export const getTableStructure = async (tableName) => {
  try {
    console.log(`🔍 Inspecting table: ${tableName}`);

    // Get column information
    const { data, error } = await supabase.from(tableName).select("*").limit(0); // Get structure without data

    if (error) {
      throw error;
    }

    // Get a sample row to understand the structure
    const { data: sample, error: sampleError } = await supabase
      .from(tableName)
      .select("*")
      .limit(1);

    return {
      tableName,
      structure: data,
      sampleData: sample,
      rowCount: sample?.length || 0,
    };
  } catch (error) {
    return {
      tableName,
      error: error.message,
    };
  }
};

// Check authentication tables specifically
export const checkAuthTables = async () => {
  try {
    console.log("🔐 Checking authentication setup...");

    // Check if we can access auth.users (usually restricted)
    const { data: authUsers, error: authError } = await supabase.auth.getUser();

    // Check profiles table (common pattern)
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .limit(1);

    return {
      currentUser: authUsers?.user || null,
      profilesTable: !profilesError,
      profilesError: profilesError?.message,
    };
  } catch (error) {
    return {
      error: error.message,
    };
  }
};
