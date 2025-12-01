
import Layout from "@/components/layout/Layout";
import LoginForm from "@/components/auth/LoginForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSearchParams } from "react-router-dom";
import { Info, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const message = searchParams.get("message");
  const [error, setError] = useState<string | null>(null);

  // Listen for authentication errors from localStorage
  useEffect(() => {
    const authError = localStorage.getItem("authError");
    if (authError) {
      setError(authError);
      // Clear the error after retrieving it
      localStorage.removeItem("authError");
    }
  }, []);

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        {message && (
          <Alert className="mb-4 bg-blue-50 text-blue-800">
            <Info className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert className="mb-4 bg-red-50 text-red-800 border-red-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <LoginForm setError={setError} />
      </div>
    </Layout>
  );
};

export default LoginPage;
