'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Bot, Send, Ticket, Clock, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Message {
  text: string;
  sender: 'user' | 'bot' | 'human';
  timestamp: string;
}

interface Ticket {
  number: string;
  status: string;
  createdAt: string;
  messages: Message[];
}

interface ChatLog {
  userId: string;
  userName: string;
  tickets: Ticket[];
}

function formatTicketNumber(number: string) {
  const shortNumber = number.slice(-6);
  return shortNumber.toUpperCase();
}

export default function AdminChatLogs() {
  const { data: session } = useSession();
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [selectedChatLog, setSelectedChatLog] = useState<ChatLog | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChatLogs();
  }, []);

  const fetchChatLogs = async () => {
    try {
      const response = await fetch('/api/chatbot/admin/chatlogs');
      if (response.ok) {
        const data = await response.json();
        setChatLogs(data.chatLogs);
      } else {
        setError('Failed to fetch chat logs');
      }
    } catch (error) {
      setError('Error fetching chat logs');
      console.error('Error fetching chat logs:', error);
    }
  };

  const handleSelectChatLog = (chatLog: ChatLog) => {
    setSelectedChatLog(chatLog);
    setSelectedTicket(null);
    setError(null);
  };

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setError(null);
  };

  const handleReply = async () => {
    if (!selectedChatLog || !selectedTicket || !replyText.trim()) {
      setError('Please select a chat log and ticket, and enter a reply');
      return;
    }

    try {
      const response = await fetch('/api/chatbot/admin/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedChatLog.userId,
          ticketNumber: selectedTicket.number,
          text: replyText,
          sender: 'human',
        }),
      });

      if (response.ok) {
        const updatedChatLog = await response.json();
        setChatLogs((prevLogs) =>
          prevLogs.map((log) => (log.userId === updatedChatLog.userId ? updatedChatLog : log)),
        );
        setSelectedChatLog(updatedChatLog);
        setSelectedTicket(
          updatedChatLog.tickets.find((t: Ticket) => t.number === selectedTicket.number) || null,
        );
        setReplyText('');
        setError(null);
      } else {
        setError('Failed to send reply');
      }
    } catch (error) {
      setError('Error sending reply');
      console.error('Error sending reply:', error);
    }
  };

  const handleUpdateTicketStatus = async (status: string) => {
    if (!selectedChatLog || !selectedTicket) {
      setError('Please select a chat log and ticket');
      return;
    }

    try {
      const response = await fetch('/api/chatbot/admin/update-ticket-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedChatLog.userId,
          ticketNumber: selectedTicket.number,
          status: status,
        }),
      });

      if (response.ok) {
        const { chatLog } = await response.json();
        setChatLogs((prevLogs) =>
          prevLogs.map((log) => (log.userId === chatLog.userId ? chatLog : log)),
        );
        setSelectedChatLog(chatLog);
        setSelectedTicket(
          chatLog.tickets.find((t: Ticket) => t.number === selectedTicket.number) || null,
        );
        setError(null);
      } else {
        const errorData = await response.json();
        setError(`Failed to update ticket status: ${errorData.error}`);
      }
    } catch (error) {
      setError('Error updating ticket status');
      console.error('Error updating ticket status:', error);
    }
  };

  const filteredChatLogs = chatLogs.filter((log) => {
    if (filter === 'all') return true;
    return log.tickets.some((ticket) => ticket.status.toLowerCase() === filter);
  });

  return (
    <div className="mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Admin Chat Logs</h1>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <div className="mb-4 flex space-x-4">
        <Select onValueChange={setFilter} defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in progress">In Progress</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Chat Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              {filteredChatLogs.map((chatLog) => (
                <div
                  key={chatLog.userId}
                  className="cursor-pointer p-2 hover:bg-gray-100"
                  onClick={() => handleSelectChatLog(chatLog)}
                >
                  <p className="font-semibold">{chatLog.userName}</p>
                  <p className="text-sm text-gray-500">User ID: {chatLog.userId}</p>
                  <p className="text-sm text-gray-500">Tickets: {chatLog.tickets.length}</p>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              {selectedChatLog?.tickets.map((ticket) => (
                <div
                  key={ticket.number}
                  className="cursor-pointer p-2 hover:bg-gray-100"
                  onClick={() => handleSelectTicket(ticket)}
                >
                  <div className="flex items-center space-x-2">
                    <Ticket className="h-4 w-4 text-primary" />
                    <p className="font-semibold">#{formatTicketNumber(ticket.number)}</p>
                  </div>
                  <p className="text-sm text-gray-500">Status: {ticket.status}</p>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </div>
              )) || <p>Select a chat log to view tickets</p>}
            </ScrollArea>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Chat Messages</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTicket ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Ticket className="h-5 w-5 text-primary" />
                    <p className="font-semibold">
                      #{formatTicketNumber(selectedTicket.number)} - {selectedTicket.status}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => handleUpdateTicketStatus('In Progress')}
                            disabled={selectedTicket.status === 'In Progress'}
                            size="icon"
                            variant="outline"
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Set In Progress</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => handleUpdateTicketStatus('Closed')}
                            disabled={selectedTicket.status === 'Closed'}
                            size="icon"
                            variant="outline"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Close Ticket</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <ScrollArea className="mb-4 h-[450px]">
                  {selectedTicket.messages.map((message, index) => (
                    <div key={index} className="mb-2">
                      <div className="flex items-center space-x-2">
                        {message.sender === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : message.sender === 'bot' ? (
                          <Bot className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4 text-green-500" />
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="ml-6">{message.text}</p>
                    </div>
                  ))}
                </ScrollArea>
                <div className="flex space-x-2">
                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                  />
                  <Button onClick={handleReply}>
                    <Send className="mr-2 h-4 w-4" />
                    Reply
                  </Button>
                </div>
              </>
            ) : (
              <p>Select a ticket to view messages</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
