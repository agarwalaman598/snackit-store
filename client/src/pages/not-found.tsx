import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
      <Card className="w-full max-w-md mx-4 border border-gray-100 shadow-xl">
        <CardContent className="pt-8 pb-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-4">404 Page Not Found</h1>
            <p className="text-gray-600 mb-6 text-lg">
              Oops! The page you're looking for doesn't exist.
            </p>
            <a 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <i className="fas fa-home mr-2"></i>
              Go Home
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
