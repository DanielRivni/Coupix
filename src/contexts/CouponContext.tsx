
import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { Coupon } from "@/lib/types";
import { toast } from "sonner";

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

const COUPONS_STORAGE_KEY = "coupix_coupons";

export const CouponProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    loadCoupons();
  }, [currentUser]);

  const loadCoupons = () => {
    setLoading(true);
    try {
      const storedCoupons = localStorage.getItem(COUPONS_STORAGE_KEY);
      let parsedCoupons: Record<string, Coupon> = storedCoupons ? JSON.parse(storedCoupons) : {};
      
      // Parse date strings back to Date objects
      Object.values(parsedCoupons).forEach(coupon => {
        if (coupon.expiryDate) {
          coupon.expiryDate = new Date(coupon.expiryDate);
        }
        coupon.createdAt = new Date(coupon.createdAt);
      });

      // Filter coupons by current user
      if (currentUser) {
        const userCoupons = Object.values(parsedCoupons).filter(
          coupon => coupon.userId === currentUser.id
        );
        setCoupons(userCoupons);
      } else {
        setCoupons([]);
      }
    } catch (error) {
      console.error("Error loading coupons:", error);
      toast.error("Failed to load coupons");
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const saveCoupons = (updatedCoupons: Coupon[]) => {
    try {
      // Get all coupons from storage
      const storedCoupons = localStorage.getItem(COUPONS_STORAGE_KEY);
      let allCoupons: Record<string, Coupon> = storedCoupons ? JSON.parse(storedCoupons) : {};
      
      // Update the coupons for the current user
      updatedCoupons.forEach(coupon => {
        allCoupons[coupon.id] = coupon;
      });
      
      localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(allCoupons));
      return true;
    } catch (error) {
      console.error("Error saving coupons:", error);
      return false;
    }
  };

  const getCoupon = (id: string) => {
    return coupons.find(coupon => coupon.id === id);
  };

  const createCoupon = async (couponData: Omit<Coupon, "id" | "userId" | "createdAt" | "isRedeemed">) => {
    if (!currentUser) {
      throw new Error("You must be logged in to create a coupon");
    }

    const newCoupon: Coupon = {
      id: `coupon_${Date.now()}`,
      userId: currentUser.id,
      ...couponData,
      isRedeemed: false,
      createdAt: new Date(),
    };

    const updatedCoupons = [...coupons, newCoupon];
    setCoupons(updatedCoupons);
    
    if (saveCoupons(updatedCoupons)) {
      toast.success("Coupon created successfully");
      return newCoupon;
    } else {
      throw new Error("Failed to save coupon");
    }
  };

  const updateCoupon = async (id: string, couponData: Partial<Coupon>) => {
    if (!currentUser) {
      throw new Error("You must be logged in to update a coupon");
    }

    const couponIndex = coupons.findIndex(c => c.id === id);
    if (couponIndex === -1) {
      throw new Error("Coupon not found");
    }

    const updatedCoupon = {
      ...coupons[couponIndex],
      ...couponData,
    };

    const updatedCoupons = [...coupons];
    updatedCoupons[couponIndex] = updatedCoupon;
    setCoupons(updatedCoupons);
    
    if (saveCoupons(updatedCoupons)) {
      toast.success("Coupon updated successfully");
      return updatedCoupon;
    } else {
      throw new Error("Failed to update coupon");
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!currentUser) {
      throw new Error("You must be logged in to delete a coupon");
    }

    const updatedCoupons = coupons.filter(coupon => coupon.id !== id);
    setCoupons(updatedCoupons);
    
    // Get all coupons
    const storedCoupons = localStorage.getItem(COUPONS_STORAGE_KEY);
    if (storedCoupons) {
      const allCoupons: Record<string, Coupon> = JSON.parse(storedCoupons);
      delete allCoupons[id];
      localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(allCoupons));
    }
    
    toast.success("Coupon deleted successfully");
  };

  const redeemCoupon = async (id: string) => {
    if (!currentUser) {
      throw new Error("You must be logged in to redeem a coupon");
    }

    const couponIndex = coupons.findIndex(c => c.id === id);
    if (couponIndex === -1) {
      throw new Error("Coupon not found");
    }

    const updatedCoupon = {
      ...coupons[couponIndex],
      isRedeemed: true,
    };

    const updatedCoupons = [...coupons];
    updatedCoupons[couponIndex] = updatedCoupon;
    setCoupons(updatedCoupons);
    
    if (saveCoupons(updatedCoupons)) {
      toast.success("Coupon marked as redeemed");
      return updatedCoupon;
    } else {
      throw new Error("Failed to redeem coupon");
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
