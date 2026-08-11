import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { HomePage, EditorPage } from './pages/EditorPage';
import { ViewerPage } from './pages/ViewerPage';
import { NotFoundPage } from './pages/NotFoundPage';
import './styles/global.css';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/d/:id" element={<ViewerPage />} />
          <Route path="/edit/:id" element={<EditorPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
