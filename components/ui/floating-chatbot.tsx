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
import { MessageCircle, X, User, Bot, Ticket, Send, CheckCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

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
  status: string;
  createdAt: string;
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

export default function FloatingChatbot() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isHumanRequested, setIsHumanRequested] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showClosedMessage, setShowClosedMessage] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen, status, session]);

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

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
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

  const handleTicketSelect = (ticketNumber: string) => {
    const ticket = tickets.find((t) => t.number === ticketNumber);
    if (ticket) {
      setSelectedTicket(ticket);
      setMessages(ticket.messages);
    }
  };

  const checkAndCreateNewTicket = async () => {
    if (!selectedTicket || selectedTicket.status === 'Closed') {
      await startNewConversation();
    }
  };

  useEffect(() => {
    if (selectedTicket && selectedTicket.status === 'Closed') {
      checkAndCreateNewTicket();
    }
  }, [selectedTicket]);

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-20 right-4 flex h-[70vh] w-96 scale-100 transform flex-col overflow-hidden rounded-lg border bg-background opacity-100 shadow-lg transition-all duration-300 ease-in-out">
          <div className="flex w-full items-center justify-between border-b bg-background p-4">
            <h2 className="text-lg font-semibold">Support</h2>
            {selectedTicket && (
              <div className="flex items-center space-x-2">
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
            <Button variant="ghost" size="icon" onClick={toggleChatbot}>
              <X className="h-4 w-4" />
            </Button>
          </div>
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="tickets">Tickets</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="flex flex-grow flex-col overflow-hidden">
              <ScrollArea className="h-[45vh]" ref={scrollAreaRef}>
                <div className="flex flex-col space-y-4 p-4">
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
              <div className="border-t bg-background p-4">
                {!session && !userInfo ? (
                  <form onSubmit={handleUserInfoSubmit} className="space-y-2">
                    <Input name="name" placeholder="Your Name" required />
                    <Input name="email" type="email" placeholder="Your Email" required />
                    <Button type="submit" className="w-full">
                      Submit
                    </Button>
                  </form>
                ) : (
                  <>
                    <div className="mb-2 flex">
                      <Input
                        type="text"
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => {
                          if  (e.key === 'Enter') {
                            e.preventDefault();
                            checkAndCreateNewTicket().then(() => handleSend());
                          }
                        }}
                        className="mr-2 flex-grow"
                      />
                      <Button onClick={() => checkAndCreateNewTicket().then(() => handleSend())}>
                        <Send className="h-4 w-4" />
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
                  </>
                )}
              </div>
            </TabsContent>
            <TabsContent value="tickets" className="flex flex-col">
              <div className="border-b p-4">
                <Select onValueChange={handleTicketSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a ticket" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea>
                      {tickets.map((ticket) => (
                        <SelectItem key={ticket.number} value={ticket.number}>
                          #{formatTicketNumber(ticket.number)} - {ticket.status}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>

              {selectedTicket && (
                <div className="border-t bg-background p-4">
                  <h3 className="font-semibold">
                    Selected Ticket: #{formatTicketNumber(selectedTicket.number)}
                  </h3>
                  <ScrollArea className="h-[45vh]">
                    <div className="space-y-2">
                      {selectedTicket.messages.map((message, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-semibold">{message.sender}: </span>
                          {message.text}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </TabsContent>
            <TabsContent value="faq" className="overflow-auto">
              <ScrollArea className="h-full">
                <div className="space-y-4 p-4">
                  <h3 className="font-semibold">How do I reset my password?</h3>
                  <p>
                    You can reset your password by clicking on the "Forgot Password" link on the
                    login page.
                  </p>
                  <h3 className="font-semibold">What are your business hours?</h3>
                  <p>Our customer support is available Monday to Friday, 9 AM to 5 PM EST.</p>
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="contact" className="overflow-auto">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <form className="space-y-4">
                    <Input placeholder="Your Name" />
                    <Input type="email" placeholder="Your Email" />
                    <textarea
                      className="w-full rounded-md border p-2"
                      rows={4}
                      placeholder="Your Message"
                    ></textarea>
                    <Button type="submit" className="w-full">
                      Send Message
                    </Button>
                  </form>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      )}

      <Button
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg"
        onClick={toggleChatbot}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </>
  );
}