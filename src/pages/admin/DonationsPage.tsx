import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Search,
  Filter,
  Download,
  ArrowUpDown,
  Loader2
} from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { useToast } from '@/hooks/use-toast';
import { BloodDropLoader } from '@/components/BloodDropLoader';

interface Payment {
  _id: string;
  transactionId: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  amount: number;
  purpose: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  message?: string;
  isAnonymous: boolean;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  cardType?: string;
  paymentDetails?: {
    validationId?: string;
    bankTransactionId?: string;
    cardType?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PaymentSummary {
  totalAmount: number;
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
}

interface PaymentMethod {
  _id: string;
  count: number;
  totalAmount: number;
}

interface PurposeDistribution {
  _id: string;
  count: number;
  totalAmount: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const DonationsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [purposeDistribution, setPurposeDistribution] = useState<PurposeDistribution[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  // Fetch payments data
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on filter period
      let startDate;
      let endDate;
      
      if (filterPeriod !== 'all') {
        endDate = new Date().toISOString();
        const days = filterPeriod === '7d' ? 7 : filterPeriod === '30d' ? 30 : filterPeriod === '90d' ? 90 : 365;
        startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      }

      const params: {
        page: number;
        limit: number;
        status?: string;
        startDate?: string;
        endDate?: string;
      } = {
        page: currentPage,
        limit: 20
      };

      if (filterStatus !== 'all') {
        const statusMap: { [key: string]: string } = {
          'completed': 'SUCCESS',
          'pending': 'PENDING',
          'failed': 'FAILED',
          'cancelled': 'CANCELLED'
        };
        params.status = statusMap[filterStatus] || filterStatus.toUpperCase();
      }

      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await adminApi.getPayments(params);
      
      console.log('Admin payments response:', response);
      
      if (response.success) {
        console.log('Setting payments data:', {
          payments: response.data?.payments?.length,
          summary: response.data?.summary,
          paymentMethods: response.data?.paymentMethods?.length,
          purposeDistribution: response.data?.purposeDistribution?.length
        });
        
        setPayments(response.data?.payments || []);
        setSummary(response.data?.summary || null);
        setPaymentMethods(response.data?.paymentMethods || []);
        setPurposeDistribution(response.data?.purposeDistribution || []);
        setPagination(response.data?.pagination || null);
      } else {
        console.error('API response not successful:', response);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Failed to load payment data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus, filterPeriod, toast]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Filter payments based on search term
  const filteredPayments = payments.filter(payment => 
    payment.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.donorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'SUCCESS':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bd-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to get payment method display name
  const getPaymentMethodName = (cardType?: string) => {
    if (!cardType) return 'Unknown';
    
    const type = cardType.toLowerCase();
    
    // Handle specific SSLCommerz payment types
    if (type.includes('bkash')) return 'bKash';
    if (type.includes('nagad')) return 'Nagad';
    if (type.includes('rocket')) return 'Rocket';
    if (type.includes('dbbl') && type.includes('mobile')) return 'DBBL Mobile Banking';
    if (type.includes('mobile') && type.includes('bank')) return 'Mobile Banking';
    if (type.includes('visa')) return 'Visa Card';
    if (type.includes('master')) return 'Mastercard';
    if (type.includes('card')) return 'Credit/Debit Card';
    if (type.includes('bank')) return 'Bank Transfer';
    if (type.includes('upay')) return 'Upay';
    if (type.includes('sure')) return 'SureCash';
    
    // If no match found, return a cleaned version
    return cardType.split('-')[1] || cardType;
  };

  // Filter payments based on status
  const filteredDonations = filteredPayments.filter(payment => {
    if (filterStatus === 'all') return true;
    const statusMap: { [key: string]: string } = {
      'completed': 'SUCCESS',
      'pending': 'PENDING', 
      'failed': 'FAILED',
      'cancelled': 'CANCELLED'
    };
    return payment.status === statusMap[filterStatus];
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Donations Management</h1>
          <p className="text-muted-foreground">Track and manage monetary donations</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <BloodDropLoader size="sm" />
              ) : (
                formatCurrency(summary?.totalAmount || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-3 w-3" />
                From {loading ? <BloodDropLoader size="sm" /> : summary?.successfulPayments || 0} successful payments
              </span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <BloodDropLoader size="sm" /> : summary?.totalPayments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-3 w-3" />
                {loading ? <BloodDropLoader size="sm" /> : summary?.successfulPayments || 0} completed
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Donation</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <BloodDropLoader size="sm" />
              ) : (
                summary && summary.successfulPayments > 0 
                  ? formatCurrency(Math.round(summary.totalAmount / summary.successfulPayments))
                  : formatCurrency(0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">Per donation amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <BloodDropLoader size="sm" />
              ) : (
                formatCurrency(summary?.totalAmount || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? (
                <BloodDropLoader size="sm" />
              ) : (
                `${summary?.pendingPayments || 0} pending, ${summary?.failedPayments || 0} failed`
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Donation Purpose Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Donation Purposes</CardTitle>
            <CardDescription>Distribution of donations by purpose</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <BloodDropLoader size="md" text="Loading donation purposes..." />
              </div>
            ) : (
              <div className="space-y-4">
                {purposeDistribution.map((purpose) => {
                  const percentage = summary && summary.totalAmount > 0 
                    ? (purpose.totalAmount / summary.totalAmount) * 100 
                    : 0;
                  
                  return (
                    <div key={purpose._id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{purpose._id}</span>
                        <span>
                          {formatCurrency(purpose.totalAmount)} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {purposeDistribution.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No donation data available</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Popular payment methods used</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <BloodDropLoader size="md" text="Loading payment methods..." />
              </div>
            ) : (
              <div className="space-y-4">
                {paymentMethods.map((method) => {
                  const percentage = summary && summary.successfulPayments > 0 
                    ? (method.count / summary.successfulPayments) * 100 
                    : 0;
                  
                  return (
                    <div key={method._id} className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {getPaymentMethodName(method._id)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {method.count} donations
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {paymentMethods.length === 0 && (
                  <p className="text-sm text-muted-foreground">No payment method data available</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>All Donations</CardTitle>
          <CardDescription>Complete list of monetary donations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by donor name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" size="sm" className="p-0 h-auto font-medium">
                    Donor <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" className="p-0 h-auto font-medium">
                    Amount <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" className="p-0 h-auto font-medium">
                    Date <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Transaction ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <BloodDropLoader size="md" text="Loading donations..." />
                  </TableCell>
                </TableRow>
              ) : filteredDonations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <p className="text-muted-foreground">No donations found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDonations.map((donation) => (
                  <TableRow key={donation._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{donation.donorName}</div>
                        <div className="text-sm text-muted-foreground">{donation.donorEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(donation.amount)}
                    </TableCell>
                    <TableCell>{donation.purpose}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getPaymentMethodName(donation.cardType)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(donation.status)}</TableCell>
                    <TableCell>{formatDate(donation.createdAt)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {donation.transactionId}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                {pagination.totalItems} donations
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                  disabled={currentPage >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DonationsPage;