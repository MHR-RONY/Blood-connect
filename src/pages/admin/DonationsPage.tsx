import React, { useState } from 'react';
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
  ArrowUpDown
} from 'lucide-react';

const DonationsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');

  // Mock data for donations
  const donations = [
    {
      id: 1,
      donorName: "Ahmed Rahman",
      email: "ahmed@email.com",
      amount: 5000,
      currency: "BDT",
      purpose: "Emergency Fund",
      paymentMethod: "bKash",
      status: "Completed",
      date: "2024-01-15",
      transactionId: "TXN123456789"
    },
    {
      id: 2,
      donorName: "Fatima Khan",
      email: "fatima@email.com", 
      amount: 2500,
      currency: "BDT",
      purpose: "Equipment Purchase",
      paymentMethod: "Nagad",
      status: "Completed",
      date: "2024-01-14",
      transactionId: "TXN123456790"
    },
    {
      id: 3,
      donorName: "Mohammad Ali",
      email: "mohammad@email.com",
      amount: 10000,
      currency: "BDT", 
      purpose: "General Donation",
      paymentMethod: "Bank Transfer",
      status: "Pending",
      date: "2024-01-13",
      transactionId: "TXN123456791"
    },
    {
      id: 4,
      donorName: "Rashida Begum",
      email: "rashida@email.com",
      amount: 1500,
      currency: "BDT",
      purpose: "Blood Drive Campaign",
      paymentMethod: "Card",
      status: "Completed",
      date: "2024-01-12",
      transactionId: "TXN123456792"
    },
    {
      id: 5,
      donorName: "Karim Ahmed",
      email: "karim@email.com",
      amount: 7500,
      currency: "BDT",
      purpose: "Emergency Fund",
      paymentMethod: "Rocket",
      status: "Failed",
      date: "2024-01-11",
      transactionId: "TXN123456793"
    }
  ];

  const totalDonations = donations.reduce((sum, donation) => 
    donation.status === "Completed" ? sum + donation.amount : sum, 0
  );
  
  const completedDonations = donations.filter(d => d.status === "Completed").length;
  const averageDonation = completedDonations > 0 ? totalDonations / completedDonations : 0;

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'Failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || donation.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
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
            <div className="text-2xl font-bold">৳{totalDonations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-3 w-3" />
                +12.5% from last month
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
            <div className="text-2xl font-bold">{donations.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-3 w-3" />
                +8.1% from last month
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
            <div className="text-2xl font-bold">৳{Math.round(averageDonation).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per donation amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{Math.round(totalDonations * 0.4).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">January 2024 donations</p>
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
            <div className="space-y-4">
              {['Emergency Fund', 'Equipment Purchase', 'General Donation', 'Blood Drive Campaign'].map((purpose) => {
                const purposeDonations = donations.filter(d => d.purpose === purpose && d.status === 'Completed');
                const purposeAmount = purposeDonations.reduce((sum, d) => sum + d.amount, 0);
                const percentage = totalDonations > 0 ? (purposeAmount / totalDonations) * 100 : 0;
                
                return (
                  <div key={purpose} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{purpose}</span>
                      <span>৳{purposeAmount.toLocaleString()} ({percentage.toFixed(1)}%)</span>
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Popular payment methods used</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['bKash', 'Nagad', 'Bank Transfer', 'Card', 'Rocket'].map((method) => {
                const methodDonations = donations.filter(d => d.paymentMethod === method);
                const methodCount = methodDonations.length;
                const percentage = donations.length > 0 ? (methodCount / donations.length) * 100 : 0;
                
                return (
                  <div key={method} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{method}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{methodCount} donations</span>
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
            </div>
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
              {filteredDonations.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{donation.donorName}</div>
                      <div className="text-sm text-muted-foreground">{donation.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    ৳{donation.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>{donation.purpose}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{donation.paymentMethod}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(donation.status)}</TableCell>
                  <TableCell>{new Date(donation.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {donation.transactionId}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonationsPage;