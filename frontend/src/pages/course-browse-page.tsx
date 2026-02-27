/**
 * Course Browse Page
 * A comprehensive course catalog for students to browse, search, and filter courses
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  IconBook,
  IconSearch,
  IconFilter,
  IconLayoutGrid,
  IconList,
  IconStar,
  IconClock,
  IconUsers,
  IconHeart,
  IconHeartFilled,
  IconCategory,
  IconX,
  IconRefresh,
  IconSparkles,
  IconTrendingUp,
  IconBook2,
  IconPlayerPlay,
} from "@tabler/icons-react";

// Icon alias for grid view
const IconGrid = IconLayoutGrid;

// Mock course data
const mockCourses = [
  {
    id: 1,
    title: "Introduction to Machine Learning",
    description: "Learn the fundamentals of machine learning, including supervised and unsupervised learning algorithms, neural networks, and practical applications.",
    instructor: "Dr. Sarah Chen",
    category: "Data Science",
    difficulty: "Intermediate",
    duration: "24 hours",
    modules: 12,
    students: 15420,
    rating: 4.8,
    reviews: 2340,
    tags: ["Python", "TensorFlow", "Neural Networks"],
    bestseller: true,
    isNew: false,
    lastUpdated: "2026-02-15",
  },
  {
    id: 2,
    title: "Advanced React Patterns",
    description: "Master advanced React patterns including compound components, render props, custom hooks, and state management techniques.",
    instructor: "Michael Torres",
    category: "Web Development",
    difficulty: "Advanced",
    duration: "16 hours",
    modules: 8,
    students: 8930,
    rating: 4.9,
    reviews: 1560,
    tags: ["React", "TypeScript", "Patterns"],
    bestseller: true,
    isNew: false,
    lastUpdated: "2026-02-10",
  },
  {
    id: 3,
    title: "Python for Data Analysis",
    description: "Comprehensive guide to using Python for data analysis with pandas, numpy, and visualization libraries.",
    instructor: "Dr. Emily Watson",
    category: "Programming",
    difficulty: "Beginner",
    duration: "20 hours",
    modules: 10,
    students: 24500,
    rating: 4.7,
    reviews: 3200,
    tags: ["Python", "Pandas", "Data Analysis"],
    bestseller: false,
    isNew: false,
    lastUpdated: "2026-01-20",
  },
  {
    id: 4,
    title: "UI/UX Design Fundamentals",
    description: "Learn the principles of user interface and user experience design, from wireframing to prototyping.",
    instructor: "Alex Rivera",
    category: "Design",
    difficulty: "Beginner",
    duration: "30 hours",
    modules: 15,
    students: 12800,
    rating: 4.6,
    reviews: 1890,
    tags: ["Figma", "UI Design", "UX Research"],
    bestseller: false,
    isNew: false,
    lastUpdated: "2026-02-01",
  },
  {
    id: 5,
    title: "Deep Learning Specialization",
    description: "Dive deep into neural networks, CNNs, RNNs, and transformers. Build real-world AI applications.",
    instructor: "Dr. Andrew Chen",
    category: "Data Science",
    difficulty: "Advanced",
    duration: "40 hours",
    modules: 18,
    students: 9800,
    rating: 4.9,
    reviews: 1450,
    tags: ["Deep Learning", "Neural Networks", "AI"],
    bestseller: true,
    isNew: false,
    lastUpdated: "2026-02-12",
  },
  {
    id: 6,
    title: "TypeScript Masterclass",
    description: "Master TypeScript from basics to advanced types, generics, and integration with modern frameworks.",
    instructor: "Matt Pocock",
    category: "Web Development",
    difficulty: "Intermediate",
    duration: "18 hours",
    modules: 9,
    students: 7500,
    rating: 4.8,
    reviews: 980,
    tags: ["TypeScript", "JavaScript", "Types"],
    bestseller: false,
    isNew: true,
    lastUpdated: "2026-02-20",
  },
  {
    id: 7,
    title: "Data Visualization with D3.js",
    description: "Create stunning interactive data visualizations using D3.js library for web applications.",
    instructor: "Shirley Wu",
    category: "Data Science",
    difficulty: "Intermediate",
    duration: "22 hours",
    modules: 11,
    students: 5600,
    rating: 4.7,
    reviews: 720,
    tags: ["D3.js", "Visualization", "JavaScript"],
    bestseller: false,
    isNew: false,
    lastUpdated: "2026-01-25",
  },
  {
    id: 8,
    title: "Cloud Architecture on AWS",
    description: "Design and implement scalable, reliable cloud architectures using Amazon Web Services.",
    instructor: "Ryan Johnson",
    category: "Cloud Computing",
    difficulty: "Advanced",
    duration: "35 hours",
    modules: 14,
    students: 11200,
    rating: 4.8,
    reviews: 1680,
    tags: ["AWS", "Cloud", "DevOps"],
    bestseller: true,
    isNew: false,
    lastUpdated: "2026-02-08",
  },
  {
    id: 9,
    title: "Blockchain Development",
    description: "Build decentralized applications on Ethereum. Learn smart contracts and Web3 integration.",
    instructor: "Vitalik More",
    category: "Blockchain",
    difficulty: "Advanced",
    duration: "28 hours",
    modules: 12,
    students: 6800,
    rating: 4.5,
    reviews: 890,
    tags: ["Blockchain", "Ethereum", "Smart Contracts"],
    bestseller: false,
    isNew: true,
    lastUpdated: "2026-02-18",
  },
  {
    id: 10,
    title: "Mobile App Development with React Native",
    description: "Build cross-platform mobile applications using React Native for iOS and Android.",
    instructor: "Sophie Martin",
    category: "Mobile Development",
    difficulty: "Intermediate",
    duration: "26 hours",
    modules: 13,
    students: 9200,
    rating: 4.7,
    reviews: 1120,
    tags: ["React Native", "Mobile", "JavaScript"],
    bestseller: false,
    isNew: false,
    lastUpdated: "2026-02-05",
  },
  {
    id: 11,
    title: "Cybersecurity Fundamentals",
    description: "Learn essential cybersecurity concepts, ethical hacking, and security best practices.",
    instructor: "Kevin Mitnick",
    category: "Security",
    difficulty: "Beginner",
    duration: "24 hours",
    modules: 10,
    students: 18500,
    rating: 4.8,
    reviews: 2450,
    tags: ["Security", "Hacking", "Networks"],
    bestseller: true,
    isNew: false,
    lastUpdated: "2026-02-14",
  },
  {
    id: 12,
    title: "GraphQL API Development",
    description: "Master GraphQL API development with Node.js, Apollo Server, and database integration.",
    instructor: "Eve Porcello",
    category: "Web Development",
    difficulty: "Intermediate",
    duration: "14 hours",
    modules: 7,
    students: 4300,
    rating: 4.6,
    reviews: 580,
    tags: ["GraphQL", "API", "Node.js"],
    bestseller: false,
    isNew: true,
    lastUpdated: "2026-02-19",
  },
];

// Categories for filtering
const categories = [
  "All Categories",
  "Data Science",
  "Web Development",
  "Programming",
  "Design",
  "Cloud Computing",
  "Blockchain",
  "Mobile Development",
  "Security",
];

// Difficulty levels
const difficultyLevels = ["All Levels", "Beginner", "Intermediate", "Advanced"];

// Sort options
const sortOptions = [
  { label: "Most Popular", value: "popular" },
  { label: "Highest Rated", value: "rating" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "priceAsc" },
  { label: "Price: High to Low", value: "priceDesc" },
];

// Category details for browse section
const categoryDetails: Record<string, { color: string; bgColor: string }> = {
  "Data Science": { color: "text-blue-500", bgColor: "bg-blue-500/10" },
  "Web Development": { color: "text-green-500", bgColor: "bg-green-500/10" },
  "Programming": { color: "text-purple-500", bgColor: "bg-purple-500/10" },
  "Design": { color: "text-pink-500", bgColor: "bg-pink-500/10" },
  "Cloud Computing": { color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
  "Blockchain": { color: "text-orange-500", bgColor: "bg-orange-500/10" },
  "Mobile Development": { color: "text-indigo-500", bgColor: "bg-indigo-500/10" },
  "Security": { color: "text-red-500", bgColor: "bg-red-500/10" },
};

// Course Card Component
interface CourseCardProps {
  course: typeof mockCourses[0];
  isFavorite: boolean;
  onToggleFavorite: () => void;
  viewMode: "grid" | "list";
}

function CourseCard({ course, isFavorite, onToggleFavorite, viewMode }: CourseCardProps) {

  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all group">
        <div className="flex flex-col sm:flex-row">
          {/* Course Image/Thumbnail */}
          <div className="relative w-full sm:w-48 h-40 sm:h-auto shrink-0 bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <IconBook className="size-12 text-primary/40" />
            {course.bestseller && (
              <Badge className="absolute top-3 left-3 bg-amber-500 hover:bg-amber-500">
                Bestseller
              </Badge>
            )}
            {course.isNew && !course.bestseller && (
              <Badge variant="secondary" className="absolute top-3 left-3">
                New
              </Badge>
            )}
          </div>

          <div className="flex-1 p-4">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">{course.category}</Badge>
                  <Badge
                    variant="secondary"
                    className={
                      course.difficulty === "Beginner" ? "text-green-600 dark:text-green-400" :
                        course.difficulty === "Intermediate" ? "text-blue-600 dark:text-blue-400" :
                          "text-red-600 dark:text-red-400"
                    }
                  >
                    {course.difficulty}
                  </Badge>
                </div>
                <Link to={`/courses/${course.id}`}>
                  <h3 className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground mb-2">{course.instructor}</p>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{course.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <IconStar className="size-4 text-amber-500 fill-amber-500" />
                    <span className="font-medium text-foreground">{course.rating}</span>
                    <span>({course.reviews.toLocaleString()})</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <IconUsers className="size-4" />
                    {course.students.toLocaleString()} students
                  </span>
                  <span className="flex items-center gap-1">
                    <IconClock className="size-4" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <IconBook className="size-4" />
                    {course.modules} modules
                  </span>
                </div>
              </div>

              <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 lg:gap-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onToggleFavorite();
                  }}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  {isFavorite ? (
                    <IconHeartFilled className="size-5 text-red-500" />
                  ) : (
                    <IconHeart className="size-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Button className="flex-1 sm:flex-none" asChild>
                <Link to={`/courses/${course.id}`}>
                  <IconPlayerPlay className="size-4 mr-2" />
                  View Course
                </Link>
              </Button>
              <Button variant="outline">Preview</Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all group h-full flex flex-col">
      {/* Course Image/Thumbnail */}
      <div className="relative h-40 bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
        <IconBook className="size-16 text-primary/30" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {course.bestseller && (
            <Badge className="bg-amber-500 hover:bg-amber-500">
              Bestseller
            </Badge>
          )}
          {course.isNew && !course.bestseller && (
            <Badge variant="secondary">
              New
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite();
          }}
          className="absolute top-3 right-3 p-2 bg-background/80 hover:bg-background rounded-full transition-colors backdrop-blur-sm"
        >
          {isFavorite ? (
            <IconHeartFilled className="size-4 text-red-500" />
          ) : (
            <IconHeart className="size-4" />
          )}
        </button>

      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs">{course.category}</Badge>
          <Badge
            variant="secondary"
            className={
              course.difficulty === "Beginner" ? "text-green-600 dark:text-green-400" :
                course.difficulty === "Intermediate" ? "text-blue-600 dark:text-blue-400" :
                  "text-red-600 dark:text-red-400"
            }
          >
            {course.difficulty}
          </Badge>
        </div>
        <Link to={`/courses/${course.id}`}>
          <CardTitle className="line-clamp-2 text-base group-hover:text-primary transition-colors">
            {course.title}
          </CardTitle>
        </Link>
        <CardDescription className="text-sm">{course.instructor}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{course.description}</p>

        {/* Course Stats */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <IconStar className="size-4 text-amber-500 fill-amber-500" />
            <span className="font-medium text-foreground">{course.rating}</span>
            <span>({course.reviews})</span>
          </span>
          <span className="flex items-center gap-1">
            <IconUsers className="size-4" />
            {course.students.toLocaleString()}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {course.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className=" flex items-center justify-between border-t pt-4">
        <Button size="sm" asChild>
          <Link to={`/courses/${course.id}`}>
            Enroll Now
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function CourseBrowsePage() {
  // View and filter states
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All Levels");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(true);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 9;

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let result = [...mockCourses];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.instructor.toLowerCase().includes(query) ||
          course.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== "All Categories") {
      result = result.filter((course) => course.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== "All Levels") {
      result = result.filter((course) => course.difficulty === selectedDifficulty);
    }



    // Sort
    switch (sortBy) {
      case "popular":
        result.sort((a, b) => b.students - a.students);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, selectedDifficulty, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * coursesPerPage,
    currentPage * coursesPerPage
  );

  // Toggle favorite
  const toggleFavorite = (courseId: number) => {
    setFavorites((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setSelectedDifficulty("All Levels");
    setSelectedPriceRange("all");
    setSortBy("popular");
    setCurrentPage(1);
  };

  // Get featured courses for the banner
  const featuredCourses = mockCourses.filter((c) => c.bestseller).slice(0, 3);

  // Count active filters
  const activeFilterCount = [
    selectedCategory !== "All Categories",
    selectedDifficulty !== "All Levels",
    selectedPriceRange !== "all",
    searchQuery.trim() !== "",
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Featured Course */}
      <section className="relative overflow-hidden bg-linear-to-br from-primary/5 via-background to-background border-b">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 translate-x-1/3 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl opacity-50 -translate-x-1/3 translate-y-1/2" />
        </div>

        <div className="container py-8 px-4 md:px-6 max-w-7xl">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                Explore Courses
              </h1>
              <p className="text-muted-foreground">
                Discover {mockCourses.length}+ courses to advance your skills and career
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-1 px-3 py-1.5">
                <IconSparkles className="size-3.5 text-amber-500" />
                Personalized for you
              </Badge>
            </div>
          </div>

          {/* Featured Courses */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {featuredCourses.map((course) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="group relative overflow-hidden rounded-xl border bg-card hover:shadow-lg transition-all"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-primary/70 to-primary/50" />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                      <IconTrendingUp className="size-3 mr-1" />
                      Bestseller
                    </Badge>
                    <div className="flex items-center gap-1 text-sm">
                      <IconStar className="size-4 text-amber-500 fill-amber-500" />
                      <span className="font-medium">{course.rating}</span>
                    </div>
                  </div>
                  <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{course.instructor}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <IconUsers className="size-3.5" />
                      {course.students.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <IconClock className="size-3.5" />
                      {course.duration}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="container py-6 px-4 md:px-6 max-w-7xl">
        {/* Search and Filter Bar */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search courses, instructors, or topics..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 h-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <IconX className="size-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <IconFilter className="size-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>

              <div className="flex border rounded-md overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  className="rounded-none h-10 w-10"
                  onClick={() => setViewMode("grid")}
                >
                  <IconGrid className="size-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  className="rounded-none h-10 w-10"
                  onClick={() => setViewMode("list")}
                >
                  <IconList className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg border">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <IconCategory className="size-4" />
                Category:
              </div>
              <Select
                value={selectedCategory}
                onValueChange={(value) => {
                  setSelectedCategory(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Separator orientation="vertical" className="h-8 hidden sm:block" />

              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <IconBook2 className="size-4" />
                Level:
              </div>
              <Select
                value={selectedDifficulty}
                onValueChange={(value) => {
                  setSelectedDifficulty(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficultyLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Separator orientation="vertical" className="h-8 hidden sm:block" />

              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                Sort:
              </div>
              <Select
                value={sortBy}
                onValueChange={(value) => {
                  setSortBy(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {activeFilterCount > 0 && (
                <>
                  <Separator orientation="vertical" className="h-8 hidden sm:block" />
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1">
                    <IconRefresh className="size-3.5" />
                    Reset
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredCourses.length}</span> courses
            {searchQuery && (
              <span>
                {" "}
                for "<span className="font-medium text-foreground">{searchQuery}</span>"
              </span>
            )}
          </p>

          {/* Quick Category Pills */}
          <div className="hidden lg:flex items-center gap-2">
            {categories.slice(0, 5).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className="text-xs"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Course Grid/List */}
        {filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <IconBook className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters to find what you're looking for
            </p>
            <Button variant="outline" onClick={resetFilters}>
              Clear all filters
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isFavorite={favorites.includes(course.id)}
                onToggleFavorite={() => toggleFavorite(course.id)}
                viewMode="grid"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isFavorite={favorites.includes(course.id)}
                onToggleFavorite={() => toggleFavorite(course.id)}
                viewMode="list"
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                return (
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
                );
              })
              .map((page, index, arr) => {
                if (index > 0 && page - arr[index - 1] > 1) {
                  return (
                    <span key={`ellipsis-${page}`} className="px-2 text-muted-foreground">
                      ...
                    </span>
                  );
                }
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-9"
                  >
                    {page}
                  </Button>
                );
              })}

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Browse by Category Section */}
      <section className="border-t bg-muted/20 py-12">
        <div className="container px-4 md:px-6 max-w-7xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Browse by Category</h2>
            <p className="text-muted-foreground">
              Explore courses organized by topic
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(1).map((category) => {
              const details = categoryDetails[category] || { color: "text-primary", bgColor: "bg-primary/10" };
              const count = mockCourses.filter(c => c.category === category).length;

              return (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentPage(1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="group p-4 rounded-xl border bg-card hover:shadow-md transition-all text-left"
                >
                  <div className={`size-12 rounded-lg ${details.bgColor} flex items-center justify-center mb-3`}>
                    <IconBook className={`size-6 ${details.color}`} />
                  </div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">{category}</h3>
                  <p className="text-sm text-muted-foreground">{count} courses</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <div className="container px-4 md:px-6 max-w-7xl">
          <Card className="bg-linear-to-br from-primary to-primary/80 text-primary-foreground border-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="relative z-10 py-12 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Can't find what you're looking for?
              </h2>
              <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
                Request a new course topic and our team will work on creating content tailored to your needs.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="lg" variant="secondary" className="gap-2">
                  Request a Course
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10 text-primary-foreground">
                  Browse All Topics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}