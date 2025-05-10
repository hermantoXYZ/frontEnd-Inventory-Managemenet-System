import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [searchTerm]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.');
        setLoading(false);
        return;
      }

      // Perbaikan URL untuk pencarian
      const url = new URL('http://localhost:8000/api/products/');
      if (searchTerm) {
        url.searchParams.append('search', searchTerm);
      }

      const response = await axios.get(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });

      setProducts(response.data);
      setError('');
      setLoading(false);
    } catch (error) {
      console.error('Error lengkap:', error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setError('Sesi telah berakhir. Silakan login kembali.');
      } else if (error.response?.status === 403) {
        setError('Anda tidak memiliki akses ke data ini.');
      } else if (error.response?.status === 404) {
        setError('Data produk tidak ditemukan.');
      } else if (error.code === 'ERR_NETWORK') {
        setError('Gagal terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        setError(`Terjadi kesalahan: ${error.message}`);
      }
      
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div>
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-6">
        {/* Header dan Search */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <CardTitle className="text-2xl font-bold mb-4 md:mb-0">Daftar Produk</CardTitle>
          <div className="w-full md:w-1/3">
            <Input
              type="text"
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full"
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500">Memuat...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-red-500 text-center">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500 text-center">Tidak ada produk yang ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-4xl p-2.5"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <p className="text-gray-500 dark:text-gray-400">Tidak ada gambar</p>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold line-clamp-2">{product.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-300">
                          {product.category_name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-bold text-primary">
                          Rp {parseInt(product.price).toLocaleString('id-ID')}
                        </p>
                        <p className="text-sm text-gray-500">
                          Stok: {product.stock}
                        </p>
                      </div>
                      <Link to={`/products/${product.slug}`} className="block mt-4">
                        <Button variant="outline" className="w-full hover:bg-primary hover:text-white transition-colors">
                          Lihat Detail
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default ProductList;