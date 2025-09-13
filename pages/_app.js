import "@/styles/globals.css";
import { AuthProvider } from "../contexts/AuthContext";

// Simple Header Component
function Header() {
  return (
    <header className="app-header">
      <div className="header-container">
        <h1 className="app-title">📝 Notes App</h1>
      </div>
    </header>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Header />
      <Component {...pageProps} />
    </AuthProvider>
  );
}
