import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Profile = () => {
  const [profile, setProfile] = useState({
    email: '',
    first_name: '',
    bio: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token'); // Ubah dari 'access_token' menjadi 'token'
      const response = await axios.get('http://localhost:8000/api/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setProfile(response.data);
    } catch (error) {
      setError('Gagal mengambil data profil');
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token'); // Ubah dari 'access_token' menjadi 'token'
      await axios.put('http://localhost:8000/api/profile/', profile, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSuccess('Profil berhasil diperbarui');
      setIsEditing(false);
    } catch (error) {
      setError('Gagal memperbarui profil');
    }
  };

  return (
    <div className="min-h-screen p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Profil Saya</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="first_name">Nama</Label>
              <Input
                id="first_name"
                name="first_name"
                value={profile.first_name}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            {!isEditing ? (
              <Button type="button" onClick={() => setIsEditing(true)}>
                Edit Profil
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button type="submit">Simpan</Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfile();
                  }}
                >
                  Batal
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;