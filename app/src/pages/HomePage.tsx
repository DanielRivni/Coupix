
import Layout from "@/components/layout/Layout";
import CouponList from "@/components/coupon/CouponList";

const HomePage = () => {
  return (
    <Layout requireAuth>
      <CouponList />
    </Layout>
  );
};

export default HomePage;
