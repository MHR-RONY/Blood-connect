
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
import { Package, AlertTriangle, Plus, Minus, Calendar } from 'lucide-react';

const InventoryPage = () => {
  const bloodInventory = [
    {
      bloodType: "O+",
      units: 45,
      expiryDates: ["2024-02-15", "2024-02-20", "2024-02-25"],
      status: "Good",
      lastUpdated: "2024-01-15"
    },
    {
      bloodType: "O-",
      units: 12,
      expiryDates: ["2024-02-18", "2024-02-22"],
      status: "Low",
      lastUpdated: "2024-01-14"
    },
    {
      bloodType: "A+",
      units: 38,
      expiryDates: ["2024-02-16", "2024-02-21", "2024-02-26"],
      status: "Good",
      lastUpdated: "2024-01-15"
    },
    {
      bloodType: "A-",
      units: 15,
      expiryDates: ["2024-02-17", "2024-02-23"],
      status: "Medium",
      lastUpdated: "2024-01-13"
    },
    {
      bloodType: "B+",
      units: 32,
      expiryDates: ["2024-02-19", "2024-02-24"],
      status: "Good",
      lastUpdated: "2024-01-15"
    },
    {
      bloodType: "B-",
      units: 5,
      expiryDates: ["2024-02-14"],
      status: "Critical",
      lastUpdated: "2024-01-12"
    },
    {
      bloodType: "AB+",
      units: 18,
      expiryDates: ["2024-02-20", "2024-02-25"],
      status: "Medium",
      lastUpdated: "2024-01-14"
    },
    {
      bloodType: "AB-",
      units: 3,
      expiryDates: ["2024-02-16"],
      status: "Critical",
      lastUpdated: "2024-01-11"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Good':
        return <Badge className="bg-green-100 text-green-800">Good Stock</Badge>;
      case 'Medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Stock</Badge>;
      case 'Low':
        return <Badge className="bg-orange-100 text-orange-800">Low Stock</Badge>;
      case 'Critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const totalUnits = bloodInventory.reduce((sum, item) => sum + item.units, 0);
  const criticalItems = bloodInventory.filter(item => item.status === 'Critical').length;
  const lowStockItems = bloodInventory.filter(item => item.status === 'Low' || item.status === 'Critical').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Blood Inventory</h1>
        <Button>
          <Package className="mr-2 h-4 w-4" />
          Add Stock
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnits}</div>
            <p className="text-xs text-muted-foreground">All blood types</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blood Types</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Available types</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalItems}</div>
            <p className="text-xs text-muted-foreground">Urgent restocking</p>
          </CardContent>
        </Card>
      </div>

      {/* Blood Type Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Blood Type Overview</CardTitle>
          <CardDescription>Current stock levels by blood type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bloodInventory.map((item) => (
              <div key={item.bloodType} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold text-red-600">{item.bloodType}</div>
                  {getStatusBadge(item.status)}
                </div>
                <div className="text-2xl font-bold">{item.units} units</div>
                <div className="text-sm text-muted-foreground">
                  Next expiry: {item.expiryDates[0]}
                </div>
                <div className="flex space-x-1">
                  <Button size="sm" variant="outline">
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Minus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Inventory</CardTitle>
          <CardDescription>Complete inventory information with expiry tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Blood Type</TableHead>
                <TableHead>Available Units</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Earliest Expiry</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bloodInventory.map((item) => (
                <TableRow key={item.bloodType}>
                  <TableCell>
                    <Badge variant="outline" className="bg-red-50 text-red-700 text-lg px-3 py-1">
                      {item.bloodType}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-lg">{item.units} units</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {item.expiryDates[0]}
                    </div>
                  </TableCell>
                  <TableCell>{item.lastUpdated}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                      <Button variant="outline" size="sm">
                        <Minus className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    </div>
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

export default InventoryPage;
