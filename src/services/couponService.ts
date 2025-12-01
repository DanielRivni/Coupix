
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Coupon } from "@/lib/types";

// Transform database coupon to frontend coupon
export const transformDatabaseCoupon = (dbCoupon: any): Coupon => {
  return {
    id: dbCoupon.id,
    userId: dbCoupon.user_id,
    store: dbCoupon.store,
    amount: String(dbCoupon.amount),
    description: dbCoupon.description || '',
    link: dbCoupon.link || '',
    image: dbCoupon.image_url || '',
    couponCode: dbCoupon.coupon_code || '',
    expiryDate: dbCoupon.expiry_date ? new Date(dbCoupon.expiry_date) : null,
    isRedeemed: dbCoupon.is_redeemed,
    createdAt: new Date(dbCoupon.created_at)
  };
};

// Fetch all coupons for a user
export const fetchUserCoupons = async (userId: string): Promise<Coupon[]> => {
  console.log("Fetching coupons for user:", userId);
  
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  }
  
  console.log("Received coupons data:", data);
  
  return data.map(transformDatabaseCoupon);
};

// Create a new coupon
export const createCoupon = async (
  userId: string, 
  couponData: Omit<Coupon, "id" | "userId" | "createdAt" | "isRedeemed">
): Promise<Coupon> => {
  console.log("Creating coupon:", couponData);
  
  const { data, error } = await supabase
    .from('coupons')
    .insert([{
      user_id: userId,
      store: couponData.store,
      amount: parseInt(couponData.amount) || 0,
      description: couponData.description,
      link: couponData.link,
      image_url: couponData.image,
      coupon_code: couponData.couponCode,
      expiry_date: couponData.expiryDate?.toISOString(),
      is_redeemed: false
    }])
    .select('*')
    .single();
  
  if (error) {
    console.error("Error creating coupon:", error);
    throw error;
  }
  
  console.log("Created coupon successfully:", data);
  return transformDatabaseCoupon(data);
};

// Update an existing coupon
export const updateCoupon = async (
  userId: string, 
  couponId: string, 
  couponData: Partial<Coupon>
): Promise<Coupon> => {
  // Prepare data for Supabase
  const updateData: any = {};
  
  if (couponData.store !== undefined) updateData.store = couponData.store;
  if (couponData.amount !== undefined) updateData.amount = parseInt(couponData.amount) || 0;
  if (couponData.description !== undefined) updateData.description = couponData.description;
  if (couponData.link !== undefined) updateData.link = couponData.link;
  if (couponData.image !== undefined) updateData.image_url = couponData.image;
  if (couponData.couponCode !== undefined) updateData.coupon_code = couponData.couponCode;
  if (couponData.expiryDate !== undefined) updateData.expiry_date = couponData.expiryDate;
  if (couponData.isRedeemed !== undefined) updateData.is_redeemed = couponData.isRedeemed;
  
  // Add updated_at timestamp
  updateData.updated_at = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('coupons')
    .update(updateData)
    .eq('id', couponId)
    .eq('user_id', userId)
    .select('*')
    .single();
  
  if (error) throw error;
  
  return transformDatabaseCoupon(data);
};

// Delete a coupon
export const deleteCoupon = async (userId: string, couponId: string): Promise<void> => {
  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', couponId)
    .eq('user_id', userId);
  
  if (error) throw error;
};

// Mark a coupon as redeemed
export const redeemCoupon = async (userId: string, couponId: string): Promise<Coupon> => {
  const { data, error } = await supabase
    .from('coupons')
    .update({ is_redeemed: true, updated_at: new Date().toISOString() })
    .eq('id', couponId)
    .eq('user_id', userId)
    .select('*')
    .single();
  
  if (error) throw error;
  
  return transformDatabaseCoupon(data);
};

// Ensure user profile exists
export const ensureUserProfile = async (user: any): Promise<boolean> => {
  if (!user) return false;
  
  try {
    console.log("Checking if profile exists for user:", user.id);
    
    // Check if profile exists
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (!fetchError && profile) {
      console.log("User profile exists:", profile);
      return true;
    }
    
    console.log("Profile doesn't exist, creating one...");
    
    // Create profile if it doesn't exist
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email || ''
      });
    
    if (insertError) {
      console.error("Error creating profile:", insertError);
      return false;
    }
    
    console.log("Profile created successfully");
    return true;
  } catch (error) {
    console.error("Error in ensureUserProfile:", error);
    return false;
  }
};
