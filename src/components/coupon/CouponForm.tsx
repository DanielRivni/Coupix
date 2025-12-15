import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Link2, Upload } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCoupons } from "@/contexts/CouponContext";
import { Coupon, StoreOptions, AmountOptions } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  store: z.string().min(1, "Store is required"),
  customStore: z.string().optional(),
  amount: z.string().min(1, "Amount is required"),
  customAmount: z.string().optional(),
  description: z.string().optional(),
  link: z.string().url().optional().or(z.literal("")),
  couponCode: z.string().optional(),
  expiryDate: z.date().optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

const CouponForm = () => {
  const { createCoupon, updateCoupon, getCoupon } = useCoupons();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  
  const [showCustomStore, setShowCustomStore] = useState(false);
  const [showCustomAmount, setShowCustomAmount] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      store: "",
      customStore: "",
      amount: "",
      customAmount: "",
      description: "",
      link: "",
      couponCode: "",
      expiryDate: null,
    },
  });

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size exceeds 2MB limit");
        return;
      }
      
      setImageFile(file);
      
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
      
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !currentUser) return null;
    
    try {
      setIsUploading(true);
      
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${currentUser.id}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('coupon-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error("Upload error details:", error);
        throw error;
      }
      
      const { data: publicUrl } = supabase.storage
        .from('coupon-images')
        .getPublicUrl(filePath);
      
      return publicUrl.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (isEditing && id) {
      const coupon = getCoupon(id);
      if (coupon) {
        const isCustomStore = !StoreOptions.includes(coupon.store);
        const isCustomAmount = !AmountOptions.includes(coupon.amount);
        
        setShowCustomStore(isCustomStore);
        setShowCustomAmount(isCustomAmount);
        
        if (coupon.image) {
          setImagePreview(coupon.image);
        }
        
        form.reset({
          store: isCustomStore ? "Other" : coupon.store,
          customStore: isCustomStore ? coupon.store : "",
          amount: isCustomAmount ? "Other" : coupon.amount,
          customAmount: isCustomAmount ? coupon.amount : "",
          description: coupon.description || "",
          link: coupon.link || "",
          couponCode: coupon.couponCode || "",
          expiryDate: coupon.expiryDate,
        });
      } else {
        navigate("/");
      }
    }
  }, [isEditing, id, getCoupon, form, navigate]);

  const onSubmit = async (data: FormData) => {
    if (!currentUser) {
      toast.error("You must be logged in to create coupons");
      navigate("/login");
      return;
    }
    
    setFormError(null);
    
    try {
      setIsUploading(true);
      
      const finalStore = data.store === "Other" ? data.customStore! : data.store;
      const finalAmount = data.amount === "Other" ? data.customAmount! : data.amount;
      
      if (data.store === "Other" && !data.customStore) {
        setFormError("Custom store name is required");
        return;
      }
      
      if (data.amount === "Other" && !data.customAmount) {
        setFormError("Custom amount is required");
        return;
      }
      
      let imageUrl = imagePreview;
      if (imageFile) {
        imageUrl = await uploadImage();
        if (!imageUrl && imageFile) {
          toast.error("Image upload failed, please try again");
          return;
        }
      }
      
      const couponData = {
        store: finalStore,
        amount: finalAmount,
        description: data.description,
        link: data.link,
        image: imageUrl,
        couponCode: data.couponCode,
        expiryDate: data.expiryDate,
      };
      
      if (isEditing && id) {
        await updateCoupon(id, couponData);
        toast.success("Coupon updated successfully");
      } else {
        await createCoupon(couponData);
        toast.success("Coupon created successfully");
      }
      
      navigate("/");
    } catch (error) {
      console.error("Failed to save coupon:", error);
      toast.error("Failed to save coupon");
      setFormError("Failed to save coupon. Please try again later.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Coupon" : "Create New Coupon"}</CardTitle>
      </CardHeader>
      <CardContent>
        {formError && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
            {formError}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="store"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store*</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setShowCustomStore(value === "Other");
                        }}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a store" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {StoreOptions.map((store) => (
                            <SelectItem key={store} value={store}>
                              {store}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showCustomStore && (
                  <FormField
                    control={form.control}
                    name="customStore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Store*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter store name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount*</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setShowCustomAmount(value === "Other");
                        }}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select amount" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AmountOptions.map((amount) => (
                            <SelectItem key={amount} value={amount}>
                              {amount === "Other" ? "Other" : `₪${amount}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showCustomAmount && (
                  <FormField
                    control={form.control}
                    name="customAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Amount*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter amount" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter coupon description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="https://example.com/coupon"
                        {...field}
                      />
                      <Link2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="couponCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coupon Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter coupon code (e.g., SAVE20)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: For text-based coupons or promo codes
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Coupon Image</FormLabel>
              <div className="grid grid-cols-1 gap-4">
                <div className="border border-input bg-background rounded-md px-3 py-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="flex-shrink-0 bg-primary/10 p-2 rounded-md">
                      <Upload className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Click to upload</span> or drag and drop
                      <p className="text-xs">SVG, PNG, JPG or GIF (max. 2MB)</p>
                    </div>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                
                {imagePreview && (
                  <div className="relative rounded-md overflow-hidden border border-input h-40">
                    <img
                      src={imagePreview}
                      alt="Coupon preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full shadow-sm"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expiry Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => navigate("/")}>
          Cancel
        </Button>
        <Button 
          onClick={form.handleSubmit(onSubmit)}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
              {isEditing ? "Saving..." : "Creating..."}
            </>
          ) : (
            isEditing ? "Save Changes" : "Create Coupon"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CouponForm;
