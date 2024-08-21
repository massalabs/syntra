import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';

import { Toast } from '@massalabs/react-ui-kit';

import HomePage from './pages/HomePage';
import useAccountSync from './hooks/useAccountAsync';

function App() {
  useAccountSync();

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
