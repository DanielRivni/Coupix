
import Layout from "@/components/layout/Layout";
import LoginForm from "@/components/auth/LoginForm";

const LoginPage = () => {
  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <LoginForm />
      </div>
    </Layout>
  );
};

export default LoginPage;
