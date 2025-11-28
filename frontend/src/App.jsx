import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import CreateCard from './pages/CreateCard'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import MailerRegister from './pages/MailerRegister'
import MailerDashboard from './pages/MailerDashboard'
import JobDetail from './pages/JobDetail'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Customer routes */}
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateCard />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />

          {/* Mailer routes */}
          <Route path="/mailer/register" element={<MailerRegister />} />
          <Route path="/mailer" element={<MailerDashboard />} />
          <Route path="/mailer/jobs/:id" element={<JobDetail />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
