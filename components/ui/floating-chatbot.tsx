'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, User, Bot, Ticket, Send, CheckCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'human';
  createdAt: string;
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

interface BotResponse {
  id: string;
  trigger: string;
  response: string;
}

function formatTicketNumber(number: string) {
  return number.toUpperCase();
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'open':
      return 'bg-green-100 text-green-800';
    case 'inprogress':
      return 'bg-yellow-100 text-yellow-800';
    case 'closed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function FloatingChatbot() {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isHumanRequested, setIsHumanRequested] = useState(false);
  const [isBotDisabled, setIsBotDisabled] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showClosedMessage, setShowClosedMessage] = useState(false);
  const [botResponses, setBotResponses] = useState<BotResponse[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && status === 'authenticated') {
      fetchTickets();
      fetchBotResponses();
    }
  }, [isOpen, status]);

  useEffect(() => {
    if (selectedTicket && selectedTicket.status === 'Closed') {
      setShowClosedMessage(true);
      const timer = setTimeout(() => setShowClosedMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [selectedTicket]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const initSocket = async () => {
    await fetch('/api/socket');
    const newSocket = io({
      path: '/api/socket',
      addTrailingSlash: false,
    });

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    newSocket.on('receive-message', (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    newSocket.on('ticket-updated', (updatedTicket: Ticket) => {
      setSelectedTicket(updatedTicket);
      setTickets((prevTickets) =>
        prevTickets.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)),
      );
      setMessages(updatedTicket.messages);
    });

    setSocket(newSocket);
  };

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/tickets');
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets);
        if (data.tickets.length > 0) {
          const latestTicket = data.tickets[0];
          setSelectedTicket(latestTicket);
          setMessages(latestTicket.messages);
        }
      } else {
        console.error('Failed to fetch tickets');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const fetchBotResponses = async () => {
    try {
      const response = await fetch('/api/admin/bot-responses');
      if (response.ok) {
        const data = await response.json();
        setBotResponses(data);
      } else {
        console.error('Failed to fetch bot responses');
      }
    } catch (error) {
      console.error('Error fetching bot responses:', error);
    }
  };

  const getBotResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    for (const botResponse of botResponses) {
      if (lowerInput.includes(botResponse.trigger.toLowerCase())) {
        return botResponse.response;
      }
    }
    return "I'm sorry, I don't have a specific answer for that. How else can I assist you?";
  };

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch(
        selectedTicket ? `/api/tickets/${selectedTicket.id}` : '/api/tickets',
        {
          method: selectedTicket ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: input,
            subject: 'chatbot',
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.ticket) {
          setSelectedTicket(data.ticket);
          setMessages(data.ticket.messages);
          if (!selectedTicket) {
            setTickets((prev) => [data.ticket, ...prev]);
          } else {
            setTickets((prev) => prev.map((t) => (t.id === data.ticket.id ? data.ticket : t)));
          }

          if (socket) {
            socket.emit('update-ticket', { roomId: data.ticket.id, ticket: data.ticket });
          }
        }

        if (!isBotDisabled) {
          const botResponseText = getBotResponse(input);
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: botResponseText,
            sender: 'bot',
            createdAt: new Date().toISOString(),
          };

          setMessages((prev) => [...prev, botMessage]);

          const botResponse = await fetch(`/api/tickets/${data.ticket.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: botResponseText,
              sender: 'bot',
            }),
          });

          if (botResponse.ok) {
            const updatedTicket = await botResponse.json();
            setSelectedTicket(updatedTicket.ticket);
            setTickets((prev) =>
              prev.map((t) => (t.id === updatedTicket.ticket.id ? updatedTicket.ticket : t)),
            );

            if (socket) {
              socket.emit('send-message', { roomId: updatedTicket.ticket.id, message: botMessage });
            }
          }
        }
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const requestHuman = async () => {
    if (!socket) {
      await initSocket();
    }

    setIsHumanRequested(true);
    setIsBotDisabled(true);
    const humanMessage: Message = {
      id: Date.now().toString(),
      text: "Hello! I'm a human agent. How can I assist you today?",
      sender: 'human',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, humanMessage]);

    if (selectedTicket) {
      try {
        const response = await fetch(`/api/tickets/${selectedTicket.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: humanMessage.text,
            sender: 'human',
          }),
        });

        if (response.ok) {
          const updatedTicket = await response.json();
          setSelectedTicket(updatedTicket.ticket);
          setMessages(updatedTicket.ticket.messages);
          setTickets((prev) =>
            prev.map((t) => (t.id === updatedTicket.ticket.id ? updatedTicket.ticket : t)),
          );

          if (socket) {
            socket.emit('join-room', updatedTicket.ticket.id);
            socket.emit('send-message', { roomId: updatedTicket.ticket.id, message: humanMessage });
          }
        }
      } catch (error) {
        console.error('Error sending human message:', error);
      }
    }
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const startNewConversation = async () => {
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Start new conversation',
          subject: 'Support Chat',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.ticket) {
          setSelectedTicket(data.ticket);
          setTickets((prev) => [data.ticket, ...prev]);
          const initialMessage: Message = {
            id: Date.now().toString(),
            text: `A new support ticket has been created with number ${formatTicketNumber(
              data.ticket.number,
            )}. How can I assist you today?`,
            sender: 'bot',
            createdAt: new Date().toISOString(),
          };
          setMessages([initialMessage]);
          setIsHumanRequested(false);
          setIsBotDisabled(false);
          if (socket) {
            socket.emit('join-room', data.ticket.id);
            socket.emit('send-message', { roomId: data.ticket.id, message: initialMessage });
          }
        }
      } else {
        console.error('Failed to start new conversation');
      }
    } catch (error) {
      console.error('Error starting new conversation:', error);
    }
  };

  const handleTicketSelect = (ticketId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (ticket) {
      setSelectedTicket(ticket);
      setMessages(ticket.messages);
      setIsHumanRequested(false);
      setIsBotDisabled(false);
      if (socket) {
        socket.emit('join-room', ticket.id);
      }
    }
  };

  return (
    <>
      {isOpen && (
        <Card className="fixed bottom-20 right-4 flex h-[70vh] w-96 scale-100 transform flex-col overflow-hidden rounded-lg border bg-background opacity-100 shadow-lg transition-all duration-300 ease-in-out">
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <CardTitle className="text-lg">Support</CardTitle>
            {selectedTicket && (
              <div className="flex items-center space-x-2">
                <Ticket className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">
                  #{formatTicketNumber(selectedTicket.number)}
                </span>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                    selectedTicket.status,
                  )}`}
                >
                  {selectedTicket.status}
                </span>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={toggleChatbot}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </CardHeader>
          <AnimatePresence>
            {showClosedMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.1 }}
                className="absolute left-1/2 top-14 z-10 -translate-x-1/2 transform rounded-full bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-lg"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Last chat ticket closed</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <Tabs defaultValue="chat" className="flex flex-grow flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="tickets">Tickets</TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="flex flex-grow flex-col overflow-hidden">
              <ScrollArea className="h-[45vh]" ref={scrollAreaRef}>
                <div className="flex flex-col space-y-4 p-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`flex max-w-[80%] items-start space-x-2 ${
                          message.sender === 'user'
                            ? 'flex-row-reverse space-x-reverse'
                            : 'flex-row'
                        }`}
                      >
                        {message.sender !== 'user' && (
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              message.sender === 'bot' ? 'bg-blue-500' : 'bg-green-500'
                            }`}
                          >
                            {message.sender === 'bot' ? (
                              <Bot className="h-5 w-5 text-white" />
                            ) : (
                              <User className="h-5 w-5 text-white" />
                            )}
                          </div>
                        )}
                        <div
                          className={`rounded-lg p-2 ${
                            message.sender === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : message.sender === 'human'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {message.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <CardContent className="border-t bg-background p-4">
                <div className="mb-2 flex">
                  <Input
                    type="text"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="mr-2 flex-grow"
                  />
                  <Button onClick={handleSend}>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
                {!isHumanRequested && (
                  <Button onClick={requestHuman} variant="outline" className="mb-2 w-full">
                    <User className="mr-2 h-4 w-4" />
                    Request Human Agent
                  </Button>
                )}
                {selectedTicket && selectedTicket.status === 'Closed' && (
                  <Button onClick={startNewConversation} variant="outline" className="w-full">
                    Start New Conversation
                  </Button>
                )}
              </CardContent>
            </TabsContent>
            <TabsContent value="tickets" className="flex flex-col">
              <CardContent className="border-b p-4">
                <Select onValueChange={handleTicketSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a ticket" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {tickets.map((ticket) => (
                        <SelectItem key={ticket.id} value={ticket.id}>
                          #{formatTicketNumber(ticket.number)} - {ticket.status}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </CardContent>

              {selectedTicket && (
                <CardContent className="border-t bg-background p-4">
                  <CardDescription className="font-semibold">
                    Selected Ticket: #{formatTicketNumber(selectedTicket.number)}
                  </CardDescription>
                  <ScrollArea className="h-[45vh]">
                    <div className="space-y-2">
                      {selectedTicket.messages.map((message) => (
                        <div key={message.id} className="text-sm">
                          <span className="font-semibold">{message.sender}: </span>
                          {message.text}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      )}

      <Button
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg"
        onClick={toggleChatbot}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="sr-only">Open chat</span>
      </Button>
    </>
  );
}
