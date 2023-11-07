import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './pages/home'
import SignIn from './pages/signin'
import SignUp from './pages/SignUp'
import Profile from './pages/profile'
import About from './pages/About'
import Header from './components/Header';
export default function App() {
  return <BrowserRouter>
 <Header />
    <Routes>
      <Route path="/"element={<Home />} />
      <Route path="/sign-in"element={<SignIn />} />
      <Route path="/sign-up"element={<SignUp />} />
      <Route path="/profile"element={<Profile />} />
      <Route path="/About"element={<About />} />
    </Routes>
  
  </BrowserRouter>
}
