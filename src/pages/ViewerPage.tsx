import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Pencil } from 'lucide-react';
import { TopBar } from '../components/TopBar/TopBar';
import { Canvas } from '../components/Canvas/Canvas';
import { ZoomControls } from '../components/ZoomControls/ZoomControls';
import { ToastContainer } from '../components/Toast/Toast';
import { SiteCredit } from '../components/SiteCredit/SiteCredit';
import { DrawingProvider, useDrawing } from '../context/DrawingContext';
import { createEditableCopy, loadFromGitHub } from '../lib/storage';
import { getShareUrl } from '../lib/id';
import styles from './ViewerPage.module.css';

function ViewerContent() {
  const navigate = useNavigate();
  const { state, addToast } = useDrawing();

  const handleCopy = async () => {
    const url = getShareUrl(window.location.pathname.split('/').pop() || '');
    try {
      await navigator.clipboard.writeText(url);
      addToast({ type: 'success', title: 'Link copied', duration: 2000 });
    } catch {
      addToast({ type: 'error', title: 'Failed to copy', duration: 3000 });
    }
  };

  const handleEdit = () => {
    const doc = createEditableCopy(state.document);
    sessionStorage.setItem('sketchd:pending-doc', JSON.stringify(doc));
    navigate('/');
    addToast({
      type: 'info',
      title: 'Editable copy created',
      description: 'Save it as a new drawing.',
      duration: 4000,
    });
  };

  return (
    <div className={styles.viewer}>
      <TopBar readOnly />
      <div className={styles.actions}>
        <button className={styles.actionButton} onClick={handleCopy}>
          <Copy size={14} aria-hidden="true" />
          Copy
        </button>
        <button className={`${styles.actionButton} ${styles.primary}`} onClick={handleEdit}>
          <Pencil size={14} aria-hidden="true" />
          Open & Edit
        </button>
      </div>
      <Canvas readOnly />
      <ZoomControls />
      <SiteCredit />
      <ToastContainer />
    </div>
  );
}

export function ViewerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [doc, setDoc] = useState<Awaited<ReturnType<typeof loadFromGitHub>>>(null);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }
    loadFromGitHub(id).then((loaded) => {
      if (!loaded) {
        navigate('/404');
        return;
      }
      setDoc(loaded);
      setLoading(false);
    });
  }, [id, navigate]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} aria-label="Loading drawing..." />
        <p>Loading drawing...</p>
      </div>
    );
  }

  return (
    <DrawingProvider initialDoc={doc ?? undefined}>
      <ViewerContent />
    </DrawingProvider>
  );
}
