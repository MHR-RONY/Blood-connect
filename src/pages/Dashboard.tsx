import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Award, 
  Bell, 
  User, 
  Activity,
  Droplets,
  Clock,
  Users,
  TrendingUp
} from "lucide-react";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock user data
  const userData = {
    name: "Alex Johnson",
    bloodType: "O+",
    lastDonation: "2024-01-15",
    nextEligible: "2024-03-15",
    totalDonations: 12,
    livesImpacted: 36,
    points: 1200,
    level: "Gold Donor"
  };

  const recentDonations = [
    { date: "2024-01-15", location: "City Hospital", status: "Completed", points: 100 },
    { date: "2023-11-10", location: "Community Center", status: "Completed", points: 100 },
    { date: "2023-09-05", location: "Blood Drive Mobile", status: "Completed", points: 100 },
  ];

  const nearbyRequests = [
    {
      id: 1,
      bloodType: "O+",
      urgency: "High",
      location: "Central Hospital",
      distance: "2.3 km",
      timePosted: "2 hours ago",
      patient: "Emergency Surgery"
    },
    {
      id: 2,
      bloodType: "O-",
      urgency: "Critical",
      location: "Children's Hospital",
      distance: "5.1 km",
      timePosted: "30 minutes ago",
      patient: "Pediatric Emergency"
    },
    {
      id: 3,
      bloodType: "A+",
      urgency: "Medium",
      location: "St. Mary's Hospital",
      distance: "8.7 km",
      timePosted: "1 day ago",
      patient: "Scheduled Surgery"
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "Critical": return "destructive";
      case "High": return "emergency";
      case "Medium": return "secondary";
      default: return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-medical/20">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {userData.name}!
          </h1>
          <p className="text-muted-foreground">
            Thank you for being a lifesaver. Your contributions make a real difference.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="donations">My Donations</TabsTrigger>
            <TabsTrigger value="requests">Blood Requests</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
                  <Droplets className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userData.totalDonations}</div>
                  <p className="text-xs text-muted-foreground">
                    +2 from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lives Impacted</CardTitle>
                  <Droplets className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userData.livesImpacted}</div>
                  <p className="text-xs text-muted-foreground">
                    Each donation helps 3 people
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Donor Points</CardTitle>
                  <Award className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userData.points}</div>
                  <p className="text-xs text-muted-foreground">
                    {userData.level} status
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Next Donation</CardTitle>
                  <Calendar className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">15 days</div>
                  <p className="text-xs text-muted-foreground">
                    Until eligible again
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Progress to Next Level */}
            <Card>
              <CardHeader>
                <CardTitle>Progress to Next Level</CardTitle>
                <CardDescription>
                  Donate 3 more times to reach Platinum Donor status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current: Gold Donor</span>
                    <span>Next: Platinum Donor</span>
                  </div>
                  <Progress value={80} className="h-3" />
                  <p className="text-xs text-muted-foreground">
                    12 of 15 donations completed for Platinum status
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Nearby Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Urgent Blood Requests Near You</CardTitle>
                <CardDescription>
                  Help save lives in your community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {nearbyRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="font-semibold">
                            {request.bloodType}
                          </Badge>
                          <Badge variant={getUrgencyColor(request.urgency) as any}>
                            {request.urgency}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {request.location} • {request.distance} • {request.timePosted}
                        </div>
                        <div className="text-sm font-medium">{request.patient}</div>
                      </div>
                      <Button size="sm" variant={request.urgency === "Critical" ? "emergency" : "default"}>
                        Respond
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Donation History</CardTitle>
                <CardDescription>
                  Your complete donation record and upcoming eligibility
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentDonations.map((donation, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="bg-success/10 p-2 rounded-full">
                          <Droplets className="h-4 w-4 text-success" />
                        </div>
                        <div>
                          <div className="font-medium">{donation.date}</div>
                          <div className="text-sm text-muted-foreground">{donation.location}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">{donation.status}</Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          +{donation.points} points
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Blood Requests</CardTitle>
                <CardDescription>
                  Current blood needs in your area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {nearbyRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="font-semibold">
                            {request.bloodType}
                          </Badge>
                          <Badge variant={getUrgencyColor(request.urgency) as any}>
                            {request.urgency}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {request.location} • {request.distance} • {request.timePosted}
                        </div>
                        <div className="text-sm font-medium">{request.patient}</div>
                      </div>
                      <Button size="sm" variant={request.urgency === "Critical" ? "emergency" : "default"}>
                        Respond
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Donor Badges</CardTitle>
                  <CardDescription>Your achievements and milestones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border border-border rounded-lg">
                      <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                      <div className="font-semibold text-sm">First Donation</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div className="text-center p-4 border border-border rounded-lg">
                      <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                      <div className="font-semibold text-sm">5 Lives Saved</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div className="text-center p-4 border border-border rounded-lg">
                      <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                      <div className="font-semibold text-sm">Regular Donor</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div className="text-center p-4 border border-muted rounded-lg opacity-50">
                      <Droplets className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <div className="font-semibold text-sm">20 Donations</div>
                      <div className="text-xs text-muted-foreground">8 more needed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Impact Summary</CardTitle>
                  <CardDescription>The difference you've made</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Emergency surgeries supported</span>
                      <span className="font-semibold">8</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cancer patients helped</span>
                      <span className="font-semibold">15</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Accident victims assisted</span>
                      <span className="font-semibold">13</span>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-lg font-semibold">
                        <span>Total lives impacted</span>
                        <span className="text-primary">{userData.livesImpacted}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;