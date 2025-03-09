
import Layout from "@/components/layout/Layout";
import CouponForm from "@/components/coupon/CouponForm";

const CouponFormPage = () => {
  return (
    <Layout requireAuth>
      <CouponForm />
    </Layout>
  );
};

export default CouponFormPage;
