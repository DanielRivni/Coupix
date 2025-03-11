
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import CouponForm from "@/components/coupon/CouponForm";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
    
    const checkBucket = async () => {
      try {
        setLoading(true);
        
        // Try to insert the user's profile if it doesn't exist
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', currentUser.id)
          .single();
        
        if (profileError && profileError.code === 'PGRST116') {
          console.log("Profile doesn't exist, creating one");
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: currentUser.id,
              name: currentUser.user_metadata?.name || 'User',
              email: currentUser.email
            });
          
          if (insertError) {
            console.error("Error creating profile:", insertError);
            toast.error("Failed to set up your profile");
          }
        }
        
        // Check if bucket exists
        const { data: bucket, error: bucketError } = await supabase.storage
          .getBucket('coupon-images');
        
        if (bucketError) {
          console.error("Error checking bucket:", bucketError);
          toast.error("Failed to set up storage for coupon images");
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    
    checkBucket();
  }, [currentUser]);

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
