import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const CategoryEdit = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { slug } = useParams();

  useEffect(() => {
    fetchCategory();
  }, [slug]);

  const fetchCategory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Token tidak ditemukan. Silakan login kembali.");
        navigate('/login');
        return;
      }

      const response = await axios.get(`http://localhost:8000/api/categories/${slug}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setFormData({
        name: response.data.name,
        description: response.data.description || ''
      });
      setLoading(false);
    } catch (error) {
      toast.error("Gagal memuat data kategori");
      navigate('/categories');
    }
  };

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

      await axios.put(`http://localhost:8000/api/categories/${slug}/`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      toast.success("Kategori berhasil diperbarui");
      navigate('/categories');
    } catch (error) {
      toast.error(error.response?.data?.detail || "Gagal memperbarui kategori");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-center">Memuat...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit Kategori</CardTitle>
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

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Deskripsi
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Masukkan deskripsi kategori"
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/categories')}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryEdit;
