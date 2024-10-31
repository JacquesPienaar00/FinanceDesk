'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronUp,
  ChevronDown,
  Search,
  Eye,
  Download,
  ChevronRight,
  ChevronDown as ChevronDownIcon,
} from 'lucide-react';
import Image from 'next/image';

type FormSubmission = {
  _id: string;
  submittedAt: string;
  formType: string;
  nextauth: string;
  fileUrls?: Record<string, string>;
  [key: string]: any;
};

const formTypes = [
  { id: 'all', name: 'All Forms' },
  { id: 'cipc-annual-return-filing', name: 'CIPC Annual Return Filing' },
  {
    id: 'coida-workmens-compensation-registration',
    name: 'COIDA Workmens Compensation Registration',
  },
  {
    id: 'coida-workmens-compensation-return-of-earnings',
    name: 'COIDA Workmens Compensation Return of Earnings',
  },
  { id: 'bbbee-affidavits-eme-and-qse', name: 'BBBEE Affidavits EME and QSE' },
  { id: 'formation-of-trust', name: 'Formation of Trust' },
  { id: 'newly-registered-company-pty-ltd', name: 'Newly Registered Company (Pty) Ltd' },
  { id: 'change-of-company-name', name: 'Change of Company Name' },
  {
    id: 'department-of-social-development-registration',
    name: 'Department of Social Development Registration',
  },
  { id: 'csd-profile-registration', name: 'CSD Profile Registration' },
  { id: 'formation-of-incorporation', name: 'Formation of Incorporation' },
  { id: 'change-of-registered-address', name: 'Change of Registered Address' },
  { id: 'cipc-incorporation-documents-post-2012', name: 'CIPC Incorporation Documents Post 2012' },
  { id: 'change-of-directors-or-members', name: 'Change of Directors or Members' },
  { id: 'sars-notice-of-objection-appeal', name: 'SARS Notice of Objection Appeal' },
  { id: 'sars-company-cc-trust-tax-returns', name: 'SARS Company CC Trust Tax Returns' },
  { id: 'department-of-labour-uif-registration', name: 'Department of Labour UIF Registration' },
  { id: 'sars-paye-sdl-registration', name: 'SARS PAYE SDL Registration' },
  {
    id: 'sars-non-profit-organization-income-tax-exemption',
    name: 'SARS Non-Profit Organization Income Tax Exemption',
  },
  { id: 'efiling-profile-registration', name: 'eFiling Profile Registration' },
  { id: 'vat-registration', name: 'VAT Registration' },
  { id: 'sars-customs-registration', name: 'SARS Customs Registration' },
  { id: 'sars-registered-representative', name: 'SARS Registered Representative' },
  { id: 'sars-personal-income-tax-returns', name: 'SARS Personal Income Tax Returns' },
  { id: 'management-accounts', name: 'Management Accounts' },
  { id: 'annual-financial-statements', name: 'Annual Financial Statements' },
];

const formatValue = (value: any): string => {
  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return value.map((item) => formatValue(item)).join(', ');
    } else {
      return Object.keys(value)
        .map((key) => `${key}: ${formatValue(value[key])}`)
        .join(', ');
    }
  }
  return String(value);
};

const isImageFile = (url: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  return imageExtensions.some((ext) => url.toLowerCase().endsWith(ext));
};

export function FormSubmissionsView() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedFormType, setSelectedFormType] = useState<string>('all');
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewingFile, setViewingFile] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
      router.push('/auth');
    } else if (status === 'authenticated') {
      fetchSubmissions(selectedFormType);
    }
  }, [status, session, router, selectedFormType]);

  const fetchSubmissions = async (formType: string) => {
    try {
      let allSubmissions: FormSubmission[] = [];

      if (formType === 'all') {
        for (const type of formTypes) {
          if (type.id !== 'all') {
            const response = await fetch(`/api/admin/submissions?formType=${type.id}`);
            if (response.ok) {
              const data = await response.json();
              allSubmissions = [
                ...allSubmissions,
                ...data.map((item: any) => ({ ...item, formType: type.id })),
              ];
            }
          }
        }
      } else {
        const response = await fetch(`/api/admin/submissions?formType=${formType}`);
        if (response.ok) {
          const data = await response.json();
          allSubmissions = data.map((item: any) => ({ ...item, formType }));
        }
      }

      setSubmissions(allSubmissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleViewDetails = (submission: FormSubmission) => {
    setSelectedSubmission(submission);
  };

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const groupedSubmissions = useMemo(() => {
    const grouped = submissions
      .filter(
        (submission) =>
          (selectedFormType === 'all' || submission.formType === selectedFormType) &&
          Object.values(submission).some(
            (value) =>
              typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      )
      .reduce(
        (acc, submission) => {
          if (!acc[submission.nextauth]) {
            acc[submission.nextauth] = [];
          }
          acc[submission.nextauth].push(submission);
          return acc;
        },
        {} as Record<string, FormSubmission[]>,
      );

    Object.keys(grouped).forEach((nextauth) => {
      grouped[nextauth].sort((a, b) => {
        const dateA = new Date(a.submittedAt).getTime();
        const dateB = new Date(b.submittedAt).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      });
    });

    // Sort users by their latest submission
    const sortedUsers = Object.entries(grouped).sort(([, submissionsA], [, submissionsB]) => {
      const latestA = new Date(submissionsA[0].submittedAt).getTime();
      const latestB = new Date(submissionsB[0].submittedAt).getTime();
      return sortDirection === 'asc' ? latestA - latestB : latestB - latestA;
    });

    return Object.fromEntries(sortedUsers);
  }, [submissions, selectedFormType, sortDirection, searchTerm]);

  const getCommonFields = (submissions: FormSubmission[]): string[] => {
    if (submissions.length === 0) return [];
    const fields = Object.keys(submissions[0]);
    return fields.filter(
      (field) =>
        field !== 'fileUrls' &&
        field !== '_id' &&
        field !== 'formType' &&
        field !== 'nextauth' &&
        submissions.every((submission) => submission.hasOwnProperty(field)),
    );
  };

  const commonFields = useMemo(() => getCommonFields(submissions), [submissions]);

  const handleViewFile = (url: string) => {
    setViewingFile(url);
    setImageError(null);
  };

  const handleDownloadFile = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    console.error('Image load error:', e);
    setImageError(
      `Failed to load image: ${target.src}. Please check the console for more details.`,
    );
  };

  const toggleUserExpanded = (nextauth: string) => {
    setExpandedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nextauth)) {
        newSet.delete(nextauth);
      } else {
        newSet.add(nextauth);
      }
      return newSet;
    });
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="h-full overflow-hidden">
      <h1 className="mb-4 text-2xl font-bold">Form Submissions</h1>

      <div className="mb-4 md:hidden">
        <Select
          value={selectedFormType}
          onValueChange={(value) => {
            setSelectedFormType(value);
            fetchSubmissions(value);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select form type" />
          </SelectTrigger>
          <SelectContent>
            {formTypes.map((formType) => (
              <SelectItem key={formType.id} value={formType.id}>
                {formType.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="hidden md:block">
        <Tabs
          defaultValue="all"
          onValueChange={(value) => {
            setSelectedFormType(value);
            fetchSubmissions(value);
          }}
        >
          <ScrollArea className="w-full whitespace-nowrap">
            <TabsList className="mb-4 inline-flex">
              {formTypes.map((formType) => (
                <TabsTrigger key={formType.id} value={formType.id} className="inline-flex">
                  {formType.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Tabs>
      </div>

      <Card>
        <CardContent className="h-[85vh] pt-6">
          <div className="mb-4 flex flex-col items-start justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
            <div className="flex w-full items-center md:w-auto">
              <Input
                placeholder="Search submissions"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mr-2 max-w-sm"
              />
              <Search className="text-gray-400" />
            </div>
            <Button onClick={toggleSortDirection} variant="outline" className="w-full md:w-auto">
              Sort by Date{' '}
              {sortDirection === 'asc' ? (
                <ChevronUp className="ml-2" />
              ) : (
                <ChevronDown className="ml-2" />
              )}
            </Button>
          </div>
          <ScrollArea className="h-[600px]">
            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">NextAuth Email</TableHead>
                    <TableHead>Latest Submission</TableHead>
                    <TableHead>Total Submissions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(groupedSubmissions).map(([nextauth, userSubmissions]) => (
                    <React.Fragment key={nextauth}>
                      <TableRow>
                        <TableCell>
                          <Button
                            variant="ghost"
                            onClick={() => toggleUserExpanded(nextauth)}
                            className="p-0"
                          >
                            {expandedUsers.has(nextauth) ? (
                              <ChevronDownIcon className="mr-2" />
                            ) : (
                              <ChevronRight className="mr-2" />
                            )}
                            {nextauth}
                          </Button>
                        </TableCell>
                        <TableCell>
                          {new Date(userSubmissions[0].submittedAt).toLocaleString()}
                        </TableCell>
                        <TableCell>{userSubmissions.length}</TableCell>
                      </TableRow>
                      {expandedUsers.has(nextauth) && (
                        <TableRow>
                          <TableCell colSpan={3} className="p-0">
                            <div className="max-h-[300px] overflow-auto">
                              <ScrollArea className="w-full">
                                <div className="min-w-[800px]">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        {commonFields.map((field) => (
                                          <TableHead key={field} className="min-w-[150px]">
                                            {field}
                                          </TableHead>
                                        ))}
                                        <TableHead className="min-w-[100px]">Actions</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {userSubmissions.map((submission) => (
                                        <TableRow key={submission._id}>
                                          {commonFields.map((field) => (
                                            <TableCell
                                              key={field}
                                              className="max-w-[300px] truncate"
                                            >
                                              {formatValue(submission[field]) || 'N/A'}
                                            </TableCell>
                                          ))}
                                          <TableCell>
                                            <Dialog>
                                              <DialogTrigger asChild>
                                                <Button
                                                  onClick={() => handleViewDetails(submission)}
                                                >
                                                  View Details
                                                </Button>
                                              </DialogTrigger>
                                              <DialogContent className="max-h-[90vh] w-full max-w-4xl">
                                                <DialogHeader>
                                                  <DialogTitle className="mb-4 text-2xl">
                                                    Submission Details
                                                  </DialogTitle>
                                                </DialogHeader>
                                                <ScrollArea className="h-[calc(90vh-100px)] pr-4">
                                                  <Table>
                                                    <TableHeader>
                                                      <TableRow>
                                                        <TableHead>Field</TableHead>
                                                        <TableHead>Value</TableHead>
                                                      </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                      {selectedSubmission &&
                                                        Object.entries(selectedSubmission).map(
                                                          ([key, value]) => (
                                                            <TableRow key={key}>
                                                              <TableCell className="font-medium">
                                                                {key}
                                                              </TableCell>
                                                              <TableCell>
                                                                {key === 'fileUrls' &&
                                                                typeof value === 'object' ? (
                                                                  <div className="space-y-2">
                                                                    {Object.entries(
                                                                      value as Record<
                                                                        string,
                                                                        string
                                                                      >,
                                                                    ).map(([fileName, url]) => (
                                                                      <div
                                                                        key={fileName}
                                                                        className="flex items-center space-x-2"
                                                                      >
                                                                        <span>{fileName}</span>
                                                                        {isImageFile(url) && (
                                                                          <Button
                                                                            onClick={() =>
                                                                              handleViewFile(url)
                                                                            }
                                                                            size="sm"
                                                                          >
                                                                            <Eye className="mr-2 h-4 w-4" />
                                                                            View
                                                                          </Button>
                                                                        )}
                                                                        <Button
                                                                          onClick={() =>
                                                                            handleDownloadFile(
                                                                              url,
                                                                              fileName,
                                                                            )
                                                                          }
                                                                          size="sm"
                                                                        >
                                                                          <Download className="mr-2 h-4 w-4" />
                                                                          Download
                                                                        </Button>
                                                                      </div>
                                                                    ))}
                                                                  </div>
                                                                ) : (
                                                                  <pre className="whitespace-pre-wrap break-words text-sm">
                                                                    {formatValue(value)}
                                                                  </pre>
                                                                )}
                                                              </TableCell>
                                                            </TableRow>
                                                          ),
                                                        )}
                                                    </TableBody>
                                                  </Table>
                                                </ScrollArea>
                                              </DialogContent>
                                            </Dialog>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                                <ScrollBar orientation="horizontal" />
                              </ScrollArea>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </CardContent>
      </Card>

      {viewingFile && (
        <Dialog
          open={!!viewingFile}
          onOpenChange={() => {
            setViewingFile(null);
            setImageError(null);
          }}
        >
          <DialogContent className="max-h-[90vh] w-full max-w-4xl">
            <DialogHeader>
              <DialogTitle className="mb-4 text-2xl">File Preview</DialogTitle>
            </DialogHeader>
            <div className="relative h-[60vh] w-full">
              {imageError ? (
                <div className="flex h-full w-full items-center justify-center text-red-500">
                  {imageError}
                </div>
              ) : (
                <Image
                  src={viewingFile}
                  alt="File preview"
                  fill
                  style={{ objectFit: 'contain' }}
                  onError={handleImageError}
                  unoptimized
                />
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Image URL: {viewingFile}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
