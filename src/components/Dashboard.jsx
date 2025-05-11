import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, ShoppingBag, Users, Package, Receipt, BarChart2, PieChart, TrendingUp } from "lucide-react";
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RechartPieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL;


const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalTransactions: 0,
    recentTransactions: [],
    transactionsByType: [],
    productsByCategory: [],
    salesTrend: []
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Set judul halaman
    document.title = 'Dashboard | Admin';
    
    // Ambil data dashboard
    fetchDashboardData(token);
  }, [navigate]);

  const fetchDashboardData = async (token) => {
    setLoading(true);
    try {
      // Ambil jumlah produk
      const productsResponse = await axios.get(`${API_URL}/api/products/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Ambil kategori
      const categoriesResponse = await axios.get(`${API_URL}/api/categories/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Ambil transaksi
      const transactionsResponse = await axios.get(`${API_URL}/api/transactions/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Hitung jumlah transaksi berdasarkan tipe
      const transactionsByType = [
        { name: 'Penjualan', value: transactionsResponse.data.filter(t => t.transaction_type === 'sale').length },
        { name: 'Pembelian', value: transactionsResponse.data.filter(t => t.transaction_type === 'purchase').length }
      ];

      // Hitung produk berdasarkan kategori
      const productsByCategory = [];
      const categoryMap = {};
      
      // Buat map kategori
      categoriesResponse.data.forEach(category => {
        categoryMap[category.id] = category.name;
      });
      
      // Hitung produk per kategori
      const productCountByCategory = {};
      productsResponse.data.forEach(product => {
        const categoryId = product.category;
        const categoryName = categoryMap[categoryId] || 'Tidak Diketahui';
        
        if (!productCountByCategory[categoryName]) {
          productCountByCategory[categoryName] = 0;
        }
        productCountByCategory[categoryName]++;
      });
      
      // Konversi ke format yang dibutuhkan recharts
      Object.keys(productCountByCategory).forEach(categoryName => {
        productsByCategory.push({
          name: categoryName,
          value: productCountByCategory[categoryName]
        });
      });

      // Buat data tren penjualan (contoh: 7 hari terakhir)
      const salesTrend = generateSalesTrendData(transactionsResponse.data);

      setDashboardData({
        totalProducts: productsResponse.data.length,
        totalCategories: categoriesResponse.data.length,
        totalTransactions: transactionsResponse.data.length,
        recentTransactions: transactionsResponse.data.slice(0, 5), // 5 transaksi terbaru
        transactionsByType,
        productsByCategory,
        salesTrend
      });

      setLoading(false);
    } catch (error) {
      console.error('Error mengambil data dashboard:', error);
      setError('Gagal memuat data dashboard');
      setLoading(false);
    }
  };

  // Fungsi untuk menghasilkan data tren penjualan
  const generateSalesTrendData = (transactions) => {
    // Urutkan transaksi berdasarkan tanggal
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.created_at) - new Date(b.created_at)
    );
    
    // Ambil hanya transaksi penjualan
    const salesTransactions = sortedTransactions.filter(t => t.transaction_type === 'sale');
    
    // Kelompokkan berdasarkan tanggal
    const salesByDate = {};
    salesTransactions.forEach(transaction => {
      const date = new Date(transaction.created_at).toLocaleDateString('id-ID');
      if (!salesByDate[date]) {
        salesByDate[date] = 0;
      }
      salesByDate[date] += parseFloat(transaction.total_amount);
    });
    
    // Konversi ke format yang dibutuhkan recharts
    return Object.keys(salesByDate).map(date => ({
      date,
      amount: salesByDate[date]
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Warna untuk chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Ringkasan Statistik */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="space-y-1">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>Total Produk</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dashboardData.totalProducts}</div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="space-y-1">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Layers className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>Total Kategori</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dashboardData.totalCategories}</div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="space-y-1">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Receipt className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>Total Transaksi</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dashboardData.totalTransactions}</div>
              </CardContent>
            </Card>
          </div>

           {/* Menu Navigasi */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Manajemen Kategori */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="space-y-1">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Layers className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Manajemen Kategori</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Kelola kategori produk Anda dengan mudah
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                    <span className="flex items-center">
                      <Package className="h-4 w-4 mr-1" />
                      Kategori Produk
                    </span>
                  </div>
                  <Button
                    onClick={() => navigate('/categories')}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Kelola Kategori
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Manajemen Produk */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="space-y-1">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Manajemen Produk</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Kelola semua produk dalam satu tempat
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                    <span className="flex items-center">
                      <Package className="h-4 w-4 mr-1" />
                      Daftar Produk
                    </span>
                  </div>
                  <Button
                    onClick={() => navigate('/products')}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Kelola Produk
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Manajemen Transaksi */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="space-y-1">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Receipt className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Manajemen Transaksi</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Kelola semua transaksi penjualan
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                    <span className="flex items-center">
                      <Receipt className="h-4 w-4 mr-1" />
                      Daftar Transaksi
                    </span>
                  </div>
                  <Button
                    onClick={() => navigate('/transactions')}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Kelola Transaksi
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 mt-4">
            {/* Grafik Tren Penjualan */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="space-y-1">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Tren Penjualan</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="h-80">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <p>Memuat data...</p>
                  </div>
                ) : dashboardData.salesTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dashboardData.salesTrend}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, 'Jumlah']} />
                      <Legend />
                      <Line type="monotone" dataKey="amount" stroke="#8884d8" activeDot={{ r: 8 }} name="Penjualan" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p>Tidak ada data penjualan</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Grafik Transaksi berdasarkan Tipe */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="space-y-1">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <PieChart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Transaksi berdasarkan Tipe</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="h-80">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <p>Memuat data...</p>
                  </div>
                ) : dashboardData.transactionsByType.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartPieChart>
                      <Pie
                        data={dashboardData.transactionsByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dashboardData.transactionsByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Jumlah']} />
                      <Legend />
                    </RechartPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p>Tidak ada data transaksi</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Grafik Produk berdasarkan Kategori */}
          <Card className="hover:shadow-lg transition-shadow duration-300 mb-6">
            <CardHeader className="space-y-1">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Produk berdasarkan Kategori</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="h-80">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <p>Memuat data...</p>
                </div>
              ) : dashboardData.productsByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData.productsByCategory}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Jumlah Produk" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p>Tidak ada data produk</p>
                </div>
              )}
            </CardContent>
          </Card>
          
         
        </div>
      </div>
    </div>
  );
};

export default Dashboard;