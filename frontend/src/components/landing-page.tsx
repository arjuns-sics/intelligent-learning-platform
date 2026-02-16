import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  IconBook,
  IconBrain,
  IconChartLine,
  IconDeviceDesktop,
  IconUsers,
  IconRocket,
  IconSparkles,
  IconArrowRight,
  IconPlayerPlay,
  IconStar,
} from "@tabler/icons-react"

import { useNavigate } from "react-router-dom"

export function LandingPage() {
  const navigate = useNavigate()

  const handleSignIn = () => {
    navigate("/login")
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                <IconBrain className="size-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">Learnify</span>
            </div>

            <div className="hidden items-center gap-8 md:flex">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
              <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleSignIn}>
                Sign In
              </Button>
              <Button size="sm" onClick={() => navigate("/signup")}>Sign Up</Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-150 bg-primary/10 rounded-full blur-3xl opacity-30" />
        </div>

        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6">
              <IconSparkles className="size-3 mr-1" />
              AI-Powered Learning Platform
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              Master Any Skill with{" "}
              <span className="text-primary">Intelligent Learning</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Personalized learning paths, adaptive assessments, and AI-driven insights
              help you learn faster and retain more. Transform the way you acquire knowledge.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="gap-2">
                Start Learning Free
                <IconArrowRight className="size-4" />
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <IconPlayerPlay className="size-4" />
                Watch Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="size-8 rounded-full bg-linear-to-br from-primary/80 to-primary border-2 border-background"
                    />
                  ))}
                </div>
                <span>10,000+ learners</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <IconStar key={i} className="size-4 text-primary fill-primary" />
                ))}
                <span className="ml-1">4.9/5 rating</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
                <div className="size-3 rounded-full bg-destructive/60" />
                <div className="size-3 rounded-full bg-yellow-500/60" />
                <div className="size-3 rounded-full bg-green-500/60" />
              </div>
              <div className="aspect-video bg-linear-to-br from-muted to-muted/50 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <IconBook className="size-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Interactive Dashboard Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to Learn Effectively
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform combines cutting-edge AI with proven learning methodologies
              to deliver an unmatched educational experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="size-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Start Learning in 3 Simple Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Choose Your Path",
                description: "Select from hundreds of curated learning paths or let our AI create a personalized curriculum just for you.",
                icon: IconRocket,
              },
              {
                step: "02",
                title: "Learn Actively",
                description: "Engage with interactive content, quizzes, and hands-on projects designed to maximize retention.",
                icon: IconBrain,
              },
              {
                step: "03",
                title: "Track Progress",
                description: "Monitor your advancement with detailed analytics and adjust your learning strategy in real-time.",
                icon: IconChartLine,
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-primary/10 absolute -top-4 left-0">{item.step}</div>
                <div className="pt-8">
                  <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="size-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: "10K+", label: "Active Learners" },
              { value: "500+", label: "Courses Available" },
              { value: "95%", label: "Completion Rate" },
              { value: "4.9", label: "Average Rating" },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-4xl lg:text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-primary-foreground/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Loved by Learners Worldwide
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <IconStar key={i} className="size-4 text-primary fill-primary" />
                    ))}
                  </div>
                  <CardDescription className="text-foreground/80 text-base">
                    "{testimonial.quote}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-linear-to-br from-primary/60 to-primary flex items-center justify-center text-primary-foreground font-semibold">
                      {testimonial.initials}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Card className="bg-linear-to-br from-primary to-primary/80 text-primary-foreground border-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="relative z-10 py-16 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Join thousands of learners who have accelerated their education with our
                AI-powered platform. Start your journey today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" variant="secondary" className="gap-2">
                  Get Started Free
                  <IconArrowRight className="size-4" />
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10 text-primary-foreground">
                  Contact Sales
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                  <IconBrain className="size-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold">Learnify</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering learners worldwide with AI-driven education.
              </p>
            </div>

            {footerLinks.map((section, index) => (
              <div key={index}>
                <h4 className="font-semibold mb-3">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Learnify. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: IconBrain,
    title: "AI-Powered Tutoring",
    description: "Get instant, personalized feedback and explanations from our advanced AI tutors available 24/7.",
  },
  {
    icon: IconChartLine,
    title: "Progress Analytics",
    description: "Track your learning journey with detailed insights and identify areas for improvement.",
  },
  {
    icon: IconDeviceDesktop,
    title: "Interactive Content",
    description: "Learn through engaging videos, quizzes, coding exercises, and hands-on projects.",
  },
  {
    icon: IconUsers,
    title: "Community Learning",
    description: "Connect with peers, join study groups, and collaborate on projects together.",
  },
  {
    icon: IconBook,
    title: "Curated Curriculum",
    description: "Expert-designed learning paths that adapt to your pace and learning style.",
  },
  {
    icon: IconSparkles,
    title: "Smart Reminders",
    description: "Never miss a lesson with intelligent notifications that fit your schedule.",
  },
]

const testimonials = [
  {
    quote: "This platform completely changed how I approach learning. The AI tutor feels like having a personal teacher available anytime.",
    name: "Sarah Chen",
    role: "Software Developer",
    initials: "SC",
  },
  {
    quote: "I've tried many learning platforms, but none come close to the quality and personalization offered here. Highly recommended!",
    name: "Marcus Johnson",
    role: "Data Scientist",
    initials: "MJ",
  },
  {
    quote: "The progress tracking helped me stay motivated. I completed my first certification in just 3 months!",
    name: "Emily Rodriguez",
    role: "UX Designer",
    initials: "ER",
  },
]

const footerLinks = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Integrations", "Changelog"],
  },
  {
    title: "Resources",
    links: ["Documentation", "Tutorials", "Blog", "Community"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Press", "Contact"],
  },
]