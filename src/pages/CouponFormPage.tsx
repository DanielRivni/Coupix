
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import CouponForm from "@/components/coupon/CouponForm";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const CouponFormPage = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  useEffect(() => {
    // Skip bucket checking if not logged in
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    // Just check if bucket exists, we don't need to create it here
    // since we've done that with SQL migration
    const checkBucket = async () => {
      try {
        setLoading(true);
        
        // Just check if we can access the bucket
        const { data, error } = await supabase.storage.getBucket('coupon-images');
        
        if (error) {
          console.log("Error checking bucket:", error);
          // We don't want to block the user here, just log the error
        }
        
        console.log("Bucket exists:", data);
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkBucket();
  }, [currentUser]);

  const handleGoBack = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <Layout requireAuth>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
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
