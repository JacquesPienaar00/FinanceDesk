'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';

export default function UserProfile() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
      setAvatarUrl(session.user.image || '');
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'New passwords do not match',
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, currentPassword, newPassword, avatarUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
        });
        await update({ name, email, image: avatarUrl });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.message || 'Failed to update profile',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/user/profile-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setAvatarUrl(data.imageUrl);
        toast({
          title: 'Success',
          description: 'Profile picture uploaded successfully',
        });
        await update({ ...session?.user, image: data.imageUrl });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.message || 'Failed to upload profile picture',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred while uploading the image',
      });
    }
  };

  const getProfileImageUrl = () => {
    return avatarUrl || session?.user?.image || '';
  };

  if (!session) {
    router.push('/signin');
    return null;
  }

  return (
    <>
      <Toaster />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Update Profile</CardTitle>
            <CardDescription>Change your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center space-y-2"
                >
                  <div
                    className="relative h-24 w-24 cursor-pointer overflow-hidden rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {getProfileImageUrl() ? (
                      <Image
                        src={getProfileImageUrl()}
                        alt={name}
                        layout="fill"
                        objectFit="cover"
                        onError={(e) => {
                          console.error('Error loading image:', e);
                          e.currentTarget.src = '';
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-200 text-2xl font-bold text-gray-500">
                        {name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity hover:opacity-100">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Picture
                  </Button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: 0.2 }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: 0.3 }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: 0.4 }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password (leave blank to keep current)</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: 0.5 }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
