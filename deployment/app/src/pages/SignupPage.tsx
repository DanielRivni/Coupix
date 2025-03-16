
import Layout from "@/components/layout/Layout";
import SignupForm from "@/components/auth/SignupForm";

const SignupPage = () => {
  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <SignupForm />
      </div>
    </Layout>
  );
};

export default SignupPage;
