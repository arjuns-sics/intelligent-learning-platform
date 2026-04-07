/**
 * Admin User Management Page
 * Allows administrators to view, search, filter, and manage user accounts
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconSearch,
  IconArrowLeft,
  IconTrash,
  IconUserEdit,
  IconChevronLeft,
  IconChevronRight,
  IconAlertTriangle,
  IconLoader2,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import {
  getAllUsers,
  deleteUser,
  updateUserRole,
  type UserWithPagination,
} from "@/services/admin.service";
import type { User } from "@/services/api-client";

export function AdminUsersPage() {
  const navigate = useNavigate();

  // State
  const [usersData, setUsersData] = useState<UserWithPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Role change dialog
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<"Student" | "Instructor" | "Admin">("Student");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [currentPage, roleFilter, sortBy, sortOrder]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getAllUsers(
        currentPage,
        limit,
        search || undefined,
        roleFilter !== "All" ? roleFilter : undefined,
        sortBy,
        sortOrder
      );

      if (response.success && response.data) {
        setUsersData(response.data);
      } else {
        setError(response.message || "Failed to load users");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Load users error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadUsers();
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      const response = await deleteUser(userToDelete._id);

      if (response.success) {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        loadUsers();
      } else {
        setError(response.message || "Failed to delete user");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Delete user error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRoleChangeClick = (user: User) => {
    setUserToEdit(user);
    setNewRole(user.role);
    setRoleDialogOpen(true);
  };

  const handleRoleChangeConfirm = async () => {
    if (!userToEdit) return;

    try {
      setIsUpdating(true);
      const response = await updateUserRole(userToEdit._id, { role: newRole });

      if (response.success) {
        setRoleDialogOpen(false);
        setUserToEdit(null);
        loadUsers();
      } else {
        setError(response.message || "Failed to update user role");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Update role error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Admin":
        return "destructive";
      case "Instructor":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <div className="container py-8 px-4 md:px-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <IconArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts, roles, and permissions
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter users</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
              </div>
            </div>

            <div>
              <Label htmlFor="role-filter">Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger id="role-filter">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Roles</SelectItem>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Instructor">Instructor</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <IconLoader2 className="size-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Apply Filters"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {usersData?.pagination.total || 0} users found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <IconLoader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              <p>{error}</p>
              <Button variant="outline" className="mt-4" onClick={loadUsers}>
                Retry
              </Button>
            </div>
          ) : !usersData || usersData.users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No users found</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("role")}
                          className="h-auto p-0 font-medium"
                        >
                          Role
                          {sortBy === "role" ? (
                            sortOrder === "asc" ? (
                              <IconSortAscending className="size-4 ml-1" />
                            ) : (
                              <IconSortDescending className="size-4 ml-1" />
                            )
                          ) : null}
                        </Button>
                      </TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersData.users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRoleChangeClick(user)}
                            >
                              <IconUserEdit className="size-4 mr-1" />
                              Edit Role
                            </Button>
                            {user.role !== "Admin" && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteClick(user)}
                              >
                                <IconTrash className="size-4 mr-1" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * limit) + 1} to{" "}
                  {Math.min(currentPage * limit, usersData.pagination.total)} of{" "}
                  {usersData.pagination.total} users
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <IconChevronLeft className="size-4" />
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {usersData.pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(usersData.pagination.pages, p + 1))}
                    disabled={currentPage === usersData.pagination.pages}
                  >
                    <IconChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconAlertTriangle className="size-5 text-destructive" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the user "{userToDelete?.name}"?
              This action cannot be undone and will remove all associated enrollments.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <IconLoader2 className="size-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconUserEdit className="size-5 text-primary" />
              Change User Role
            </DialogTitle>
            <DialogDescription>
              Change the role for "{userToEdit?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-role">New Role</Label>
            <Select value={newRole} onValueChange={(value: "Student" | "Instructor" | "Admin") => setNewRole(value)}>
              <SelectTrigger id="new-role" className="mt-2">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Student">Student</SelectItem>
                <SelectItem value="Instructor">Instructor</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRoleDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRoleChangeConfirm}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <IconLoader2 className="size-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Role"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
