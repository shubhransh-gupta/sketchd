import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TopBar } from '../components/TopBar/TopBar';
import { Toolbar } from '../components/Toolbar/Toolbar';
import { Canvas } from '../components/Canvas/Canvas';
import { PropertiesPanel } from '../components/PropertiesPanel/PropertiesPanel';
import { ZoomControls } from '../components/ZoomControls/ZoomControls';
import { ToastContainer } from '../components/Toast/Toast';
import { CommandPalette } from '../components/CommandPalette/CommandPalette';
import { MobileToolbar } from '../components/MobileToolbar/MobileToolbar';
import { SiteCredit } from '../components/SiteCredit/SiteCredit';
import { DrawingProvider, useDrawing } from '../context/DrawingContext';
import { useKeyboard } from '../hooks/useKeyboard';
import { loadFromGitHub, loadDrawingLocally, loadPendingDocument } from '../lib/storage';
import styles from './EditorPage.module.css';

function EditorContent() {
  const [commandOpen, setCommandOpen] = useState(false);
  useKeyboard({ onCommandPalette: () => setCommandOpen(true) });

  return (
    <div className={styles.editor}>
      <TopBar />
      <Toolbar />
      <Canvas />
      <PropertiesPanel />
      <ZoomControls />
      <MobileToolbar />
      <SiteCredit />
      <ToastContainer />
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
}

function EditorWithDoc({ drawingId }: { drawingId?: string }) {
  const { loadDocument } = useDrawing();
  const [loaded, setLoaded] = useState(!drawingId);

  useEffect(() => {
    if (!drawingId) {
      setLoaded(true);
      return;
    }
    loadFromGitHub(drawingId).then((doc) => {
      if (doc) loadDocument(doc);
      setLoaded(true);
    });
  }, [drawingId, loadDocument]);

  if (!loaded) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} aria-label="Loading drawing..." />
        <p>Loading drawing...</p>
      </div>
    );
  }

  return <EditorContent />;
}

export function EditorPage() {
  const { id } = useParams();

  return (
    <DrawingProvider
      initialDoc={id ? loadDrawingLocally(id) ?? undefined : undefined}
    >
      <EditorWithDoc drawingId={id} />
    </DrawingProvider>
  );
}

export function HomePage() {
  const pending = loadPendingDocument();
  return (
    <DrawingProvider initialDoc={pending ?? undefined}>
      <EditorContent />
    </DrawingProvider>
  );
}
