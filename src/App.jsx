import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './pages/home'
import SignIn from './pages/signin'
import SignUp from './pages/SignUp'
import Profile from './pages/profile'
import About from './pages/About'
export default function App() {
  return <BrowserRouter>
    <Routes>
      <Route path="/"element={<Home />} />
      <Route path="/sign-in"element={<SignIn />} />
      <Route path="/sign-up"element={<SignUp />} />
      <Route path="/profile"element={<Profile />} />
      <Route path="/About"element={<About />} />
    </Routes>
  
  </BrowserRouter>
}
