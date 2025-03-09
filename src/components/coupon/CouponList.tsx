
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Filter, SortAsc, SortDesc, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useCoupons } from "@/contexts/CouponContext";
import CouponCard from "./CouponCard";
import { Coupon } from "@/lib/types";

const CouponList = () => {
  const { coupons, loading } = useCoupons();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [sortField, setSortField] = useState<keyof Coupon>("createdAt");
  const [showRedeemed, setShowRedeemed] = useState(true);
  const [showExpired, setShowExpired] = useState(true);

  const handleCreateCoupon = () => {
    navigate("/create");
  };

  // Filter and sort coupons
  const filteredCoupons = coupons.filter((coupon) => {
    // Apply search filter
    const matchesSearch =
      searchTerm === "" ||
      coupon.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.amount.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply redeemed filter
    const matchesRedeemed = showRedeemed || !coupon.isRedeemed;

    // Apply expired filter
    const isExpired = coupon.expiryDate ? new Date() > new Date(coupon.expiryDate) : false;
    const matchesExpired = showExpired || !isExpired;

    return matchesSearch && matchesRedeemed && matchesExpired;
  });

  // Sort coupons
  const sortedCoupons = [...filteredCoupons].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Handle date comparisons
    if (sortField === "expiryDate") {
      aValue = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
      bValue = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
    } else if (sortField === "createdAt") {
      aValue = new Date(a.createdAt).getTime();
      bValue = new Date(b.createdAt).getTime();
    }

    // For amount, convert to number if possible
    if (sortField === "amount") {
      aValue = parseFloat(a.amount) || a.amount;
      bValue = parseFloat(b.amount) || b.amount;
    }

    // Apply sort order
    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
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
        <div className="flex-grow">
          <Input
            placeholder="Search coupons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filters</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={showRedeemed}
              onCheckedChange={setShowRedeemed}
            >
              Show Redeemed
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={showExpired}
              onCheckedChange={setShowExpired}
            >
              Show Expired
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex gap-2">
              {sortOrder === "asc" ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Sort</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => setSortField("createdAt")}
              className={sortField === "createdAt" ? "bg-muted" : ""}
            >
              Date Added
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortField("store")}
              className={sortField === "store" ? "bg-muted" : ""}
            >
              Store
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortField("amount")}
              className={sortField === "amount" ? "bg-muted" : ""}
            >
              Amount
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortField("expiryDate")}
              className={sortField === "expiryDate" ? "bg-muted" : ""}
            >
              Expiry Date
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Order</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => setSortOrder("asc")}
              className={sortOrder === "asc" ? "bg-muted" : ""}
            >
              Ascending
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortOrder("desc")}
              className={sortOrder === "desc" ? "bg-muted" : ""}
            >
              Descending
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
      ) : sortedCoupons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedCoupons.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <ListFilter className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
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
