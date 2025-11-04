"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  FileText,
  Clock,
  Star,
  FolderOpen,
  TrendingUp,
  Users,
} from "lucide-react";

export default function Page() {
  return (
    <div className="mx-auto space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome to PO Contracts
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your purchase order contracts efficiently
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Contract
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search contracts, suppliers, or terms..."
            className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Create Contract
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Start a new PO contract
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <FolderOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Browse Templates
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use contract templates
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Analytics
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View contract insights
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Team Access
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage permissions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Contracts */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Recent Contracts</span>
              </CardTitle>
              <CardDescription>
                Your recently accessed purchase order contracts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  title: "Q4 2024 Office Supplies Contract",
                  supplier: "Office Depot Inc.",
                  status: "Active",
                  lastModified: "2 hours ago",
                  amount: "$45,000",
                },
                {
                  title: "Software License Renewal",
                  supplier: "Microsoft Corporation",
                  status: "Pending",
                  lastModified: "1 day ago",
                  amount: "$12,500",
                },
                {
                  title: "Manufacturing Equipment Lease",
                  supplier: "Industrial Solutions Ltd.",
                  status: "Draft",
                  lastModified: "3 days ago",
                  amount: "$125,000",
                },
              ].map((contract, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {contract.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {contract.supplier}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {contract.lastModified}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        contract.status === "Active"
                          ? "default"
                          : contract.status === "Pending"
                          ? "secondary"
                          : "outline"
                      }
                      className="mb-2"
                    >
                      {contract.status}
                    </Badge>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {contract.amount}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats & Actions */}
        <div className="space-y-6">
          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Active Contracts
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  24
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Pending Review
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  7
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total Value
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  $2.4M
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Expiring Soon
                </span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  3
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Import Contract
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FolderOpen className="w-4 h-4 mr-2" />
                View Templates
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Getting Started Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Star className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Getting Started with PO Contracts
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create your first purchase order contract or explore our
                templates to get started quickly.
              </p>
              <div className="flex space-x-3">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Create First Contract
                </Button>
                <Button variant="outline">View Documentation</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
