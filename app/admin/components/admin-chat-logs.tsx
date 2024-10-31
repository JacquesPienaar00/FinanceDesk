'use client';

import React, { useState, useRef, useEffect } from 'react';
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
import { User, Bot, Send, Ticket, Clock, X, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'human';
  createdAt: string;
  ticketId: string;
}

interface Ticket {
  id: string;
  number: string;
  status: 'Open' | 'InProgress' | 'Closed';
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  subject: string;
}

interface ChatLog {
  id: string;
  name: string | null;
  tickets: Ticket[];
}

export default function AdminChatLogs() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [selectedChatLog, setSelectedChatLog] = useState<ChatLog | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initSocket = async () => {
      try {
        await fetch('/api/socket');
        const newSocket = io({
          path: '/api/socket',
          addTrailingSlash: false,
        });

        newSocket.on('connect', () => {
          console.log('Admin connected to Socket.IO server');
        });

        newSocket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          setError('Failed to connect to real-time server');
        });

        newSocket.on('receive-message', (message: Message) => {
          updateMessageInState(message);
        });

        newSocket.on('ticket-updated', (updatedTicket: Ticket) => {
          updateTicketInState(updatedTicket);
        });

        setSocket(newSocket);
      } catch (error) {
        console.error('Failed to initialize socket:', error);
        setError('Failed to connect to real-time server');
      }
    };

    initSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    fetchChatLogs();
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [selectedTicket?.messages]);

  const fetchChatLogs = async () => {
    try {
      const response = await fetch('/api/admin/chatlogs');
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
    if (socket) {
      socket.emit('join-room', ticket.id);
    }
  };

  const handleReply = async () => {
    if (!selectedChatLog || !selectedTicket || !replyText.trim()) {
      setError('Please select a chat log and ticket, and enter a reply');
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text: replyText,
      sender: 'human',
      createdAt: new Date().toISOString(),
      ticketId: selectedTicket.id,
    };

    // Optimistically update the UI
    updateMessageInState(newMessage);
    setReplyText('');

    try {
      const response = await fetch('/api/admin/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedChatLog.id,
          ticketId: selectedTicket.id,
          text: newMessage.text,
          sender: 'human',
        }),
      });

      if (response.ok) {
        const updatedTicket = await response.json();
        updateTicketInState(updatedTicket);
        setError(null);
        if (socket) {
          socket.emit('send-message', { roomId: selectedTicket.id, message: newMessage });
        }
      } else {
        setError('Failed to send reply');
        // Remove the optimistically added message on error
        removeMessageFromState(newMessage);
      }
    } catch (error) {
      setError('Error sending reply');
      console.error('Error sending reply:', error);
      // Remove the optimistically added message on error
      removeMessageFromState(newMessage);
    }
  };

  const handleUpdateTicketStatus = async (status: 'Open' | 'InProgress' | 'Closed') => {
    if (!selectedChatLog || !selectedTicket) {
      setError('Please select a chat log and ticket');
      return;
    }

    try {
      const response = await fetch('/api/admin/update-ticket-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          status: status,
        }),
      });

      if (response.ok) {
        const updatedTicket = await response.json();
        updateTicketInState(updatedTicket);
        setError(null);
        if (socket) {
          socket.emit('update-ticket', { roomId: selectedTicket.id, ticket: updatedTicket });
        }
      } else {
        const errorData = await response.json();
        setError(`Failed to update ticket status: ${errorData.error}`);
      }
    } catch (error) {
      setError('Error updating ticket status');
      console.error('Error updating ticket status:', error);
    }
  };

  const updateTicketInState = (updatedTicket: Ticket) => {
    setChatLogs((prevLogs) =>
      prevLogs.map((log) => ({
        ...log,
        tickets: log.tickets.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)),
      })),
    );
    setSelectedChatLog((prev) => {
      if (prev) {
        return {
          ...prev,
          tickets: prev.tickets.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)),
        };
      }
      return prev;
    });
    if (selectedTicket && selectedTicket.id === updatedTicket.id) {
      setSelectedTicket(updatedTicket);
    }
  };

  const updateMessageInState = (newMessage: Message) => {
    setChatLogs((prevLogs) =>
      prevLogs.map((log) => ({
        ...log,
        tickets: log.tickets.map((t) =>
          t.id === newMessage.ticketId ? { ...t, messages: [...t.messages, newMessage] } : t,
        ),
      })),
    );
    setSelectedChatLog((prev) => {
      if (prev) {
        return {
          ...prev,
          tickets: prev.tickets.map((t) =>
            t.id === newMessage.ticketId ? { ...t, messages: [...t.messages, newMessage] } : t,
          ),
        };
      }
      return prev;
    });
    setSelectedTicket((prev) => {
      if (prev && prev.id === newMessage.ticketId) {
        return {
          ...prev,
          messages: [...prev.messages, newMessage],
        };
      }
      return prev;
    });
  };

  const removeMessageFromState = (messageToRemove: Message) => {
    setChatLogs((prevLogs) =>
      prevLogs.map((log) => ({
        ...log,
        tickets: log.tickets.map((t) =>
          t.id === messageToRemove.ticketId
            ? { ...t, messages: t.messages.filter((m) => m.id !== messageToRemove.id) }
            : t,
        ),
      })),
    );
    setSelectedChatLog((prev) => {
      if (prev) {
        return {
          ...prev,
          tickets: prev.tickets.map((t) =>
            t.id === messageToRemove.ticketId
              ? { ...t, messages: t.messages.filter((m) => m.id !== messageToRemove.id) }
              : t,
          ),
        };
      }
      return prev;
    });
    setSelectedTicket((prev) => {
      if (prev && prev.id === messageToRemove.ticketId) {
        return {
          ...prev,
          messages: prev.messages.filter((m) => m.id !== messageToRemove.id),
        };
      }
      return prev;
    });
  };

  const filteredChatLogs = chatLogs.filter((log) => {
    if (filter === 'all') return true;
    return log.tickets.some((ticket) => ticket.status.toLowerCase() === filter.toLowerCase());
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
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="InProgress">In Progress</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={fetchChatLogs} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
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
                  key={chatLog.id}
                  className="cursor-pointer p-2 hover:bg-gray-100"
                  onClick={() => handleSelectChatLog(chatLog)}
                >
                  <p className="font-semibold">{chatLog.name || 'Anonymous'}</p>
                  <p className="text-sm text-gray-500">User ID: {chatLog.id}</p>
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
                  key={ticket.id}
                  className="cursor-pointer p-2 hover:bg-gray-100"
                  onClick={() => handleSelectTicket(ticket)}
                >
                  <div className="flex items-center space-x-2">
                    <Ticket className="h-4 w-4 text-primary" />
                    <p className="font-semibold">#{ticket.number}</p>
                  </div>
                  <p className="text-sm text-gray-500">Status: {ticket.status}</p>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Updated: {new Date(ticket.updatedAt).toLocaleString()}
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
                      #{selectedTicket.number} - {selectedTicket.status}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => handleUpdateTicketStatus('Open')}
                            disabled={selectedTicket.status === 'Open'}
                            size="icon"
                            variant="outline"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Reopen Ticket</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => handleUpdateTicketStatus('InProgress')}
                            disabled={selectedTicket.status === 'InProgress'}
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
                <ScrollArea className="mb-4 h-[450px]" ref={scrollAreaRef}>
                  {selectedTicket.messages.map((message) => (
                    <div key={message.id} className="mb-2">
                      <div className="flex items-center space-x-2">
                        {message.sender === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : message.sender === 'bot' ? (
                          <Bot className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4 text-green-500" />
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(message.createdAt).toLocaleString()}
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
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleReply();
                      }
                    }}
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
