
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Archive, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCoupons } from "@/contexts/CouponContext";
import CouponCard from "./CouponCard";
import { Coupon } from "@/lib/types";

const CouponList = () => {
  const { coupons, loading } = useCoupons();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "active" | "inactive">("all");

  const handleCreateCoupon = () => {
    navigate("/create");
  };

  // Filter coupons based on search and filter type
  const filteredCoupons = coupons.filter((coupon) => {
    // Apply search filter
    const matchesSearch =
      searchTerm === "" ||
      coupon.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.amount.toLowerCase().includes(searchTerm.toLowerCase());

    // Check if coupon is active (not redeemed and not expired)
    const isExpired = coupon.expiryDate ? new Date() > new Date(coupon.expiryDate) : false;
    const isInactive = coupon.isRedeemed || isExpired;

    // Apply status filter
    if (filterType === "all") {
      return matchesSearch;
    } else if (filterType === "active") {
      return matchesSearch && !isInactive;
    } else { // inactive
      return matchesSearch && isInactive;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-2xl font-bold">Your Coupons</h1>
        <Button onClick={handleCreateCoupon}>
          <Plus className="mr-2 h-4 w-4" />
          Add Coupon
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-grow relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search coupons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            onClick={() => setFilterType("all")}
            className="flex-1 sm:flex-none"
          >
            <Layers className="mr-2 h-4 w-4" />
            All
          </Button>
          
          <Button
            variant={filterType === "active" ? "default" : "outline"}
            onClick={() => setFilterType("active")}
            className="flex-1 sm:flex-none"
          >
            Active
          </Button>
          
          <Button
            variant={filterType === "inactive" ? "default" : "outline"}
            onClick={() => setFilterType("inactive")}
            className="flex-1 sm:flex-none"
          >
            <Archive className="mr-2 h-4 w-4" />
            Redeemed/Expired
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="coupon-card animate-pulse"
            >
              <div className="h-32"></div>
            </div>
          ))}
        </div>
      ) : filteredCoupons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <Layers className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium">No coupons found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? "Try adjusting your search or filters"
              : "You don't have any coupons yet"}
          </p>
          <Button onClick={handleCreateCoupon}>
            Add Your First Coupon
          </Button>
        </div>
      )}
    </div>
  );
};

export default CouponList;
