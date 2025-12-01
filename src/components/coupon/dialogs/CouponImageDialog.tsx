
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Coupon } from "@/lib/types";

interface CouponImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: Coupon;
}

const CouponImageDialog = ({ open, onOpenChange, coupon }: CouponImageDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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
  );
};

export default CouponImageDialog;
