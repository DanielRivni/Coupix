
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UserCircle, Eye, EyeOff, Key, Trash2, Save, Edit } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ProfileView from "@/components/profile/ProfileView";
import ProfileForm from "@/components/profile/ProfileForm";
import PasswordSection from "@/components/profile/PasswordSection";
import DeleteAccountSection from "@/components/profile/DeleteAccountSection";

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const [editingProfile, setEditingProfile] = useState(false);

  // Get user display name from metadata or use email as fallback
  function getUserDisplayName() {
    if (!currentUser) return '';
    
    // Try to get name from user metadata
    return currentUser.user_metadata?.name || 
           currentUser.user_metadata?.full_name || 
           currentUser.email?.split('@')[0] || 
           'User';
  }

  return (
    <Layout requireAuth>
      <div className="max-w-md mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Profile</CardTitle>
            <CardDescription className="text-center">Manage your account settings</CardDescription>
          </CardHeader>
          
          {!editingProfile ? (
            <ProfileView 
              user={currentUser} 
              displayName={getUserDisplayName()} 
              onEdit={() => setEditingProfile(true)} 
            />
          ) : (
            <ProfileForm 
              user={currentUser}
              initialName={getUserDisplayName()}
              onCancel={() => setEditingProfile(false)}
              onSuccess={() => setEditingProfile(false)}
            />
          )}
        </Card>

        <PasswordSection />
        <DeleteAccountSection />
      </div>
    </Layout>
  );
};

export default ProfilePage;
