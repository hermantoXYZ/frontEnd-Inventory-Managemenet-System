import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";


const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/api/login/', formData);
      localStorage.setItem('token', response.data.access);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);

      let errorMessage = 'Login gagal. Silakan coba lagi.';
      if (error.response && error.response.data) {
        errorMessage = error.response.data.detail || errorMessage;
      }
      setError(errorMessage);
      
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center m-5">
      <Card className="w-[400px]">
      <div className="w-full max-w-md space-y-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <p className="text-sm text-center text-muted-foreground mt-2">
            Masukkan detail Anda untuk login
          </p>
        </CardHeader>
        <CardContent>
        {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
      
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
        </CardContent>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Belum punya akun?{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Daftar disini
            </Link>
          </p>
        </div>
        
      </div>
      </Card>
    </div>
  );
};

export default Login;