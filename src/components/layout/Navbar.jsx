import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from 'react';
import { Menu, X, Home, Package, FolderOpen, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Berhasil logout');
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button 
                onClick={toggleSidebar}
                className="mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="h-6 w-6 text-gray-800 dark:text-white" />
              </button>
              <Link to="/dashboard" className="text-xl font-bold text-gray-800 dark:text-white">
                AppXYZ
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link to="/profile">
                    <Button variant="ghost" className='bg-green-900 text-white'>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="outline">Register</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar dan Overlay */}
      <div className={`md:hidden fixed inset-0 z-20 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={toggleSidebar}></div>
      </div>

      <aside className={`fixed top-0 left-0 z-30 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Menu</h2>
          <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="h-6 w-6 text-gray-800 dark:text-white" />
          </button>
        </div>
        
        {isAuthenticated && (
          <div className="py-4 px-2">
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/dashboard" 
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  onClick={toggleSidebar}
                >
                  <Home className="h-5 w-5 mr-3" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/categories" 
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  onClick={toggleSidebar}
                >
                  <FolderOpen className="h-5 w-5 mr-3" />
                  Kategori
                </Link>
              </li>
              <li>
                <Link 
                  to="/products" 
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  onClick={toggleSidebar}
                >
                  <Package className="h-5 w-5 mr-3" />
                  Produk
                </Link>
              </li>
              <li className="border-t dark:border-gray-700 pt-2 mt-4">
                <button 
                  onClick={() => {
                    handleLogout();
                    toggleSidebar();
                  }}
                  className="flex items-center w-full px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </aside>

      {/* Main content dengan transisi */}
      <div className={`pt-16 transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:ml-64' : ''}`}>
        {/* Your page content goes here */}
      </div>
    </>
  );
};

export default Navbar;