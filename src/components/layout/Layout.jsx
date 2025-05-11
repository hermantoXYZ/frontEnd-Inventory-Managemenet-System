import Navbar from "@/components/layout/Navbar"
import Footer from '@/components/layout/Footer'
import { useLocation } from "react-router-dom";


const Layout = ({ children }) => {

  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPage && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
};


export default Layout;