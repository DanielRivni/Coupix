
import Layout from "@/components/layout/Layout";
import LoginForm from "@/components/auth/LoginForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSearchParams } from "react-router-dom";
import { Info } from "lucide-react";

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const message = searchParams.get("message");

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        {message && (
          <Alert className="mb-4 bg-blue-50 text-blue-800">
            <Info className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        <LoginForm />
      </div>
    </Layout>
  );
};

export default LoginPage;
