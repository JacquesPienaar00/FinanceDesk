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
  text: string;
  sender: 'user' | 'bot' | 'human';
  timestamp: string;
}

interface UserInfo {
  name: string;
  email: string;
}

interface Ticket {
  number: string;
  subject: string;
  status: string;
  lastUpdated: string;
  messages: Message[];
}

function formatTicketNumber(number: string) {
  const shortNumber = number.slice(-6);
  return shortNumber.toUpperCase();
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'open':
      return 'bg-green-100 text-green-800';
    case 'in progress':
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
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isHumanRequested, setIsHumanRequested] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setUserInfo({
        name: session.user.name || '',
        email: session.user.email || '',
      });
      fetchTickets();
    } else if (status === 'unauthenticated') {
      setMessages([
        {
          text: 'Welcome! Please provide your name and email to start chatting.',
          sender: 'bot',
          timestamp: new Date().toISOString(),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchTickets = async () => {
    try {
      const response = await fetch(
        `/api/chatbot/tickets?userId=${session?.user?.email || userInfo?.email}`,
      );
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets);
        if (data.tickets.length > 0) {
          const latestTicket = data.tickets[data.tickets.length - 1];
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

  const handleSend = async () => {
    if (input.trim() === '') return;

    if (!session && !userInfo) {
      setMessages((prev) => [
        ...prev,
        {
          text: 'Before we continue, could you please provide your name and email?',
          sender: 'bot',
          timestamp: new Date().toISOString(),
        },
      ]);
      return;
    }

    const userMessage: Message = {
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('/api/chatbot/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: input,
          sender: 'user',
          userInfo: session?.user || userInfo,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.tickets && data.tickets.length > 0) {
          const latestTicket = data.tickets[data.tickets.length - 1];
          setSelectedTicket(latestTicket);
          setMessages(latestTicket.messages);
          setTickets(data.tickets);

          if (!selectedTicket || latestTicket.number !== selectedTicket.number) {
            setMessages((prev) => [
              ...prev,
              {
                text: `A new support ticket has been created with number ${formatTicketNumber(latestTicket.number)}. How can we assist you today?`,
                sender: 'bot',
                timestamp: new Date().toISOString(),
              },
            ]);
          }
        }
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }

    let botMessage: Message;
    if (isHumanRequested) {
      botMessage = {
        text: 'A human agent will be with you shortly. Please wait.',
        sender: 'human',
        timestamp: new Date().toISOString(),
      };
    } else {
      botMessage = {
        text: 'Thank you for your message. How else can I assist you?',
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
    }
    setMessages((prev) => [...prev, botMessage]);
  };

  const handleUserInfoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    if (name && email) {
      setUserInfo({ name, email });
      const welcomeMessage: Message = {
        text: `Thank you, ${name}. How can I assist you today?`,
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, welcomeMessage]);
      fetchTickets();
    }
  };

  const handleTicketSelect = (ticketNumber: string) => {
    const ticket = tickets.find((t) => t.number === ticketNumber);
    if (ticket) {
      setSelectedTicket(ticket);
      setMessages(ticket.messages);
      setActiveTab('chat');
    }
  };

  const startNewConversation = async () => {
    try {
      const response = await fetch('/api/chatbot/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'Start new conversation',
          sender: 'system',
          userInfo: session?.user || userInfo,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.tickets && data.tickets.length > 0) {
          const latestTicket = data.tickets[data.tickets.length - 1];
          setSelectedTicket(latestTicket);
          setTickets(data.tickets);
          setMessages([
            {
              text: `A new support ticket has been created with number ${formatTicketNumber(latestTicket.number)}. How can I assist you today?`,
              sender: 'bot',
              timestamp: new Date().toISOString(),
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
    const botMessage: Message = {
      text: "I'm connecting you with a human agent. Please wait a moment.",
      sender: 'bot',
      timestamp: new Date().toISOString(),
    };
    const humanMessage: Message = {
      text: "Hello! I'm a human agent. How can I assist you today?",
      sender: 'human',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, botMessage, humanMessage]);
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
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(selectedTicket.status)}`}
                        >
                          {selectedTicket.status}
                        </span>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="-mb-10 h-[500px] pl-10 pr-10 pt-3" ref={scrollAreaRef}>
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <div
                          key={index}
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
                </CardContent>
                <CardFooter className="m-4 rounded-full border pt-6 backdrop-blur-2xl">
                  {!session && !userInfo ? (
                    <form onSubmit={handleUserInfoSubmit} className="w-full space-y-2">
                      <Input name="name" placeholder="Your Name" required />
                      <Input name="email" type="email" placeholder="Your Email" required />
                      <Button type="submit" className="w-full">
                        Start Chat
                      </Button>
                    </form>
                  ) : (
                    <>
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
                    </>
                  )}
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
                      key={ticket.number}
                      onClick={() => handleTicketSelect(ticket.number)}
                      className="cursor-pointer"
                    >
                      <TableCell>{formatTicketNumber(ticket.number)}</TableCell>
                      <TableCell>{ticket.subject}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            ticket.status === 'Open'
                              ? 'default'
                              : ticket.status === 'In Progress'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{ticket.lastUpdated}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="faq" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
                <details className="rounded-lg border p-4">
                  <summary className="cursor-pointer font-medium">
                    How do I file an annual return?
                  </summary>
                  <p className="mt-2 text-sm text-muted-foreground">
                    To file an annual return, navigate to the Services section and select &quot;CIPC
                    Annual Return Filing&quot;. Follow the prompts to complete and submit your
                    return.
                  </p>
                </details>
                <details className="rounded-lg border p-4">
                  <summary className="cursor-pointer font-medium">
                    What is a BBBEE Affidavit?
                  </summary>
                  <p className="mt-2 text-sm text-muted-foreground">
                    A BBBEE Affidavit is a sworn statement that confirms your business&apos;s Black
                    Economic Empowerment status. You can request this document through our
                    &quot;BBBEE Affidavits (EME and QSE)&quot; service.
                  </p>
                </details>
                <details className="rounded-lg border p-4">
                  <summary className="cursor-pointer font-medium">
                    How can I change my company name?
                  </summary>
                  <p className="mt-2 text-sm text-muted-foreground">
                    To change your company name, use our &quot;Change of Company Name&quot; service.
                    This will guide you through the process of submitting a name change request to
                    CIPC.
                  </p>
                </details>
              </div>
            </TabsContent>
            <TabsContent value="contact" className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Us</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Chat Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Chat with our support team in real-time.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => setActiveTab('chat')}>
                      Start Chat
                    </Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Phone className="mr-2 h-4 w-4" />
                      Phone Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Call us for immediate assistance.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Call Now</Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Help Center
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Browse our knowledge base for answers.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Visit Help Center</Button>
                  </CardFooter>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Send us a message</CardTitle>
                  <CardDescription>We&apos;ll get back to you as soon as possible.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Name
                        </label>
                        <Input id="name" placeholder="Your name" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email
                        </label>
                        <Input id="email" type="email" placeholder="Your email" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">
                        Subject
                      </label>
                      <Input id="subject" placeholder="Message subject" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Message
                      </label>
                      <Textarea id="message" placeholder="Your message" rows={4} />
                    </div>
                  </form>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Send Message</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
