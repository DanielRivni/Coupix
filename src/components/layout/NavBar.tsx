
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, UserCircle, Home, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { toast } from "sonner";

const NavBar = () => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      // Navigate is now handled by the logout function in AuthContext
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  const navItems = [
    { label: "Home", icon: <Home className="mr-2 h-4 w-4" />, path: "/" },
    { label: "Profile", icon: <UserCircle className="mr-2 h-4 w-4" />, path: "/profile" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link 
            to="/" 
            className="text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent"
          >
            Coupix
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            className="mr-2"
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {currentUser ? (
            <>
              <div className="hidden sm:flex sm:items-center sm:gap-4">
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    asChild
                  >
                    <Link to={item.path} className="flex items-center">
                      {item.icon}
                      {item.label}
                    </Link>
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="flex items-center"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>

              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild className="sm:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader className="mb-4">
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-2">
                    {navItems.map((item) => (
                      <SheetClose asChild key={item.path}>
                        <Button
                          variant="ghost"
                          className="justify-start"
                          onClick={() => {
                            navigate(item.path);
                            setIsSheetOpen(false);
                          }}
                        >
                          {item.icon}
                          {item.label}
                        </Button>
                      </SheetClose>
                    ))}
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    