import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { PlusCircle } from 'lucide-react';

const CategoryAdd = () => {
  const [formData, setFormData] = useState({
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Token tidak ditemukan. Silakan login kembali.");
        return;
      }

      await axios.post('http://localhost:8000/api/categories/', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      toast.success("Kategori berhasil ditambahkan");
      navigate('/categories');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.detail || "Gagal menambahkan kategori");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
      <CardHeader>
          <div className="flex items-center gap-2">
            <PlusCircle className="h-6 w-6" />
            <CardTitle>Tambah Kategori Baru</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nama Kategori
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Masukkan nama kategori"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan Kategori"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryAdd;