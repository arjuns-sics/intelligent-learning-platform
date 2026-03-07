import { Outlet, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks";
import {
  IconLogout,
  IconDashboard,
  IconChevronDown,
  IconBook,
  IconSchool,
  IconPlus
} from "@tabler/icons-react";
import { Toaster } from "sonner";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, role, logout } = useAuth();

  const handleSignIn = () => {
    navigate("/login");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  const handleLogout = () => {
    logout();
  };

  // Get role badge variant
  const getRoleBadgeVariant = () => {
    switch (role) {
      case "Admin":
        return "destructive";
      case "Instructor":
        return "default";
      case "Student":
      default:
        return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 text-primary-foreground">
                  <path d="M12 5.5V17.5" />
                  <path d="M15 14.5H18" />
                  <path d="M6 14.5H9" />
                  <path d="M15 10.5H18" />
                  <path d="M6 10.5H9" />
                  <path d="M12 17.5V5.5" />
                  <path d="M15 14.5H18" />
                  <path d="M6 14.5H9" />
                  <path d="M15 10.5H18" />
                  <path d="M6 10.5H9" />
                  <path d="M12 17.5V5.5" />
                  <circle cx="12" cy="18.5" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <path d="M5 12.5H19" />
                </svg>
              </div>
              <span className="text-lg font-semibold">Learnify</span>
            </div>

            <div className="hidden items-center gap-8 md:flex">
              {isAuthenticated ? (
                // Role-based navigation
                role === "Instructor" || role === "Admin" ? (
                  // Instructor/Admin navigation
                  <>
                    <Link to="/dashboard" className={`text-sm flex items-center gap-1.5 ${location.pathname === "/dashboard" ? "text-primary font-medium" : "text-muted-foreground"} hover:text-foreground transition-colors`}>
                      <IconSchool className="size-4" />
                      Dashboard
                    </Link>
                    <Link to="/courses/browse" className={`text-sm flex items-center gap-1.5 ${location.pathname === "/courses/browse" ? "text-primary font-medium" : "text-muted-foreground"} hover:text-foreground transition-colors`}>
                      <IconBook className="size-4" />
                      Browse Courses
                    </Link>
                  </>
                ) : (
                  // Student navigation
                  <>
                    <Link to="/dashboard" className={`text-sm ${location.pathname === "/dashboard" ? "text-primary font-medium" : "text-muted-foreground"} hover:text-foreground transition-colors`}>
                      Dashboard
                    </Link>
                    <Link to="/courses/browse" className={`text-sm flex items-center gap-1.5 ${location.pathname === "/courses/browse" ? "text-primary font-medium" : "text-muted-foreground"} hover:text-foreground transition-colors`}>
                      <IconBook className="size-4" />
                      Browse Courses
                    </Link>
                  </>
                )
              ) : (
                // Public navigation
                <>
                  <a href="/" className={`text-sm ${location.pathname === "/" ? "text-primary" : "text-muted-foreground"} hover:text-foreground transition-colors`}>Home</a>
                  <a href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                // Authenticated user menu
                <>
                  {/* Quick action button for instructors */}
                  {(role === "Instructor" || role === "Admin") && (
                    <Button size="sm" asChild className="hidden sm:inline-flex">
                      <Link to="/courses/create">
                        <IconPlus className="size-4 mr-1" />
                        New Course
                      </Link>
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          {user?.profile_image ? (
                            <img src={user.profile_image} alt={user.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-xs font-medium text-primary">{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
                          )}
                        </div>
                        <span className="hidden sm:inline max-w-24 truncate">{user?.name}</span>
                        {role && (
                          <Badge variant={getRoleBadgeVariant()} className="text-xs hidden lg:inline-flex">
                            {role}
                          </Badge>
                        )}
                        <IconChevronDown className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user?.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="cursor-pointer">
                          <IconDashboard className="mr-2 size-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                        <IconLogout className="mr-2 size-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <ThemeToggle />
                </>
              ) : (
                // Public auth buttons
                <>
                  <Button variant="ghost" size="sm" onClick={handleSignIn}>
                    Sign In
                  </Button>
                  <Button size="sm" onClick={handleSignUp}>Sign Up</Button>
                  <ThemeToggle />
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumbs */}
      {location.pathname !== "/" && location.pathname !== "/dashboard" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={isAuthenticated ? "/dashboard" : "/"}>Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{location.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-lg bg-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-primary-foreground">
                  <path d="M12 5.5V17.5" />
                  <path d="M15 14.5H18" />
                  <path d="M6 14.5H9" />
                  <path d="M15 10.5H18" />
                  <path d="M6 10.5H9" />
                  <path d="M12 17.5V5.5" />
                  <path d="M15 14.5H18" />
                  <path d="M6 14.5H9" />
                  <path d="M15 10.5H18" />
                  <path d="M6 10.5H9" />
                  <path d="M12 17.5V5.5" />
                  <circle cx="12" cy="18.5" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <path d="M5 12.5H19" />
                </svg>
              </div>
              <span className="text-sm font-medium">Learnify</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Learnify. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Toaster for notifications */}
      <Toaster position="top-right" richColors />
    </div>
  );
}
