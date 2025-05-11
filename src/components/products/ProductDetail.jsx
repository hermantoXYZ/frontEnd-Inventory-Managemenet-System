import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/api/products/${slug}/`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });

      setProduct(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setError(
        error.response?.data?.detail || 
        'Terjadi kesalahan saat memuat detail produk.'
      );
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-[60vh]">
          <p className="text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-[60vh]">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-[60vh]">
          <p className="text-gray-500">Produk tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div>
    <div className="container mx-auto p-4">
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={handleBack}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Kembali
      </Button>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gambar Produk */}
          <div className="relative h-[400px]">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover rounded-2xl ml-4"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Tidak ada gambar</p>
              </div>
            )}
          </div>

          {/* Detail Produk */}
          <CardContent className="p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-300">
                {product.category_name}
              </span>
            </div>

            <div className="space-y-4">
              <p className="text-2xl font-bold text-primary">
                Rp {parseInt(product.price).toLocaleString('id-ID')}
              </p>
              
              <div className="flex items-center space-x-4">
                <span className="text-gray-600 dark:text-gray-300">Stok:</span>
                <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Deskripsi</h3>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                  {product.description || 'Tidak ada deskripsi'}
                </p>
              </div>

              <div className="pt-6">
                <p className="text-sm text-gray-500">
                  Terakhir diperbarui: {new Date(product.updated_at).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
     
    </div>
     </div>
  );
};

export default ProductDetail;