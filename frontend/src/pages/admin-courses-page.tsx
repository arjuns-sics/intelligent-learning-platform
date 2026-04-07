/**
 * Admin Course Management Page
 * Allows administrators to view, search, filter, and manage courses
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
  IconSearch,
  IconArrowLeft,
  IconTrash,
  IconEye,
  IconEyeOff,
  IconChevronLeft,
  IconChevronRight,
  IconAlertTriangle,
  IconLoader2,
  IconBook,
} from "@tabler/icons-react";
import {
  getAllCourses,
  deleteCourse,
  updateCourseStatus,
  type CourseWithPagination,
  type Course,
} from "@/services/admin.service";

export function AdminCoursesPage() {
  const navigate = useNavigate();

  // State
  const [coursesData, setCoursesData] = useState<CourseWithPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status change dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  const [newStatus, setNewStatus] = useState<"published" | "draft">("published");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadCourses();
  }, [currentPage, statusFilter, categoryFilter]);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getAllCourses(
        currentPage,
        limit,
        search || undefined,
        statusFilter !== "All" ? statusFilter : undefined,
        categoryFilter !== "All" ? categoryFilter : undefined,
      );

      if (response.success && response.data) {
        setCoursesData(response.data);
      } else {
        setError(response.message || "Failed to load courses");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Load courses error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCourses();
  };

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;

    try {
      setIsDeleting(true);
      const response = await deleteCourse(courseToDelete.id);

      if (response.success) {
        setDeleteDialogOpen(false);
        setCourseToDelete(null);
        loadCourses();
      } else {
        setError(response.message || "Failed to delete course");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Delete course error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChangeClick = (course: Course) => {
    setCourseToEdit(course);
    setNewStatus(course.status);
    setStatusDialogOpen(true);
  };

  const handleStatusChangeConfirm = async () => {
    if (!courseToEdit) return;

    try {
      setIsUpdating(true);
      const response = await updateCourseStatus(courseToEdit.id, {
        status: newStatus,
        published: newStatus === "published",
      });

      if (response.success) {
        setStatusDialogOpen(false);
        setCourseToEdit(null);
        loadCourses();
      } else {
        setError(response.message || "Failed to update course status");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Update status error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "published":
        return "outline";
      case "draft":
        return "secondary";
      default:
        return "default";
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
          <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage courses, content, and publications
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter courses</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-5">
            <div className="md:col-span-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Input
                  id="search"
                  placeholder="Search by title or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
              </div>
            </div>

            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category-filter">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category-filter">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="Development">Development</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="IT & Software">IT & Software</SelectItem>
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

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
          <CardDescription>
            {coursesData?.pagination.total || 0} courses found
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
              <Button variant="outline" className="mt-4" onClick={loadCourses}>
                Retry
              </Button>
            </div>
          ) : !coursesData || coursesData.courses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No courses found</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coursesData.courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium max-w-xs truncate">
                          {course.title}
                        </TableCell>
                        <TableCell>{course.instructor}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{course.category}</Badge>
                        </TableCell>
                        <TableCell>{course.level}</TableCell>
                        <TableCell>{course.enrolledStudents}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(course.status)}>
                            {course.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChangeClick(course)}
                            >
                              {course.status === "published" ? (
                                <>
                                  <IconEyeOff className="size-4 mr-1" />
                                  Unpublish
                                </>
                              ) : (
                                <>
                                  <IconEye className="size-4 mr-1" />
                                  Publish
                                </>
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick(course)}
                            >
                              <IconTrash className="size-4 mr-1" />
                              Delete
                            </Button>
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
                  {Math.min(currentPage * limit, coursesData.pagination.total)} of{" "}
                  {coursesData.pagination.total} courses
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
                    Page {currentPage} of {coursesData.pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(coursesData.pagination.pages, p + 1))}
                    disabled={currentPage === coursesData.pagination.pages}
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
              Are you sure you want to delete the course "{courseToDelete?.title}"?
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

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconBook className="size-5 text-primary" />
              Change Course Status
            </DialogTitle>
            <DialogDescription>
              Change the status for "{courseToEdit?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-status">New Status</Label>
            <Select
              value={newStatus}
              onValueChange={(value: "published" | "draft") => setNewStatus(value)}
            >
              <SelectTrigger id="new-status" className="mt-2">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusChangeConfirm}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <IconLoader2 className="size-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Table component helper
function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">{children}</table>
    </div>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead>{children}</thead>;
}

function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

function TableRow({ children }: { children: React.ReactNode }) {
  return (
    <tr className="border-b transition-colors hover:bg-muted/50">{children}</tr>
  );
}

function TableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground ${className}`}>
      {children}
    </th>
  );
}

function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`p-4 align-middle ${className}`}>{children}</td>
  );
}
