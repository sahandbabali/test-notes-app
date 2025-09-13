import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
import { notesService } from "../lib/supabase";

export default function Profile() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  // Notes state
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [editingNote, setEditingNote] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [updating, setUpdating] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Load notes when user is available
  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user]);

  const loadNotes = async () => {
    if (!user) return;

    setNotesLoading(true);
    setError("");

    try {
      const { data, error } = await notesService.getNotes(user.id);

      if (error) {
        setError("Failed to load notes: " + error.message);
      } else {
        setNotes(data || []);
      }
    } catch (err) {
      setError("An unexpected error occurred while loading notes");
      console.error("Load notes error:", err);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("Please fill in both title and content");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const noteData = {
        title: title.trim(),
        content: content.trim(),
        user_id: user.id,
      };

      const { data, error } = await notesService.createNote(noteData);

      if (error) {
        setError("Failed to create note: " + error.message);
      } else {
        // Add the new note to the list
        setNotes([data[0], ...notes]);
        // Clear form
        setTitle("");
        setContent("");
      }
    } catch (err) {
      setError("An unexpected error occurred while creating note");
      console.error("Create note error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      const { error } = await notesService.deleteNote(noteId);

      if (error) {
        setError("Failed to delete note: " + error.message);
      } else {
        // Remove note from the list
        setNotes(notes.filter((note) => note.id !== noteId));
      }
    } catch (err) {
      setError("An unexpected error occurred while deleting note");
      console.error("Delete note error:", err);
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setError(""); // Clear any existing errors
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setEditTitle("");
    setEditContent("");
    setError("");
  };

  const handleUpdateNote = async (noteId) => {
    if (!editTitle.trim() || !editContent.trim()) {
      setError("Please fill in both title and content");
      return;
    }

    setUpdating(true);
    setError("");

    try {
      const updates = {
        title: editTitle.trim(),
        content: editContent.trim(),
      };

      const { data, error } = await notesService.updateNote(noteId, updates);

      if (error) {
        setError("Failed to update note: " + error.message);
      } else {
        // Update the note in the list
        setNotes(
          notes.map((note) =>
            note.id === noteId
              ? { ...note, ...updates, updated_at: new Date().toISOString() }
              : note
          )
        );

        // Exit edit mode
        handleCancelEdit();
      }
    } catch (err) {
      setError("An unexpected error occurred while updating note");
      console.error("Update note error:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="container">
        <div className="text-center">
          <div className="spinner"></div>
          Loading...
        </div>
      </div>
    );
  }

  // Don't render if no user (will redirect)
  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Notes App - Your Notes</title>
        <meta name="description" content="Manage your notes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container">
        {/* Header */}
        <header className="profile-header">
          <div>
            <h1>Your Notes</h1>
            <p>Welcome back, {user.email}!</p>
          </div>
          <button onClick={handleSignOut} className="button button-secondary">
            Sign Out
          </button>
        </header>

        {/* Error message */}
        {error && <div className="error-message">{error}</div>}

        {/* Create Note Form */}
        <div className="note-form-container">
          <h2>Create New Note</h2>
          <form onSubmit={handleCreateNote} className="form">
            <div className="form-group">
              <label htmlFor="title" className="label">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="Enter note title"
                disabled={submitting}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="content" className="label">
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="textarea"
                placeholder="Write your note here..."
                disabled={submitting}
                required
                rows={4}
              />
            </div>

            <button
              type="submit"
              className="button"
              disabled={submitting || !title.trim() || !content.trim()}
            >
              {submitting ? "Creating..." : "Create Note"}
            </button>
          </form>
        </div>

        {/* Notes List */}
        <div className="notes-section">
          <h2>Your Notes ({notes.length})</h2>

          {notesLoading ? (
            <div className="text-center">
              <div className="spinner"></div>
              Loading notes...
            </div>
          ) : notes.length === 0 ? (
            <div className="empty-state">
              <p>No notes yet. Create your first note above!</p>
            </div>
          ) : (
            <div className="notes-grid">
              {notes.map((note) => (
                <div key={note.id} className="note-card">
                  {editingNote === note.id ? (
                    // Edit mode
                    <div className="edit-form">
                      <div className="form-group">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="input"
                          placeholder="Note title"
                          disabled={updating}
                        />
                      </div>
                      <div className="form-group">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="textarea"
                          placeholder="Note content"
                          disabled={updating}
                          rows={3}
                        />
                      </div>
                      <div className="edit-actions">
                        <button
                          onClick={() => handleUpdateNote(note.id)}
                          className="button"
                          disabled={
                            updating || !editTitle.trim() || !editContent.trim()
                          }
                        >
                          {updating ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="button button-secondary"
                          disabled={updating}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <>
                      <div className="note-header">
                        <h3>{note.title}</h3>
                        <div className="note-actions">
                          <button
                            onClick={() => handleEditNote(note)}
                            className="edit-button"
                            title="Edit note"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="delete-button"
                            title="Delete note"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <p className="note-content">{note.content}</p>
                      <div className="note-footer">
                        <small>
                          Created:{" "}
                          {new Date(note.created_at).toLocaleDateString()}
                          {note.updated_at &&
                            note.updated_at !== note.created_at && (
                              <span>
                                {" "}
                                • Updated:{" "}
                                {new Date(note.updated_at).toLocaleDateString()}
                              </span>
                            )}
                        </small>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
