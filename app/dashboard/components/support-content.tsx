'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useSession } from 'next-auth/react';
import { HelpCircle, MessageCircle, Phone, Plus, User, Bot, Send, Ticket } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'human';
  createdAt: string;
}

interface Ticket {
  id: string;
  number: string;
  subject: string;
  status: 'Open' | 'InProgress' | 'Closed';
  createdAt: string;
  updatedAt: string;
  messages: Message[];
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

export function SupportContent() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isHumanRequested, setIsHumanRequested] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [botResponses, setBotResponses] = useState<BotResponse[]>([]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTickets();
      fetchBotResponses();
    }
  }, [status]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/tickets');
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets);
        if (data.tickets.length > 0) {
          const latestTicket = data.tickets[0]; // Assuming tickets are ordered by createdAt desc
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
            subject: 'chatbot',
            message: input,
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
        }

        // Generate and send bot response
        const botResponseText = getBotResponse(input);
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: botResponseText,
          sender: 'bot',
          createdAt: new Date().toISOString(),
        };

        // Send bot response to the API
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
          setMessages(updatedTicket.ticket.messages);
          setTickets((prev) =>
            prev.map((t) => (t.id === updatedTicket.ticket.id ? updatedTicket.ticket : t)),
          );
        }
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTicketSelect = (ticketId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (ticket) {
      setSelectedTicket(ticket);
      setMessages(ticket.messages);
      setActiveTab('chat');
    }
  };

  const startNewConversation = async () => {
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: 'chatbot',
          message: 'Start new conversation',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.ticket) {
          setSelectedTicket(data.ticket);
          setTickets((prev) => [data.ticket, ...prev]);
          setMessages([
            {
              id: Date.now().toString(),
              text: `A new support ticket has been created with number ${formatTicketNumber(
                data.ticket.number,
              )}. How can I assist you today?`,
              sender: 'bot',
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      } else {
        console.error('Failed to start new conversation');
      }
    } catch (error) {
      console.error('Error starting new conversation:', error);
    }
  };

  const requestHuman = async () => {
    setIsHumanRequested(true);
    const humanMessage: Message = {
      id: Date.now().toString(),
      text: "Hello! I'm a human agent. How can I assist you today?",
      sender: 'human',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, humanMessage]);

    // Send human response to the API
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
        }
      } catch (error) {
        console.error('Error sending human message:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Support Center</CardTitle>
          <CardDescription>Get help with your account and services</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="tickets">My Tickets</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="contact">Contact Us</TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="space-y-4">
              <Card>
                <CardHeader className="bg-secondary shadow-md">
                  <CardTitle className="flex items-center justify-between">
                    <span>Live Chat Support</span>
                    <div className="flex items-center justify-center gap-2">
                      {!isHumanRequested && (
                        <Button onClick={requestHuman} variant="outline" className="mt-2">
                          <User className="mr-2 h-4 w-4" />
                          Request Human Agent
                        </Button>
                      )}
                      {selectedTicket && selectedTicket.status === 'Closed' && (
                        <Button onClick={startNewConversation} variant="outline" className="mt-2">
                          Start New Conversation
                        </Button>
                      )}
                    </div>
                    {selectedTicket && (
                      <div className="flex items-center space-x-2 rounded-full border bg-white p-2 shadow-md">
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
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[65vh] pl-10 pr-10 pt-3" ref={scrollAreaRef}>
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender === 'user' ? 'justify-start' : 'justify'
                          }`}
                        >
                          <div
                            className={`flex max-w-[80%] items-end space-x-2 ${
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
                </CardContent>
                <CardFooter className="m-4 rounded-full border pt-6 backdrop-blur-2xl">
                  <div className="flex w-full space-x-5">
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
                      className="flex-grow shadow-md"
                    />
                    <Button onClick={handleSend}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="tickets" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">My Support Tickets</h3>
                <Button onClick={startNewConversation}>
                  <Plus className="mr-2 h-1 w-2" /> New Ticket
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      onClick={() => handleTicketSelect(ticket.id)}
                      className="cursor-pointer"
                    >
                      <TableCell>{formatTicketNumber(ticket.number)}</TableCell>
                      <TableCell>{ticket.subject}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            ticket.status === 'Open'
                              ? 'default'
                              : ticket.status === 'InProgress'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(ticket.updatedAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="faq" className="space-y-4">
              {/* FAQ content remains unchanged */}
            </TabsContent>
            <TabsContent value="contact" className="space-y-4">
              {/* Contact content remains unchanged */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
