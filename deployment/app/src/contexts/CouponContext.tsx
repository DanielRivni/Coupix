
import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { Coupon } from "@/lib/types";
import { toast } from "sonner";
import { 
  fetchUserCoupons,
  createCoupon as apiCreateCoupon,
  updateCoupon as apiUpdateCoupon,
  deleteCoupon as apiDeleteCoupon,
  redeemCoupon as apiRedeemCoupon,
  ensureUserProfile
} from "@/services/couponService";

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
  const { currentUser, ensureUserProfile: authEnsureUserProfile } = useAuth();

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
      // Ensure profile exists before loading coupons
      await authEnsureUserProfile();
      
      const fetchedCoupons = await fetchUserCoupons(currentUser.id);
      setCoupons(fetchedCoupons);
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
      // Ensure profile exists before creating a coupon
      const profileExists = await authEnsureUserProfile();
      if (!profileExists) {
        console.error("Cannot create coupon without a user profile");
        throw new Error("Profile not set up correctly");
      }
      
      const newCoupon = await apiCreateCoupon(currentUser.id, couponData);
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
      const updatedCoupon = await apiUpdateCoupon(currentUser.id, id, couponData);
      
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
      await apiDeleteCoupon(currentUser.id, id);
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
      const updatedCoupon = await apiRedeemCoupon(currentUser.id, id);
      
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
