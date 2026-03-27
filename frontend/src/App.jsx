import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/common/Toast';
import { MainLayout } from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import BookCatalog from './pages/Books/BookCatalog';
import BookDetail from './pages/Books/BookDetail';
import LoansManagement from './pages/Loans/LoansManagement';
import Authors from './pages/Authors/Authors';
import Members from './pages/Members/Members';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ToastContainer />
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="books" element={<BookCatalog />} />
            <Route path="books/:id" element={<BookDetail />} />
            <Route path="loans" element={<LoansManagement />} />
            <Route path="authors" element={<Authors />} />
            <Route path="members" element={<Members />} />
            <Route path="members/:id" element={<Navigate to="/members" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
