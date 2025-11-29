import Navbar from './Navbar'
import BottomNav from './BottomNav'

/**
 * Main layout wrapper component
 * Includes navbar and bottom navigation with vintage postal aesthetic
 */
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-paper-aged grain-overlay">
      <Navbar />
      <main className="pb-20 md:pb-8">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

export default Layout
