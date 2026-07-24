import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence } from 'framer-motion';
import App from './App.tsx';
import { LoadingScreen } from './components/LoadingScreen.tsx';
import './index.css';

function Root() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 2600);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen key="loader" />}
      </AnimatePresence>
      <StrictMode>
        <App />
      </StrictMode>
    </>
  );
}

createRoot(document.getElementById('root')!).render(<Root />);
