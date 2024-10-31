'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, Edit, Plus, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BotResponse {
  id: string;
  trigger: string;
  response: string;
}

export default function AdminBotResponses() {
  const [responses, setResponses] = useState<BotResponse[]>([]);
  const [newTrigger, setNewTrigger] = useState('');
  const [newResponse, setNewResponse] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      const res = await fetch('/api/admin/bot-responses');
      if (res.ok) {
        const data = await res.json();
        setResponses(data);
      } else {
        throw new Error('Failed to fetch responses');
      }
    } catch (error) {
      console.error('Failed to fetch responses:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch bot responses. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const addResponse = async () => {
    try {
      const res = await fetch('/api/admin/bot-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: newTrigger, response: newResponse }),
      });
      if (res.ok) {
        setNewTrigger('');
        setNewResponse('');
        fetchResponses();
        toast({
          title: 'Success',
          description: 'Bot response added successfully.',
        });
      } else {
        throw new Error('Failed to add response');
      }
    } catch (error) {
      console.error('Failed to add response:', error);
      toast({
        title: 'Error',
        description: 'Failed to add bot response. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const updateResponse = async (id: string, trigger: string, response: string) => {
    try {
      const res = await fetch(`/api/admin/bot-responses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger, response }),
      });
      if (res.ok) {
        setEditingId(null);
        fetchResponses();
        toast({
          title: 'Success',
          description: 'Bot response updated successfully.',
        });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update response');
      }
    } catch (error) {
      console.error('Failed to update response:', error);
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to update bot response. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const deleteResponse = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/bot-responses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchResponses();
        toast({
          title: 'Success',
          description: 'Bot response deleted successfully.',
        });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete response');
      }
    } catch (error) {
      console.error('Failed to delete response:', error);
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to delete bot response. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Manage Bot Responses</h1>
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Trigger"
          value={newTrigger}
          onChange={(e) => setNewTrigger(e.target.value)}
        />
        <Input
          placeholder="Response"
          value={newResponse}
          onChange={(e) => setNewResponse(e.target.value)}
        />
        <Button onClick={addResponse}>
          <Plus className="mr-2 h-4 w-4" /> Add
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Trigger</TableHead>
            <TableHead>Response</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {responses.map((response) => (
            <TableRow key={response.id}>
              <TableCell>
                {editingId === response.id ? (
                  <Input
                    value={response.trigger}
                    onChange={(e) =>
                      setResponses(
                        responses.map((r) =>
                          r.id === response.id ? { ...r, trigger: e.target.value } : r,
                        ),
                      )
                    }
                  />
                ) : (
                  response.trigger
                )}
              </TableCell>
              <TableCell>
                {editingId === response.id ? (
                  <Input
                    value={response.response}
                    onChange={(e) =>
                      setResponses(
                        responses.map((r) =>
                          r.id === response.id ? { ...r, response: e.target.value } : r,
                        ),
                      )
                    }
                  />
                ) : (
                  response.response
                )}
              </TableCell>
              <TableCell>
                {editingId === response.id ? (
                  <Button
                    onClick={() => updateResponse(response.id, response.trigger, response.response)}
                  >
                    <Save className="mr-2 h-4 w-4" /> Save
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" onClick={() => setEditingId(response.id)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="ghost" onClick={() => deleteResponse(response.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
