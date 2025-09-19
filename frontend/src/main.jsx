import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import UserContextProvider from './context/userContext'   // ✅ import correctly

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <UserContextProvider>   {/* ✅ use correct Provider */}
      <App />
    </UserContextProvider>
  </BrowserRouter>,
)
