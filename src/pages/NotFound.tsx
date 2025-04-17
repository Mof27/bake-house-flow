
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

const NotFound = () => {
  const location = useLocation();
  const { theme } = useTheme();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background ipad-container">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-bakery-primary mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">Oops! This page is not in our recipe book.</p>
        <Button asChild size="lg">
          <a href="/">Return to Kitchen Dashboard</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
