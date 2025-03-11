
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
        
        // Check if bucket exists by listing objects (more reliable)
        const { data, error } = await supabase.storage
          .from('coupon-images')
          .list();
        
        if (error) {
          console.error("Error accessing storage bucket:", error);
          toast.error("Storage setup issue - please try again later");
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
