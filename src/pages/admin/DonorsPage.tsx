
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Heart, Search, Calendar, MapPin } from 'lucide-react';

const DonorsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const donors = [
    {
      id: 1,
      name: "John Doe",
      bloodType: "O+",
      location: "Dhaka",
      lastDonation: "2024-01-15",
      totalDonations: 5,
      status: "Available",
      phone: "+880 1234567890"
    },
    {
      id: 2,
      name: "Jane Smith",
      bloodType: "A+",
      location: "Chittagong",
      lastDonation: "2024-02-10",
      totalDonations: 3,
      status: "Available",
      phone: "+880 1234567891"
    },
    {
      id: 3,
      name: "Mike Johnson",
      bloodType: "B+",
      location: "Sylhet",
      lastDonation: "2024-01-25",
      totalDonations: 8,
      status: "Unavailable",
      phone: "+880 1234567892"
    }
  ];

  const bloodTypeStats = [
    { type: "O+", count: 45 },
    { type: "O-", count: 12 },
    { type: "A+", count: 38 },
    { type: "A-", count: 15 },
    { type: "B+", count: 32 },
    { type: "B-", count: 8 },
    { type: "AB+", count: 18 },
    { type: "AB-", count: 5 }
  ];

  const filteredDonors = donors.filter(donor =>
    donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donor.bloodType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donor.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    return status === 'Available' ? 
      <Badge className="bg-green-100 text-green-800">Available</Badge> : 
      <Badge variant="secondary">Unavailable</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Donor Management</h1>
        <Button>
          <Heart className="mr-2 h-4 w-4" />
          Send Donation Request
        </Button>
      </div>

      {/* Blood Type Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Blood Type Distribution</CardTitle>
          <CardDescription>Available donors by blood type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {bloodTypeStats.map((stat) => (
              <div key={stat.type} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stat.type}</div>
                <div className="text-sm text-muted-foreground">{stat.count} donors</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Donors</CardTitle>
          <CardDescription>Manage registered blood donors</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search donors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Blood Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Last Donation</TableHead>
                <TableHead>Total Donations</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDonors.map((donor) => (
                <TableRow key={donor.id}>
                  <TableCell className="font-medium">{donor.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      {donor.bloodType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {donor.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {donor.lastDonation}
                    </div>
                  </TableCell>
                  <TableCell>{donor.totalDonations}</TableCell>
                  <TableCell>{getStatusBadge(donor.status)}</TableCell>
                  <TableCell>{donor.phone}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Contact
                    </Button>
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

export default DonorsPage;
