import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Items from './pages/Items'
import ItemDetail from './pages/ItemDetail'
import Contact from './pages/Contact'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import DonateItems from './pages/DonateItems'
import AdminPanel from './pages/AdminPanel'
import Profile from './pages/Profile'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="items" element={<Items />} />
            <Route path="items/:id" element={<ItemDetail />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="donate" element={<DonateItems />} />
            <Route path="admin" element={<AdminPanel />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
