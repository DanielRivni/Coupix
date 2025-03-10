import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { Coupon } from "@/lib/types";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface CouponContextType {
  coupons: Coupon[];
  loading: boolean;
  createCoupon: (coupon: Omit<Coupon, "id" | "userId" | "createdAt" | "isRedeemed">) => Promise<Coupon>;
  updateCoupon: (id: string, coupon: Partial<Coupon>) => Promise<Coupon>;
  deleteCoupon: (id: string) => Promise<void>;
  redeemCoupon: (id: string) => Promise<Coupon>;
  getCoupon: (id: string) => Coupon | undefined;
}

const CouponContext = createContext<CouponContextType | undefined>(undefined);

export const useCoupons = () => {
  const context = useContext(CouponContext);
  if (context === undefined) {
    throw new Error("useCoupons must be used within a CouponProvider");
  }
  return context;
};

export const CouponProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      loadCoupons();
    } else {
      setCoupons([]);
      setLoading(false);
    }
  }, [currentUser]);

  const loadCoupons = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      console.log("Loading coupons for user:", currentUser.id);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error loading coupons:", error);
        throw error;
      }
      
      console.log("Loaded coupons:", data);
      
      // Transform Supabase data to match our Coupon type
      const formattedCoupons: Coupon[] = data.map((coupon: any) => ({
        id: coupon.id,
        userId: coupon.user_id,
        store: coupon.store,
        amount: String(coupon.amount), // Convert to string to match our type
        description: coupon.description || '',
        link: coupon.link || '',
        image: coupon.image_url || '',
        expiryDate: coupon.expiry_date ? new Date(coupon.expiry_date) : null,
        isRedeemed: coupon.is_redeemed,
        createdAt: new Date(coupon.created_at)
      }));
      
      setCoupons(formattedCoupons);
    } catch (error) {
      console.error("Error loading coupons:", error);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const getCoupon = (id: string) => {
    return coupons.find(coupon => coupon.id === id);
  };

  const createCoupon = async (couponData: Omit<Coupon, "id" | "userId" | "createdAt" | "isRedeemed">) => {
    if (!currentUser) {
      throw new Error("You must be logged in to create a coupon");
    }

    try {
      console.log("Creating coupon:", couponData);
      
      // Convert to Supabase format
      const { data, error } = await supabase
        .from('coupons')
        .insert({
          user_id: currentUser.id,
          store: couponData.store,
          amount: parseInt(couponData.amount) || 0,
          description: couponData.description,
          link: couponData.link,
          image_url: couponData.image,
          expiry_date: couponData.expiryDate,
          is_redeemed: false
        })
        .select('*')
        .single();
      
      if (error) {
        console.error("Error from Supabase:", error);
        throw error;
      }
      
      console.log("Created coupon response:", data);
      
      // Convert back to our Coupon type
      const newCoupon: Coupon = {
        id: data.id,
        userId: data.user_id,
        store: data.store,
        amount: String(data.amount),
        description: data.description || '',
        link: data.link || '',
        image: data.image_url || '',
        expiryDate: data.expiry_date ? new Date(data.expiry_date) : null,
        isRedeemed: data.is_redeemed,
        createdAt: new Date(data.created_at)
      };
      
      setCoupons(prevCoupons => [newCoupon, ...prevCoupons]);
      toast.success("Coupon created successfully");
      return newCoupon;
    } catch (error: any) {
      console.error("Error creating coupon:", error);
      toast.error(error.message || "Failed to create coupon");
      throw error;
    }
  };

  const updateCoupon = async (id: string, couponData: Partial<Coupon>) => {
    if (!currentUser) {
      throw new Error("You must be logged in to update a coupon");
    }

    try {
      // Prepare data for Supabase
      const updateData: any = {};
      
      if (couponData.store !== undefined) updateData.store = couponData.store;
      if (couponData.amount !== undefined) updateData.amount = parseInt(couponData.amount) || 0;
      if (couponData.description !== undefined) updateData.description = couponData.description;
      if (couponData.link !== undefined) updateData.link = couponData.link;
      if (couponData.image !== undefined) updateData.image_url = couponData.image;
      if (couponData.expiryDate !== undefined) updateData.expiry_date = couponData.expiryDate;
      if (couponData.isRedeemed !== undefined) updateData.is_redeemed = couponData.isRedeemed;
      
      // Add updated_at timestamp
      updateData.updated_at = new Date();
      
      const { data, error } = await supabase
        .from('coupons')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', currentUser.id)
        .select('*')
        .single();
      
      if (error) throw error;
      
      // Convert back to our Coupon type
      const updatedCoupon: Coupon = {
        id: data.id,
        userId: data.user_id,
        store: data.store,
        amount: String(data.amount),
        description: data.description || '',
        link: data.link || '',
        image: data.image_url || '',
        expiryDate: data.expiry_date ? new Date(data.expiry_date) : null,
        isRedeemed: data.is_redeemed,
        createdAt: new Date(data.created_at)
      };
      
      setCoupons(prevCoupons => 
        prevCoupons.map(coupon => 
          coupon.id === id ? updatedCoupon : coupon
        )
      );
      
      toast.success("Coupon updated successfully");
      return updatedCoupon;
    } catch (error: any) {
      console.error("Error updating coupon:", error);
      toast.error(error.message || "Failed to update coupon");
      throw error;
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!currentUser) {
      throw new Error("You must be logged in to delete a coupon");
    }

    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.id);
      
      if (error) throw error;
      
      setCoupons(prevCoupons => prevCoupons.filter(coupon => coupon.id !== id));
      toast.success("Coupon deleted successfully");
    } catch (error: any) {
      console.error("Error deleting coupon:", error);
      toast.error(error.message || "Failed to delete coupon");
      throw error;
    }
  };

  const redeemCoupon = async (id: string) => {
    if (!currentUser) {
      throw new Error("You must be logged in to redeem a coupon");
    }

    try {
      const { data, error } = await supabase
        .from('coupons')
        .update({ is_redeemed: true, updated_at: new Date() })
        .eq('id', id)
        .eq('user_id', currentUser.id)
        .select('*')
        .single();
      
      if (error) throw error;
      
      // Convert back to our Coupon type
      const updatedCoupon: Coupon = {
        id: data.id,
        userId: data.user_id,
        store: data.store,
        amount: String(data.amount),
        description: data.description || '',
        link: data.link || '',
        image: data.image_url || '',
        expiryDate: data.expiry_date ? new Date(data.expiry_date) : null,
        isRedeemed: data.is_redeemed,
        createdAt: new Date(data.created_at)
      };
      
      setCoupons(prevCoupons => 
        prevCoupons.map(coupon => 
          coupon.id === id ? updatedCoupon : coupon
        )
      );
      
      toast.success("Coupon marked as redeemed");
      return updatedCoupon;
    } catch (error: any) {
      console.error("Error redeeming coupon:", error);
      toast.error(error.message || "Failed to redeem coupon");
      throw error;
    }
  };

  return (
    <CouponContext.Provider
      value={{
        coupons,
        loading,
        createCoupon,
        updateCoupon,
        deleteCoupon,
        redeemCoupon,
        getCoupon,
      }}
    >
      {children}
    </CouponContext.Provider>
  );
};
