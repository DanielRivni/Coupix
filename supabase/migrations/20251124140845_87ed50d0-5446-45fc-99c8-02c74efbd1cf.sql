-- Add coupon_code column to coupons table
ALTER TABLE public.coupons 
ADD COLUMN coupon_code TEXT;