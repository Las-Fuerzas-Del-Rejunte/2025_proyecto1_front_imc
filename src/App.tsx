
import ImcForm from './ImcForm'
import Navbar from './components/Navbar'
import React from 'react'
import WelcomeModal from './components/WelcomeModal'
import Footer from './components/Footer'

function App() {
  const [open, setOpen] = React.useState(true)
  return (
    <>
      <Navbar onOpenInfo={() => setOpen(true)} />
      <ImcForm />
      <Footer />
      <WelcomeModal open={open} onOpenChange={setOpen} />
    </>
  )
}

export default App
