'use client';

import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PfDataItem {
  name: string;
  timestamp: string;
}

interface PfData {
  item_name: PfDataItem[];
}

interface UserPfDataEditorProps {
  initialData: PfData;
  onSave: (newData: PfData) => void;
  onDelete: (itemToDelete: PfDataItem) => void;
}

export default function UserPfDataEditor({ initialData, onSave, onDelete }: UserPfDataEditorProps) {
  const [data, setData] = useState<PfData>(initialData);
  const [editingItem, setEditingItem] = useState<PfDataItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<PfDataItem | null>(null);

  const handleEdit = (item: PfDataItem) => {
    setEditingItem({ ...item });
    setIsEditDialogOpen(true);
  };

  const handleSave = () => {
    if (editingItem) {
      const newData = {
        ...data,
        item_name: data.item_name.map((item) =>
          item.timestamp === editingItem.timestamp ? editingItem : item,
        ),
      };
      setData(newData);
      setIsEditDialogOpen(false);
      setIsConfirmDialogOpen(true);
    }
  };

  const handleConfirmSave = () => {
    onSave(data);
    setIsConfirmDialogOpen(false);
  };

  const handleDelete = (item: PfDataItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete);
      const newData = {
        ...data,
        item_name: data.item_name.filter((item) => item.timestamp !== itemToDelete.timestamp),
      };
      setData(newData);
    }
    setIsDeleteDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="w-full">
      <ScrollArea className="h-[400px] w-full rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.item_name.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{formatDate(item.timestamp)}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    className="mr-2"
                  >
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(item)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Name
              </label>
              <Input
                id="name"
                value={editingItem?.name || ''}
                onChange={(e) =>
                  setEditingItem((prev) => (prev ? { ...prev, name: e.target.value } : null))
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="timestamp" className="text-right">
                Timestamp
              </label>
              <Input
                id="timestamp"
                value={editingItem?.timestamp || ''}
                onChange={(e) =>
                  setEditingItem((prev) => (prev ? { ...prev, timestamp: e.target.value } : null))
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will update the user&apos;s PF data. Are you sure you want to make these
              changes?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
