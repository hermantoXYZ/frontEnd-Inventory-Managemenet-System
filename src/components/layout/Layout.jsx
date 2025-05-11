import Navbar from "@/components/layout/Navbar"
import Footer from '@/components/layout/Footer'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow relative z-0">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;