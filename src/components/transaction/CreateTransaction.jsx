import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Minus, Receipt, ArrowLeft } from "lucide-react";

const CreateTransaction = () => {
  const [items, setItems] = useState([{ product: '', quantity: 1, unit_price: 0 }]);
  const [transactionType, setTransactionType] = useState('sale');
  const [status, setStatus] = useState('pending');
  const [notes, setNotes] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Cek token saat komponen dimuat
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Anda harus login terlebih dahulu');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  }, [navigate]);

  // Ambil daftar produk
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('http://localhost:8000/api/products/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
        
        if (error.response && error.response.status === 401) {
          toast.error('Sesi login Anda telah berakhir. Silakan login kembali.');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          toast.error('Gagal mengambil data produk: ' + (error.response?.data?.detail || error.message));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [navigate]);

  // Hitung total setiap kali items berubah
  useEffect(() => {
    const calculatedTotal = items.reduce((sum, item) => {
      return sum + (Number(item.quantity) * Number(item.unit_price));
    }, 0);
    setTotalAmount(calculatedTotal);
  }, [items]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    // Jika produk berubah, update harga satuan secara otomatis
    if (field === 'product' && value) {
      const selectedProduct = products.find(p => p.id === parseInt(value));
      if (selectedProduct) {
        newItems[index].unit_price = selectedProduct.price || 0;
      }
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { product: '', quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Token tidak ditemukan. Silakan login.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    // Validasi data
    if (items.some(item => !item.product)) {
      toast.error('Semua item harus memiliki produk yang dipilih.');
      return;
    }

    setSubmitting(true);

    try {
      // Format data items sesuai dengan yang diharapkan backend
      const formattedItems = items.map(item => ({
        product: parseInt(item.product),
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price)
      }));

      // Pastikan format data sesuai dengan yang diharapkan backend
      const requestData = {
        transaction_type: transactionType,
        status,
        notes,
        total_amount: totalAmount,
        items: formattedItems,
      };

      const response = await axios.post('http://localhost:8000/api/transactions/', requestData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      toast.success(`Transaksi berhasil dibuat! ID: ${response.data.transaction_id || response.data.id}`);
      
      // Reset form setelah berhasil
      setItems([{ product: '', quantity: 1, unit_price: 0 }]);
      setNotes('');
      setTransactionType('sale');
      setStatus('pending');
      
      // Redirect ke halaman daftar transaksi
      navigate('/transactions');
    } catch (error) {
      console.error('Error detail:', error);
      
      if (error.response) {
        // Handle 401 errors specifically
        if (error.response.status === 401) {
          toast.error('Sesi login Anda telah berakhir. Silakan login kembali.');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          // Tampilkan pesan error yang lebih detail
          if (typeof error.response.data === 'object') {
            const errorMessages = [];
            for (const key in error.response.data) {
              errorMessages.push(`${key}: ${error.response.data[key]}`);
            }
            toast.error(errorMessages.join('\n'));
          } else {
            toast.error(error.response.data?.detail || `Error: ${error.response.status}`);
          }
        }
      } else {
        toast.error(`Terjadi kesalahan: ${error.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/transactions')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" />
            <CardTitle>Buat Transaksi Baru</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="transaction_type">Tipe Transaksi</Label>
                <Select 
                  value={transactionType} 
                  onValueChange={setTransactionType}
                >
                  <SelectTrigger id="transaction_type">
                    <SelectValue placeholder="Pilih tipe transaksi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">Penjualan</SelectItem>
                    <SelectItem value="purchase">Pembelian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={status} 
                  onValueChange={setStatus}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea 
                id="notes"
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Tambahkan catatan transaksi (opsional)"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-semibold">Item Transaksi</Label>
                <Button 
                  type="button" 
                  onClick={addItem}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Tambah Item
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Memuat data produk...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-center p-3 border rounded-md bg-gray-50 dark:bg-gray-900">
                      <div className="col-span-12 md:col-span-5">
                        <Label htmlFor={`product-${index}`} className="mb-1 block text-sm">Produk</Label>
                        <Select
                          value={item.product.toString()}
                          onValueChange={(value) => handleItemChange(index, 'product', value)}
                        >
                          <SelectTrigger id={`product-${index}`}>
                            <SelectValue placeholder="Pilih produk" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map(product => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name} - Stok: {product.stock}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <Label htmlFor={`quantity-${index}`} className="mb-1 block text-sm">Jumlah</Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          min="1"
                        />
                      </div>
                      <div className="col-span-6 md:col-span-3">
                        <Label htmlFor={`price-${index}`} className="mb-1 block text-sm">Harga Satuan</Label>
                        <Input
                          id={`price-${index}`}
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                          min="0"
                        />
                      </div>
                      <div className="col-span-2 md:col-span-2 flex items-end justify-end">
                        {items.length > 1 && (
                          <Button 
                            type="button" 
                            onClick={() => removeItem(index)}
                            variant="destructive"
                            size="icon"
                            className="h-9 w-9"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="col-span-12 text-right text-sm font-medium">
                        Subtotal: Rp {(item.quantity * item.unit_price).toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end">
                <div className="bg-primary/10 p-3 rounded-md">
                  <p className="text-lg font-semibold">Total: Rp {totalAmount.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={loading || submitting || items.some(item => !item.product)}
                className="w-full md:w-auto"
              >
                {submitting ? 'Menyimpan...' : 'Simpan Transaksi'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTransaction;