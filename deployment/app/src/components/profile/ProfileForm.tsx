
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  user: User | null;
  initialName: string;
  onCancel: () => void;
  onSuccess: () => void;
}

const ProfileForm = ({ user, initialName, onCancel, onSuccess }: ProfileFormProps) => {
  const [loading, setLoading] = useState(false);
  
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: initialName,
    },
  });

  const onSubmitProfile = async (data: ProfileFormValues) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Update name in user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { name: data.name }
      });
      
      if (updateError) throw updateError;
      
      // Update name in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ name: data.name })
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      toast.success("Profile updated successfully");
      onSuccess();
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardContent>
      <Form {...profileForm}>
        <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
          <FormField
            control={profileForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
              {!loading && <Save className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </form>
      </Form>
    </CardContent>
  );
};

export default ProfileForm;
