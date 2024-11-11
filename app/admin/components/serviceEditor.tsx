'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';

// Import your icons data
import businessAdminIcons from '@/public/icons/businessAdministation';
import financialAdvisoryIcons from '@/public/icons/financialAdvisory';
import servicesPackages from '@/public/icons/servicesPackages';
import taxAdministration from '@/public/icons/taxAdministration';

const allIcons = [
  ...businessAdminIcons,
  ...financialAdvisoryIcons,
  ...servicesPackages,
  ...taxAdministration,
];

export default function ServiceIconsEditor() {
  const [icons, setIcons] = useState(allIcons);
  const [filteredIcons, setFilteredIcons] = useState(allIcons);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ mrp: '', salePrice: '', text: '' });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredIcons(icons);
    } else {
      setFilteredIcons(icons.filter((icon) => icon.category === selectedCategory));
    }
  }, [selectedCategory, icons]);

  const handleEdit = (id: number) => {
    const iconToEdit = icons.find((icon) => icon.id === id);
    if (iconToEdit) {
      setEditingId(id);
      setEditForm({
        mrp: iconToEdit.mrp,
        salePrice: iconToEdit.salePrice,
        text: iconToEdit.text,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  const confirmSave = () => {
    if (editingId) {
      setIcons(icons.map((icon) => (icon.id === editingId ? { ...icon, ...editForm } : icon)));
      setEditingId(null);
      setEditForm({ mrp: '', salePrice: '', text: '' });
      toast({
        title: 'Changes saved',
        description: 'Your changes have been successfully saved.',
      });
    }
    setShowConfirmDialog(false);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  return (
    <div className="mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Service Icons Editor</h1>
      <div className="mb-4">
        <Label htmlFor="category-select">Filter by Category</Label>
        <Select onValueChange={handleCategoryChange} defaultValue="All">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            <SelectItem value="Business Administation">Business Administration</SelectItem>
            <SelectItem value="Financial Advisory">Financial Advisory</SelectItem>
            <SelectItem value="Services Packages">Services Packages</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ScrollArea className="h-[600px] rounded-md border p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredIcons.map((icon) => (
            <Card
              key={icon.id}
              className={`m-2 flex flex-col ${editingId === icon.id ? 'bg-accent ring-2 ring-primary' : ''}`}
            >
              <CardHeader>
                <CardTitle className="text-lg">{icon.text}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex justify-center">
                  <Image src={icon.src} alt={icon.alt} width={100} height={100} />
                </div>
                <p>MRP: R{icon.mrp}</p>
                <p>Sale Price: R{icon.salePrice}</p>
                <p>Category: {icon.category}</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleEdit(icon.id)}>
                  {editingId === icon.id ? 'Editing...' : 'Edit'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {editingId && (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="mrp">MRP</Label>
            <Input id="mrp" name="mrp" value={editForm.mrp} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="salePrice">Sale Price</Label>
            <Input
              id="salePrice"
              name="salePrice"
              value={editForm.salePrice}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="text">Text</Label>
            <Input id="text" name="text" value={editForm.text} onChange={handleChange} required />
          </div>
          <Button type="submit">Save Changes</Button>
        </form>
      )}

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to save these changes?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Please confirm that you want to save the changes to this
              icon.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
