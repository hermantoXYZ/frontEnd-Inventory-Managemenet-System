import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CategoryList from './components/products/CategoryList';
import ProductList from './components/products/ProductList';
import ProductDetail from './components/products/ProductDetail';
import CategoryAdd from './components/products/CategoryAdd';
import CategoryEdit from './components/products/CategoryEdit';
import Layout from './components/layout/Layout';
import Profile from './components/users/Profile';
import CreateTransaction from './components/transaction/CreateTransaction';
import TransactionList from './components/transaction/TransactionList';
function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/categories" element={<CategoryList/>}/>
          <Route path="/products" element={<ProductList/>}/>
          <Route path="/products/:slug" element={<ProductDetail/>}/>
          <Route path="/categories/add" element={<CategoryAdd/>}/>
          <Route path="/categories/:slug/edit" element={<CategoryEdit/>}/>
          <Route path='/profile' element={<Profile/>}/>
          <Route path='/transactions/create' element={<CreateTransaction/>}/>
          <Route path='/transactions' element={<TransactionList/>}/>
    
        </Routes>
        </Layout>
    </Router>
  );
}

export default App;