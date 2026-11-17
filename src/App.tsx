import React, { Suspense, lazy, useState, useCallback } from 'react';
import { RouterProvider, useSeoRouter } from './seo/router';
import { SiteLayout } from './components/Site/SiteLayout';
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { HowToPlayPage } from './pages/HowToPlayPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { UpdatesPage } from './pages/UpdatesPage';
import { NotFoundPage } from './pages/NotFoundPage';

const GameExperience = lazy(() => import('./components/GameExperience'));
const SettingsOverlayLazy = lazy(() => import('./components/SettingsOverlayLazy'));

interface AppProps {
  initialPath?: string;
}

const PageRenderer: React.FC<{
  onStartNewGame: () => void;
  onContinueGame: () => void;
  onSmartPlay: () => void;
  onOpenSettings: () => void;
}> = ({ onStartNewGame, onContinueGame, onSmartPlay, onOpenSettings }) => {
  const { path } = useSeoRouter();

  if (path === '/') {
    return (
      <LandingPage
        onStartNewGame={onStartNewGame}
        onContinueGame={onContinueGame}
        onOpenSettings={onOpenSettings}
      />
    );
  }

  return (
    <SiteLayout onPlayNow={onSmartPlay}>
      {path === '/about' && <AboutPage onPlayNow={onStartNewGame} />}
      {path === '/how-to-play' && <HowToPlayPage onPlayNow={onStartNewGame} />}
      {path === '/features' && <FeaturesPage onPlayNow={onStartNewGame} />}
      {path === '/updates' && <UpdatesPage onPlayNow={onStartNewGame} />}
      {path === '/404' && <NotFoundPage onPlayNow={onStartNewGame} />}
    </SiteLayout>
  );
};

export default function App({ initialPath }: AppProps) {
  const [launchMode, setLaunchMode] = useState<'new' | 'continue' | null>(null);
  const [showSiteSettings, setShowSiteSettings] = useState(false);

  const handleStartNew = useCallback(() => {
    setShowSiteSettings(false);
    setLaunchMode('new');
  }, []);

  const handleContinue = useCallback(() => {
    setShowSiteSettings(false);
    setLaunchMode('continue');
  }, []);

  const handleSmartPlay = useCallback(() => {
    setShowSiteSettings(false);
    try {
      const hasSave =
        Boolean(localStorage.getItem('chanda_de_save_v2')) ||
        Boolean(localStorage.getItem('chanda_de_save_v1'));
      setLaunchMode(hasSave ? 'continue' : 'new');
    } catch {
      setLaunchMode('new');
    }
  }, []);

  return (
    <RouterProvider initialPath={initialPath}>
      {launchMode ? (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-50 bg-[#070a12] text-white flex flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="w-10 h-10 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
              <p className="text-base font-bold text-amber-300">
                চান্দা সিটি লোড হচ্ছে... (Loading 3D Chanda City)
              </p>
              <p className="text-xs text-slate-400">
                Preparing 3D streets, vehicles, shops, and audio
              </p>
            </div>
          }
        >
          <GameExperience launchMode={launchMode} onExitToSite={() => setLaunchMode(null)} />
        </Suspense>
      ) : (
        <>
          <PageRenderer
            onStartNewGame={handleStartNew}
            onContinueGame={handleContinue}
            onSmartPlay={handleSmartPlay}
            onOpenSettings={() => setShowSiteSettings(true)}
          />
          {showSiteSettings && (
            <Suspense fallback={null}>
              <SettingsOverlayLazy onClose={() => setShowSiteSettings(false)} />
            </Suspense>
          )}
        </>
      )}
    </RouterProvider>
  );
}
