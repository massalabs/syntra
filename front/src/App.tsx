import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';

import { Toast, useAccountStore } from '@massalabs/react-ui-kit';

import HomePage from './pages/HomePage';
import useAccountSync from './hooks/useAccountAsync';
import { initTokens } from './store/store';
import { useEffect } from 'react';

function App() {
  useAccountSync();
  const { connectedAccount } = useAccountStore();

  useEffect(() => {
    if (connectedAccount) {
      initTokens();
    }
  }, [connectedAccount]);

  return (
    <Router>
      <Toast />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
