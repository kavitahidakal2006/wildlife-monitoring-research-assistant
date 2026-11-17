/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ResearchProvider } from './context/ResearchContext';
import { ToastContainer } from './components/ToastContainer';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { UploadImages } from './pages/UploadImages';
import { Analysis } from './pages/Analysis';
import { ReviewImages } from './pages/ReviewImages';
import { Observations } from './pages/Observations';
import { Analytics } from './pages/Analytics';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <ResearchProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login initialMode="login" />} />
          <Route path="/register" element={<Login initialMode="register" />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route
            path="/projects/new"
            element={<Projects openCreateOnMount />}
          />
          <Route path="/upload" element={<UploadImages />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/review" element={<ReviewImages />} />
          <Route path="/observations" element={<Observations />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </ResearchProvider>
  );
}
