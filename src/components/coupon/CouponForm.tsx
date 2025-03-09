
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Link2 } from "lucide-react";
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

const formSchema = z.object({
  store: z.string().min(1, "Store is required"),
  customStore: z.string().optional(),
  amount: z.string().min(1, "Amount is required"),
  customAmount: z.string().optional(),
  description: z.string().optional(),
  link: z.string().url().optional().or(z.literal("")),
  image: z.string().optional(),
  expiryDate: z.date().optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

const CouponForm = () => {
  const { createCoupon, updateCoupon, getCoupon } = useCoupons();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  
  const [showCustomStore, setShowCustomStore] = useState(false);
  const [showCustomAmount, setShowCustomAmount] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      store: "",
      customStore: "",
      amount: "",
      customAmount: "",
      description: "",
      link: "",
      image: "",
      expiryDate: null,
    },
  });

  // Load coupon data if editing
  useEffect(() => {
    if (isEditing && id) {
      const coupon = getCoupon(id);
      if (coupon) {
        // Check if it's a custom store or amount
        const isCustomStore = !StoreOptions.includes(coupon.store);
        const isCustomAmount = !AmountOptions.includes(coupon.amount);
        
        setShowCustomStore(isCustomStore);
        setShowCustomAmount(isCustomAmount);
        
        form.reset({
          store: isCustomStore ? "Other" : coupon.store,
          customStore: isCustomStore ? coupon.store : "",
          amount: isCustomAmount ? "Other" : coupon.amount,
          customAmount: isCustomAmount ? coupon.amount : "",
          description: coupon.description || "",
          link: coupon.link || "",
          image: coupon.image || "",
          expiryDate: coupon.expiryDate,
        });
      } else {
        navigate("/");
      }
    }
  }, [isEditing, id, getCoupon, form, navigate]);

  const onSubmit = async (data: FormData) => {
    try {
      // Determine actual store and amount values
      const finalStore = data.store === "Other" ? data.customStore! : data.store;
      const finalAmount = data.amount === "Other" ? data.customAmount! : data.amount;
      
      const couponData = {
        store: finalStore,
        amount: finalAmount,
        description: data.description,
        link: data.link,
        image: data.image,
        expiryDate: data.expiryDate,
      };
      
      if (isEditing && id) {
        await updateCoupon(id, couponData);
      } else {
        await createCoupon(couponData);
      }
      
      navigate("/");
    } catch (error) {
      console.error("Failed to save coupon:", error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Coupon" : "Create New Coupon"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Store Selection */}
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

              {/* Amount Selection */}
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

            {/* Description */}
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

            {/* Link */}
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

            {/* Image URL */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a URL to the coupon image
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expiry Date */}
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
                          variant={"outline"}
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
                  <FormDescription>
                    When does this coupon expire?
                  </FormDescription>
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
        <Button onClick={form.handleSubmit(onSubmit)}>
          {isEditing ? "Save Changes" : "Create Coupon"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CouponForm;
