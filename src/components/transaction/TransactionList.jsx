import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Receipt, Plus, Search, Filter, Calendar } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, [searchTerm, filterType, filterStatus, dateFrom, dateTo]);

  const fetchTransactions = async () => {
    try {
      console.log('Fetching transactions...');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.');
        setLoading(false);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      // Buat URL dengan parameter filter
      const url = new URL(`${API_URL}/api/transactions/`);
      if (searchTerm) {
        url.searchParams.append('search', searchTerm);
      }
      if (filterType) {
        url.searchParams.append('transaction_type', filterType);
      }
      if (filterStatus) {
        url.searchParams.append('status', filterStatus);
      }
      if (dateFrom) {
        url.searchParams.append('date_from', dateFrom);
      }
      if (dateTo) {
        url.searchParams.append('date_to', dateTo);
      }

      const response = await axios.get(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });

      console.log('API response:', response.data);
      setTransactions(response.data);
      setError('');
      setLoading(false);
    } catch (error) {
      console.error('Error lengkap:', error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setError('Sesi telah berakhir. Silakan login kembali.');
        toast.error('Sesi telah berakhir. Silakan login kembali.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else if (error.response?.status === 403) {
        setError('Anda tidak memiliki akses ke data ini.');
        toast.error('Anda tidak memiliki akses ke data ini.');
      } else if (error.response?.status === 404) {
        setError('Data transaksi tidak ditemukan.');
        toast.error('Data transaksi tidak ditemukan.');
      } else if (error.code === 'ERR_NETWORK') {
        setError('Gagal terhubung ke server. Periksa koneksi internet Anda.');
        toast.error('Gagal terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        setError(`Terjadi kesalahan: ${error.message}`);
        toast.error(`Terjadi kesalahan: ${error.message}`);
      }
      
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleReset = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterStatus('');
    setDateFrom('');
    setDateTo('');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case 'sale':
        return 'Penjualan';
      case 'purchase':
        return 'Pembelian';
      default:
        return type;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Selesai';
      case 'pending':
        return 'Menunggu';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-6">
        {/* Header dan Search */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <Receipt className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold">Daftar Transaksi</CardTitle>
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <Link to="/transactions/create">
              <Button className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Buat Transaksi
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter dan Search */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="text"
                    placeholder="Cari transaksi..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-10 w-full"
                  />
                </div>
              </div>
              <div className="w-full md:w-1/4">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipe Transaksi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tipe</SelectItem>
                    <SelectItem value="sale">Penjualan</SelectItem>
                    <SelectItem value="purchase">Pembelian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-1/4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    placeholder="Dari Tanggal"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="w-full md:w-1/3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    placeholder="Sampai Tanggal"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="w-full md:w-1/3 flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  className="w-full md:w-auto"
                >
                  Reset Filter
                </Button>
              </div>
            </div>
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
          ) : transactions.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500 text-center">Tidak ada transaksi yang ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ID Transaksi
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tipe
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.transaction_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {getTransactionTypeLabel(transaction.transaction_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(transaction.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        Rp {parseInt(transaction.total_amount).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(transaction.status)}`}>
                          {getStatusLabel(transaction.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link to={`/transactions/${transaction.id}`}>
                          <Button variant="outline" size="sm">
                            Detail
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionList;