import { createClient } from "@supabase/supabase-js";

// Hard-coded Supabase project credentials for this demo project.
// NOTE: These are intentionally in-code so the app works in Google AI Studio
// without needing environment variables.
const supabaseUrl = "https://lydbvlgbjyevpaeefhpq.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZGJ2bGdianlldnBhZWVmaHBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxODQzOTgsImV4cCI6MjA4MDc2MDM5OH0.8ReqmoqIxkllZ4kJigJmH8GO-aKI4bTS9gIi7CqwQVQ";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase URL or Key is missing. Authentication will not work properly."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);