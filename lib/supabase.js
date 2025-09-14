import { createClient } from "@supabase/supabase-js";

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env.local file."
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Helper functions for authentication
export const auth = {
  // Sign up with email and password
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  getCurrentUser: () => {
    return supabase.auth.getUser();
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Helper functions for notes
export const notesService = {
  // Get notes with pagination
  getNotes: async (userId, page = 1, pageSize = 3) => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("notes")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);

    return { data, error, count };
  },

  // Get notes filtered by tags with pagination
  getNotesByTags: async (userId, tags, page = 1, pageSize = 3) => {
    if (!tags || tags.length === 0) {
      return await notesService.getNotes(userId, page, pageSize);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("notes")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .overlaps("tags", tags)
      .order("created_at", { ascending: false })
      .range(from, to);

    return { data, error, count };
  },

  // Get all unique tags for a user
  getUserTags: async (userId) => {
    const { data, error } = await supabase
      .from("notes")
      .select("tags")
      .eq("user_id", userId)
      .not("tags", "is", null);

    if (error) return { data: [], error };

    // Flatten and deduplicate tags
    const allTags = data
      .flatMap((note) => note.tags || [])
      .filter((tag) => tag && tag.trim())
      .filter((tag, index, array) => array.indexOf(tag) === index)
      .sort();

    return { data: allTags, error: null };
  },

  // Create a new note
  createNote: async (note) => {
    const { data, error } = await supabase
      .from("notes")
      .insert([note])
      .select();

    return { data, error };
  },

  // Update a note
  updateNote: async (id, updates) => {
    const { data, error } = await supabase
      .from("notes")
      .update(updates)
      .eq("id", id)
      .select();

    return { data, error };
  },

  // Delete a note
  deleteNote: async (id) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);

    return { error };
  },
};
