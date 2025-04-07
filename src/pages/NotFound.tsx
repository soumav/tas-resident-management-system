
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <div className="flex justify-center mb-6">
          <div className="sanctuary-logo">
            <Leaf className="h-6 w-6 text-white" />
          </div>
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Oops! This page has wandered off</p>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't seem to exist in our sanctuary.
        </p>
        <Button asChild className="bg-sanctuary-green hover:bg-sanctuary-light-green">
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
