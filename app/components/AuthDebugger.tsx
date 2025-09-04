import { useState } from "react";
import { useAuth } from "~/auth";
import { supabase } from "~/lib/supabaseClient";

export function AuthDebugger() {
  const { user, profile, session, loading, refreshSession } = useAuth();
  const [testResult, setTestResult] = useState<string>("");

  const runDiagnostics = async () => {
    console.log("🔍 Running auth diagnostics...");

    const results = [];

    // Environment check
    results.push(`Environment:`);
    results.push(
      `- Supabase URL: ${import.meta.env.VITE_SUPABASE_URL ? "✅ Set" : "❌ Missing"}`
    );
    results.push(
      `- Anon Key: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}`
    );

    // Auth state
    results.push(`\nAuth State:`);
    results.push(`- User: ${user ? `✅ ${user.email}` : "❌ None"}`);
    results.push(`- Profile: ${profile ? `✅ ${profile.name}` : "❌ None"}`);
    results.push(`- Session: ${session ? "✅ Active" : "❌ None"}`);
    results.push(`- Loading: ${loading ? "⏳ Yes" : "✅ No"}`);

    // User details if available
    if (user) {
      results.push(`\nUser Details:`);
      results.push(`- ID: ${user.id}`);
      results.push(
        `- Email Confirmed: ${user.email_confirmed_at ? "✅ Yes" : "❌ No"}`
      );
      results.push(`- Created: ${user.created_at}`);
      results.push(`- Last Sign In: ${user.last_sign_in_at || "Never"}`);
    }

    // Test session
    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      results.push(`\nSession Test:`);
      results.push(`- Success: ${!sessionError ? "✅" : "❌"}`);
      results.push(`- Has Session: ${sessionData.session ? "✅" : "❌"}`);
      if (sessionError) results.push(`- Error: ${sessionError.message}`);

      if (sessionData.session) {
        results.push(`- Session User: ${sessionData.session.user.email}`);
        results.push(
          `- Expires At: ${new Date(sessionData.session.expires_at! * 1000).toLocaleString()}`
        );
      }
    } catch (error) {
      results.push(`\nSession Test: ❌ Failed`);
      results.push(
        `- Error: ${error instanceof Error ? error.message : "Unknown"}`
      );
    }

    // Test profile (if user exists)
    if (user) {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        results.push(`\nProfile Test:`);
        results.push(`- Success: ${!profileError ? "✅" : "❌"}`);
        results.push(`- Has Profile: ${profileData ? "✅" : "❌"}`);
        if (profileError) {
          results.push(`- Error: ${profileError.message}`);
          results.push(`- Code: ${profileError.code}`);
        }
        if (profileData) {
          results.push(`- Name: ${profileData.name}`);
          results.push(`- Role: ${profileData.role}`);
        }
      } catch (error) {
        results.push(`\nProfile Test: ❌ Failed`);
        results.push(
          `- Error: ${error instanceof Error ? error.message : "Unknown"}`
        );
      }
    }

    const resultText = results.join("\n");
    console.log("🔍 Diagnostics complete:\n", resultText);
    setTestResult(resultText);
  };

  const testSignup = async () => {
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = "test123456";
    const testName = "Test User";

    console.log("🧪 Testing signup with:", testEmail);
    setTestResult("🧪 Testing signup...");

    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: { name: testName },
        },
      });

      console.log("🧪 Signup result:", { data, error });

      let result = `Signup Test:\n- Auth User: ${data.user ? "✅" : "❌"}\n- Session: ${data.session ? "✅" : "❌"}\n- Error: ${error ? error.message : "None"}`;

      if (data.user) {
        result += `\n- User ID: ${data.user.id}`;
        result += `\n- Email Confirmed: ${data.user.email_confirmed_at ? "✅" : "❌"}`;
        result += `\n- Needs Confirmation: ${!data.session && data.user && !data.user.email_confirmed_at ? "✅" : "❌"}`;
      }

      if (data.user && !error) {
        // Try to create profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            name: testName,
            email: testEmail,
            role: "user",
          })
          .select()
          .single();

        result += `\n- Profile Created: ${profileData ? "✅" : "❌"}`;
        if (profileError) {
          result += `\n- Profile Error: ${profileError.message}`;
          result += `\n- Profile Code: ${profileError.code}`;
        }

        console.log("🧪 Profile creation result:", {
          profileData,
          profileError,
        });
      }

      // Refresh session after test
      if (data.session) {
        await refreshSession();
        result += `\n- Auth Context Refreshed: ✅`;
      }

      setTestResult(result);
    } catch (error) {
      const errorMsg = `Signup Test Failed: ${error instanceof Error ? error.message : "Unknown error"}`;
      console.error("🧪 Test signup error:", error);
      setTestResult(errorMsg);
    }
  };

  const testLogin = async () => {
    // Use a known test user or create one
    const testEmail = "test@example.com";
    const testPassword = "test123456";

    console.log("🧪 Testing login with:", testEmail);
    setTestResult("🧪 Testing login...");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      console.log("🧪 Login result:", { data, error });

      let result = `Login Test:\n- Auth User: ${data.user ? "✅" : "❌"}\n- Session: ${data.session ? "✅" : "❌"}\n- Error: ${error ? error.message : "None"}`;

      if (data.user) {
        result += `\n- User ID: ${data.user.id}`;
        result += `\n- Email: ${data.user.email}`;
        result += `\n- Last Sign In: ${data.user.last_sign_in_at}`;
      }

      // Refresh session after test
      if (data.session) {
        await refreshSession();
        result += `\n- Auth Context Refreshed: ✅`;
      }

      setTestResult(result);
    } catch (error) {
      const errorMsg = `Login Test Failed: ${error instanceof Error ? error.message : "Unknown error"}`;
      console.error("🧪 Test login error:", error);
      setTestResult(errorMsg);
    }
  };

  const refreshAuth = async () => {
    console.log("🔄 Manually refreshing auth...");
    setTestResult("🔄 Refreshing auth context...");

    try {
      await refreshSession();
      setTestResult("✅ Auth context refreshed successfully!");
    } catch (error) {
      setTestResult(
        `❌ Refresh failed: ${error instanceof Error ? error.message : "Unknown"}`
      );
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-md z-50">
      <h3 className="font-bold mb-2">🔍 Auth Debugger</h3>

      <div className="text-sm space-y-1 mb-3">
        <div>User: {user ? `✅ ${user.email}` : "❌ None"}</div>
        <div>Profile: {profile ? `✅ ${profile.name}` : "❌ None"}</div>
        <div>Session: {session ? "✅ Active" : "❌ None"}</div>
        <div>Loading: {loading ? "⏳ Yes" : "✅ No"}</div>
        {user && (
          <div className="text-xs text-gray-300">
            Email Confirmed: {user.email_confirmed_at ? "✅" : "❌"}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <button
          onClick={runDiagnostics}
          className="w-full bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
        >
          Run Diagnostics
        </button>

        <button
          onClick={testSignup}
          className="w-full bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
        >
          Test Signup
        </button>

        <button
          onClick={testLogin}
          className="w-full bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
        >
          Test Login
        </button>

        <button
          onClick={refreshAuth}
          className="w-full bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
        >
          Refresh Auth
        </button>
      </div>

      {testResult && (
        <div className="mt-3 text-xs">
          <div className="font-semibold">Results:</div>
          <pre className="bg-gray-900 p-2 rounded mt-1 overflow-auto max-h-40 text-xs whitespace-pre-wrap">
            {testResult}
          </pre>
        </div>
      )}
    </div>
  );
}
