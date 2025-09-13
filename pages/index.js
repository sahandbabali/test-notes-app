import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
import AuthForm from "../components/AuthForm";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to profile if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/profile");
    }
  }, [user, loading, router]);

  // Show loading while checking auth state
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

  // Show auth form if not logged in
  return (
    <>
      <Head>
        <title>Notes App - Sign In</title>
        <meta
          name="description"
          content="A simple note-taking app with Supabase"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container">
        <main>
          <h1 className="text-center">Welcome to Notes App</h1>
          <p className="text-center">
            Please sign in or create an account to start taking notes.
          </p>

          <AuthForm />
        </main>
      </div>
    </>
  );
}
