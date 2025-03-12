
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Edit, Trash2, ExternalLink, CheckSquare, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coupon } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCoupons } from "@/contexts/CouponContext";

interface CouponCardProps {
  coupon: Coupon;
}

const CouponCard = ({ coupon }: CouponCardProps) => {
  const navigate = useNavigate();
  const { deleteCoupon, redeemCoupon } = useCoupons();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  
  const isExpired = coupon.expiryDate ? new Date() > new Date(coupon.expiryDate) : false;
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    console.log("Edit button clicked for coupon:", coupon.id);
    navigate(`/edit/${coupon.id}`);
  };
  
  const handleDelete = async (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent event bubbling
    console.log("Delete coupon:", coupon.id);
    try {
      await deleteCoupon(coupon.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting coupon:", error);
    }
  };
  
  const handleRedeem = async (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent event bubbling
    console.log("Redeeming coupon:", coupon.id);
    try {
      await redeemCoupon(coupon.id);
      setRedeemDialogOpen(false);
    } catch (error) {
      console.error("Error redeeming coupon:", error);
    }
  };
  
  const handleUse = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    console.log("Use coupon clicked:", coupon.id);
    
    if (coupon.image) {
      setImageDialogOpen(true);
    } else if (coupon.link) {
      window.open(coupon.link, "_blank");
    }
  };
  
  const openDeleteDialog = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    setDeleteDialogOpen(true);
  };
  
  const openRedeemDialog = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    setRedeemDialogOpen(true);
  };
  
  return (
    <>
      <div className="coupon-card group">
        <div className="coupon-card-gradient" />
        
        {/* Status badges */}
        <div className="absolute top-2 right-2 flex gap-2">
          {coupon.isRedeemed && (
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
              Redeemed
            </Badge>
          )}
          {isExpired && (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">
              Expired
            </Badge>
          )}
        </div>
        
        {/* Coupon content */}
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{coupon.store}</h3>
              <div className="text-2xl font-bold text-primary">₪{coupon.amount}</div>
            </div>
            
            {coupon.image && (
              <div 
                className="w-16 h-16 rounded-md bg-muted flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={handleUse}
              >
                <img 
                  src={coupon.image} 
                  alt={`${coupon.store} coupon`} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/64x64/gray/white?text=No+Image';
                  }}
                />
              </div>
            )}
          </div>
          
          {coupon.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{coupon.description}</p>
          )}
          
          {coupon.expiryDate && (
            <div className="text-sm text-muted-foreground">
              Expires: {format(new Date(coupon.expiryDate), "PP")}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleUse}
              disabled={coupon.isRedeemed || (!coupon.image && !coupon.link)}
            >
              Use Coupon
              {coupon.link && <ExternalLink className="ml-1 h-4 w-4" />}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={openRedeemDialog}
              disabled={coupon.isRedeemed}
            >
              Mark Redeemed
              <CheckSquare className="ml-1 h-4 w-4" />
            </Button>
            
            <div className="flex-grow"></div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleEdit}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={openDeleteDialog}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this coupon? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete()} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Redeem confirmation dialog */}
      <AlertDialog open={redeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Redeemed</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this coupon as redeemed? This will help you track which coupons you've already used.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleRedeem()}>
              Mark as Redeemed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Image dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>{coupon.store} - ₪{coupon.amount}</DialogTitle>
          </DialogHeader>
          {coupon.image && (
            <div className="flex justify-center p-6">
              <img 
                src={coupon.image} 
                alt={`${coupon.store} coupon`} 
                className="max-w-full max-h-[60vh] object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/gray/white?text=Image+Error';
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CouponCard;
