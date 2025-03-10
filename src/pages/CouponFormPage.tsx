
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import CouponForm from "@/components/coupon/CouponForm";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CouponFormPage = () => {
  const [bucketError, setBucketError] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Ensure the storage bucket exists
    const checkBucket = async () => {
      try {
        const { data, error } = await supabase.storage.getBucket('coupon-images');
        if (error) {
          console.error("Error checking bucket:", error);
          setBucketError(true);
        }
      } catch (error) {
        console.error("Unexpected error checking bucket:", error);
        setBucketError(true);
      }
    };
    
    checkBucket();
  }, []);

  const handleGoBack = () => {
    navigate("/");
  };

  if (bucketError) {
    return (
      <Layout requireAuth>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Storage Error</h2>
          <p className="mb-4">We're having trouble accessing storage for coupon images.</p>
          <Button onClick={handleGoBack}>Return to Home</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth>
      <CouponForm />
    </Layout>
  );
};

export default CouponFormPage;
