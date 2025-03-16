
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Edit, UserCircle } from "lucide-react";

interface ProfileViewProps {
  user: User | null;
  displayName: string;
  onEdit: () => void;
}

const ProfileView = ({ user, displayName, onEdit }: ProfileViewProps) => {
  return (
    <CardContent className="space-y-4 text-center">
      <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center">
        <UserCircle className="h-16 w-16 text-primary" />
      </div>
      {user && (
        <>
          <h2 className="text-xl font-bold">{displayName}</h2>
          <p className="text-muted-foreground">{user.email}</p>
          <Button 
            variant="outline" 
            onClick={onEdit}
          >
            <Edit className="mr-2 h-4 w-4" /> 
            Edit Name
          </Button>
        </>
      )}
    </CardContent>
  );
};

export default ProfileView;
