import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(getElementByIdRoot()!).render(<App />);

function getElementByIdRoot() {
  return document.getElementById('root');
}
