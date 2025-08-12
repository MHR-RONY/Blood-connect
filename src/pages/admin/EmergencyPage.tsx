
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, Clock, Phone, MapPin, Send, Package } from 'lucide-react';

const EmergencyPage = () => {
  const emergencyRequests = [
    {
      id: 1,
      hospital: "Dhaka Medical College",
      patientName: "Critical Patient #1",
      bloodType: "O-",
      unitsNeeded: 4,
      timeRemaining: "2 hours",
      priority: "Critical",
      contact: "+880 1234567890",
      location: "Dhaka",
      description: "Severe accident case requiring immediate blood transfusion"
    },
    {
      id: 2,
      hospital: "Square Hospital",
      patientName: "Emergency Case #2",
      bloodType: "AB+",
      unitsNeeded: 2,
      timeRemaining: "4 hours",
      priority: "High",
      contact: "+880 1234567891",
      location: "Dhaka",
      description: "Surgery complications requiring blood"
    },
    {
      id: 3,
      hospital: "BIRDEM Hospital",
      patientName: "Urgent Case #3",
      bloodType: "B-",
      unitsNeeded: 3,
      timeRemaining: "6 hours",
      priority: "High",
      contact: "+880 1234567892",
      location: "Dhaka",
      description: "Emergency surgery patient"
    }
  ];

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'Critical':
        return <Badge variant="destructive" className="animate-pulse">
          <AlertTriangle className="w-3 h-3 mr-1" />Critical
        </Badge>;
      case 'High':
        return <Badge className="bg-orange-100 text-orange-800">
          <AlertTriangle className="w-3 h-3 mr-1" />High
        </Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold">Emergency Management</h1>
        </div>
        <Button variant="destructive">
          <Send className="mr-2 h-4 w-4" />
          Send Alert
        </Button>
      </div>

      {/* Emergency Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Emergencies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{emergencyRequests.length}</div>
            <p className="text-xs text-muted-foreground">Requiring immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Cases</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">1</div>
            <p className="text-xs text-muted-foreground">Less than 3 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Units Needed</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9</div>
            <p className="text-xs text-muted-foreground">Total units required</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15 min</div>
            <p className="text-xs text-muted-foreground">Average response</p>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Alerts */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Critical Emergency Alert
          </CardTitle>
          <CardDescription className="text-red-700">
            Immediate action required for critical blood shortage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-red-800 font-medium">
              O- Blood type critically low - Only 2 units available
            </p>
            <p className="text-red-700">
              Current emergency requires 4 units. Immediate donor mobilization needed.
            </p>
            <div className="flex space-x-2 mt-4">
              <Button variant="destructive" size="sm">
                Send Emergency Alert
              </Button>
              <Button variant="outline" size="sm">
                Contact Donors
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Emergency Requests</CardTitle>
          <CardDescription>All current emergency blood requests requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Priority</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Blood Type</TableHead>
                <TableHead>Units Needed</TableHead>
                <TableHead>Time Left</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emergencyRequests.map((request) => (
                <TableRow key={request.id} className={request.priority === 'Critical' ? 'bg-red-50' : ''}>
                  <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                  <TableCell className="font-medium">{request.hospital}</TableCell>
                  <TableCell>{request.patientName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      {request.bloodType}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold">{request.unitsNeeded} units</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-red-600 font-medium">
                      <Clock className="h-3 w-3" />
                      {request.timeRemaining}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {request.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="destructive">
                        Alert Donors
                      </Button>
                      <Button size="sm" variant="outline">
                        Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Actions</CardTitle>
          <CardDescription>Quick actions for emergency management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="destructive" className="h-20 flex flex-col gap-2">
              <AlertTriangle className="h-6 w-6" />
              Mass Alert
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Phone className="h-6 w-6" />
              Call Donors
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Send className="h-6 w-6" />
              SMS Alert
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <MapPin className="h-6 w-6" />
              Find Nearby
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyPage;
