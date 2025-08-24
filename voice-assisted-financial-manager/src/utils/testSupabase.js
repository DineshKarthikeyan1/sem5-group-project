import { supabase } from "../lib/supabase";

// Test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log("Testing Supabase connection...");
    console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
    console.log(
      "Supabase Anon Key:",
      import.meta.env.VITE_SUPABASE_ANON_KEY ? "Present" : "Missing"
    );

    // Test getting session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Supabase connection error:", error);
      return { success: false, error: error.message };
    }

    console.log("Supabase connection successful!");
    console.log("Current session:", session);

    return { success: true, session };
  } catch (error) {
    console.error("Supabase test failed:", error);
    return { success: false, error: error.message };
  }
};

// Test signup functionality
export const testSignup = async (email, password) => {
  try {
    console.log("Testing signup with:", email);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: "Test",
          last_name: "User",
          full_name: "Test User",
        },
      },
    });

    if (error) {
      console.error("Signup error:", error);
      return { success: false, error: error.message };
    }

    console.log("Signup successful:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Signup test failed:", error);
    return { success: false, error: error.message };
  }
};
