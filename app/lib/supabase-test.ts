// Supabase Connection Test Utility
// Run this in your browser console or as a separate script to test your Supabase connection

import { supabaseServer } from "./supabaseClient";

export async function testSupabaseConnection() {
  console.log("🔍 Testing Supabase Connection...");

  // Check environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.log("Environment Variables:");
  console.log("- VITE_SUPABASE_URL:", supabaseUrl ? "✅ Set" : "❌ Missing");
  console.log(
    "- VITE_SUPABASE_ANON_KEY:",
    supabaseKey ? "✅ Set" : "❌ Missing"
  );

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase environment variables!");
    console.log("📝 Please create a .env file with your Supabase credentials:");
    console.log("VITE_SUPABASE_URL=your_supabase_url");
    console.log("VITE_SUPABASE_ANON_KEY=your_supabase_anon_key");
    return false;
  }

  try {
    // Test 1: Basic connection
    console.log("\n🧪 Test 1: Basic Connection");
    const { data: healthCheck, error: healthError } = await supabaseServer
      .from("tickets")
      .select("count", { count: "exact", head: true });

    if (healthError) {
      console.error("❌ Basic connection failed:", healthError);

      if (
        healthError.message.includes("relation") &&
        healthError.message.includes("does not exist")
      ) {
        console.log("📋 The 'tickets' table doesn't exist in your database.");
        console.log(
          "💡 Please run the database-setup.sql script in your Supabase SQL Editor."
        );
        return false;
      }

      if (healthError.message.includes("JWT")) {
        console.log("🔑 Authentication issue - check your Supabase keys.");
        return false;
      }

      return false;
    }

    console.log("✅ Basic connection successful");
    console.log("📊 Total tickets count:", healthCheck);

    // Test 2: Simple query
    console.log("\n🧪 Test 2: Simple Query");
    const { data: simpleData, error: simpleError } = await supabaseServer
      .from("tickets")
      .select("id, title, status")
      .limit(3);

    if (simpleError) {
      console.error("❌ Simple query failed:", simpleError);
      return false;
    }

    console.log("✅ Simple query successful");
    console.log("📋 Sample tickets:", simpleData);

    // Test 3: Query with foreign key relationship
    console.log("\n🧪 Test 3: Foreign Key Relationship");
    const { data: relationData, error: relationError } = await supabaseServer
      .from("tickets")
      .select(
        `
        id,
        title,
        status,
        profiles!tickets_created_by_fkey (
          name,
          email
        )
      `
      )
      .limit(3);

    if (relationError) {
      console.warn("⚠️ Foreign key relationship query failed:", relationError);
      console.log(
        "💡 This might be due to missing foreign key constraint or profiles table."
      );
      console.log(
        "📋 But basic queries work, so the app should function with limited features."
      );
    } else {
      console.log("✅ Foreign key relationship query successful");
      console.log("👥 Tickets with profiles:", relationData);
    }

    // Test 4: Check profiles table
    console.log("\n🧪 Test 4: Profiles Table");
    const { data: profilesData, error: profilesError } = await supabaseServer
      .from("profiles")
      .select("id, name, email")
      .limit(3);

    if (profilesError) {
      console.warn("⚠️ Profiles table query failed:", profilesError);
      console.log(
        "💡 You might need to create the profiles table using the database-setup.sql script."
      );
    } else {
      console.log("✅ Profiles table accessible");
      console.log("👥 Sample profiles:", profilesData);
    }

    console.log("\n🎉 Connection test completed!");
    return true;
  } catch (error) {
    console.error("❌ Unexpected error during connection test:", error);
    return false;
  }
}

// Auto-run the test if this file is imported
if (typeof window !== "undefined") {
  // Browser environment
  console.log(
    "🚀 Supabase connection test utility loaded. Run testSupabaseConnection() to test your connection."
  );
}
