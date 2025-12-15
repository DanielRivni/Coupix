
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Edit, Trash2, ExternalLink, CheckSquare, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coupon } from "@/lib/types";
import { useCoupons } from "@/contexts/CouponContext";
import { toast } from "sonner";
import CouponDeleteDialog from "./dialogs/CouponDeleteDialog";
import CouponRedeemDialog from "./dialogs/CouponRedeemDialog";
import CouponImageDialog from "./dialogs/CouponImageDialog";

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
    e.stopPropagation();
    console.log("Edit button clicked for coupon:", coupon.id);
    navigate(`/edit/${coupon.id}`);
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Opening delete dialog for coupon:", coupon.id);
    setDeleteDialogOpen(true);
  };
  
  const handleDelete = async () => {
    console.log("Confirming delete for coupon:", coupon.id);
    try {
      await deleteCoupon(coupon.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting coupon:", error);
    }
  };
  
  const handleRedeemClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Opening redeem dialog for coupon:", coupon.id);
    setRedeemDialogOpen(true);
  };
  
  const handleRedeem = async () => {
    console.log("Confirming redeem for coupon:", coupon.id);
    try {
      await redeemCoupon(coupon.id);
      setRedeemDialogOpen(false);
    } catch (error) {
      console.error("Error redeeming coupon:", error);
    }
  };
  
  const handleUseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Use coupon clicked:", coupon.id);
    
    if (coupon.image) {
      setImageDialogOpen(true);
    } else if (coupon.link) {
      window.open(coupon.link, "_blank");
    }
  };
  
  const handleCopyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const code = coupon.couponCode;
    if (code) {
      try {
        await navigator.clipboard.writeText(code);
        toast.success("Code copied to clipboard!", { duration: 1500 });
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        toast.success("Code copied to clipboard!", { duration: 1500 });
      }
    }
  };
  
  return (
    <>
      <div className="coupon-card group relative">
        <div className="coupon-card-gradient" />
        
        {/* Status badges */}
        <div className="absolute top-2 right-2 flex gap-2 z-10">
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
                className={`w-16 h-16 rounded-md bg-muted flex items-center justify-center overflow-hidden cursor-pointer ${coupon.isRedeemed ? 'mt-6' : ''}`}
                onClick={handleUseClick}
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
          
          {coupon.couponCode && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <code className="text-sm font-mono flex-1">{coupon.couponCode}</code>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleCopyCode}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {coupon.expiryDate && (
            <div className="text-sm text-muted-foreground">
              Expires: {format(new Date(coupon.expiryDate), "PP")}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2 relative z-10">
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleUseClick}
              disabled={coupon.isRedeemed || (!coupon.image && !coupon.link)}
              className="relative"
            >
              Use Coupon
              {coupon.link && <ExternalLink className="ml-1 h-4 w-4" />}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRedeemClick}
              disabled={coupon.isRedeemed}
              className="relative"
            >
              Mark Redeemed
              <CheckSquare className="ml-1 h-4 w-4" />
            </Button>
            
            <div className="flex-grow"></div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleEdit}
              className="relative h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDeleteClick}
              className="relative h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <CouponDeleteDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
      />
      
      <CouponRedeemDialog 
        open={redeemDialogOpen}
        onOpenChange={setRedeemDialogOpen}
        onConfirm={handleRedeem}
      />
      
      <CouponImageDialog 
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        coupon={coupon}
      />
    </>
  );
};

export default CouponCard;
