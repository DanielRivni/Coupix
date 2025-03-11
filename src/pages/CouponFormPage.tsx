
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import CouponForm from "@/components/coupon/CouponForm";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const CouponFormPage = () => {
  const [bucketError, setBucketError] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  useEffect(() => {
    // Skip bucket creation if not logged in
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    const ensureBucket = async () => {
      try {
        setLoading(true);
        
        // Try to create the bucket if it doesn't exist
        const { error: createBucketError } = await supabase.storage.createBucket('coupon-images', {
          public: true,
          fileSizeLimit: 2097152, // 2MB in bytes
        });
        
        if (createBucketError && createBucketError.message !== "Bucket already exists") {
          console.error("Error creating bucket:", createBucketError);
          setBucketError(true);
          toast.error("Failed to set up storage for coupon images");
        } else {
          // Make sure the bucket is public
          const { error: updateBucketError } = await supabase.storage.updateBucket('coupon-images', {
            public: true,
          });
          
          if (updateBucketError) {
            console.error("Error updating bucket:", updateBucketError);
            // This is not critical, so we don't set bucket error
          }
          
          setBucketError(false);
        }
      } catch (error) {
        console.error("Unexpected error handling bucket:", error);
        setBucketError(true);
        toast.error("Failed to set up storage for coupon images");
      } finally {
        setLoading(false);
      }
    };
    
    ensureBucket();
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
