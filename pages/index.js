import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Notes App</title>
        <meta
          name="description"
          content="A simple note-taking app with Supabase"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container">
        <main>
          <h1>Welcome to Notes App</h1>
          <p>Please sign in or create an account to start taking notes.</p>

          {/* Authentication forms will go here */}
        </main>
      </div>
    </>
  );
}
