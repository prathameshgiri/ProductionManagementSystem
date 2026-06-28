/**
 * App.jsx - Root Component
 */
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
        <Toaster 
          position="top-right" 
          toastOptions={{ 
            className: 'dark:bg-slate-800 dark:text-white',
            duration: 3000,
          }} 
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
