import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';

import { Toast } from '@massalabs/react-ui-kit';

import HomePage from './pages/HomePage';
import useAccountSync from './hooks/useAccountAsync';
import { useInit } from './hooks/useInit';

function App() {
  useAccountSync();
  useInit();

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
