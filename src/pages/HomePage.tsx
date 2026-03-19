import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { magazineAPI } from '../lib/api';
import Navbar from '../components/Navbar';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import MagazineGrid from '../components/MagazineGrid';
import FeaturedSpotlight from '../components/FeaturedSpotlight';
import AuthModal from '../components/AuthModal';
import DownloadModal from '../components/DownloadModal';
import AdminPanel from '../components/AdminPanel';

export default function HomePage() {
  const { loading } = useAuth();
  const navigate = useNavigate();
  const [magazines, setMagazines] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [downloadTarget, setDownloadTarget] = useState<any | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [filter, setFilter] = useState<Record<string, any>>({});

  const { isLoggedIn } = useAuth();

  useEffect(() => { fetchMagazines(); }, [filter]);

  const fetchMagazines = async () => {
    try {
      setIsLoading(true);
      const r = await magazineAPI.getAll(filter);
      const all: any[] = r.data.magazines;
      setFeatured(all.find(m => m.is_featured) || all[0] || null);
      setMagazines(all);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (mag: any) => setDownloadTarget(mag);
  const handleMagazineClick = (mag: any) => navigate(`/magazine/${mag.id}`);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: 40, height: 40, border: '2px solid rgba(200,146,42,.3)', borderTop: '2px solid #C8922A', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <main style={{ position: 'relative', zIndex: 1 }}>
      <TopBar />
      <Navbar
        onAuthClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
        onAdminClick={() => setShowAdminPanel(true)}
      />

      {featured && !isLoading && (
        <FeaturedSpotlight
          magazine={featured}
          onDownload={() => handleDownload(featured)}
          onReadMore={() => handleMagazineClick(featured)}
        />
      )}

      <MagazineGrid
        magazines={magazines}
        onMagazineClick={handleMagazineClick}
        onDownloadClick={handleDownload}
        isLoading={isLoading}
        onFilterChange={setFilter}
      />

      <Footer />

      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onModeChange={setAuthMode}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => { setShowAuthModal(false); fetchMagazines(); }}
        />
      )}

      {downloadTarget && (
        <DownloadModal
          magazine={downloadTarget}
          isLoggedIn={isLoggedIn}
          onClose={() => setDownloadTarget(null)}
          onDone={() => { setDownloadTarget(null); fetchMagazines(); }}
        />
      )}

      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} onRefresh={fetchMagazines} />
      )}
    </main>
  );
}
