import { useState, useEffect } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

function App() {
  const [user,  setUser]  = useState<any>(null)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('cobbler-theme') as 'dark' | 'light') || 'dark'
  })

  // Apply theme to <html> so CSS vars can switch
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('cobbler-theme', theme)
  }, [theme])

  useEffect(() => {
    const token    = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) setUser(JSON.parse(userData))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  if (!user) {
    return <Login onLogin={(data: any) => {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
    }} />
  }

  return <Dashboard user={user} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
}

export default App
