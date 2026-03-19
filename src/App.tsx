import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import MagazineDetailPage from './pages/MagazineDetailPage';
import ContactPage from './pages/ContactPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/"            element={<HomePage />} />
        <Route path="/magazine/:id" element={<MagazineDetailPage />} />
        <Route path="/news"        element={<NewsPage />} />
        <Route path="/news/:slug"  element={<NewsDetailPage />} />
        <Route path="/contact"     element={<ContactPage />} />
        {/* Placeholder routes for legal pages */}
        <Route path="/about"   element={<PlaceholderPage title="About ENN" />} />
        <Route path="/privacy" element={<PlaceholderPage title="Privacy Policy" />} />
        <Route path="/terms"   element={<PlaceholderPage title="Terms of Use" />} />
        <Route path="/cookies" element={<PlaceholderPage title="Cookie Policy" />} />
      </Routes>
    </AuthProvider>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Mono',monospace", fontSize: '0.8125rem', color: 'var(--dim)', letterSpacing: '.12em', textTransform: 'uppercase', gap: '1rem' }}>
      <div style={{ color: 'var(--orange)' }}>✦</div>
      <div>{title}</div>
      <div style={{ color: 'var(--dim2)', fontSize: '0.6875rem' }}>Page coming soon</div>
      <a href="/" style={{ color: 'var(--gold)', textDecoration: 'none' }}>← Back Home</a>
    </div>
  );
}
