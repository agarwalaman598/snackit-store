import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Mail, Home, Users } from "lucide-react";

export default function DomainError() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
      <Card className="w-full max-w-2xl mx-4 border border-gray-100 shadow-xl">
        <CardContent className="pt-8 pb-8">
          <div className="text-center">
            {/* Error Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-12 w-12 text-white" />
            </div>
            
            {/* Main Message */}
            <h1 className="text-3xl font-black text-gray-900 mb-4">Email Domain Restricted</h1>
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
              We're sorry, but SnackIt is currently only available for KIIT University students and staff.
            </p>
            
            {/* Domain Info */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 mb-8">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Mail className="h-5 w-5 text-orange-500" />
                <span className="font-semibold text-gray-900">Allowed Email Domains</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">@kiit.ac.in</span>
                  <span className="text-sm text-gray-500">(KIIT University)</span>
                </div>
              </div>
            </div>
            
            {/* Why This Restriction */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200 mb-8">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center justify-center">
                <Users className="h-5 w-5 mr-2 text-orange-500" />
                Why This Restriction?
              </h3>
              <div className="text-left space-y-2 text-sm text-gray-600">
                      <p>• SnackIt is designed specifically for KIIT University campus</p>
                <p>• We ensure fast delivery to hostel locations</p>
                <p>• Campus-specific payment and delivery methods</p>
                <p>• Student-friendly pricing and offers</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.history.back()} 
                variant="outline"
                className="border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3"
              >
                <Mail className="h-4 w-4 mr-2" />
                Try Different Email
              </Button>
              <a 
                href="/" 
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </a>
            </div>
            
            {/* Contact Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Have questions? Contact us at{' '}
          <a href="mailto:support@snackit.com" className="text-orange-600 hover:text-orange-700 font-medium">
            support@snackit.com
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
