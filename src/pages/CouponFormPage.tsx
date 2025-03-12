
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
  const { currentUser, ensureUserProfile } = useAuth();
  
  useEffect(() => {
    // Skip if not logged in
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    const initPage = async () => {
      try {
        setLoading(true);
        
        // Ensure user profile exists
        const profileCreated = await ensureUserProfile();
        if (!profileCreated) {
          console.error("Failed to ensure user profile");
          // Continue anyway, maybe the profile already exists
        }
        
        // Check if storage is accessible
        try {
          const { data, error } = await supabase.storage
            .from('coupon-images')
            .list('', { limit: 1 });
          
          if (error) {
            console.error("Storage access error:", error);
            toast.error("Storage access issue - please try again later");
          } else {
            console.log("Storage access successful");
          }
        } catch (storageError) {
          console.error("Storage error:", storageError);
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initPage();
  }, [currentUser, ensureUserProfile]);

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
