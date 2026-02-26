import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

  const handleSignUp = () => {
    navigate("/signup")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-20 lg:pt-32 lg:pb-32">
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
              <Button size="lg" className="gap-2" onClick={handleSignUp}>
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
                <Button size="lg" variant="secondary" className="gap-2" onClick={handleSignUp}>
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
    description: "Expert designed learning paths that adapt to your pace and learning style.",
  },
  {
    icon: IconSparkles,
    title: "Smart Reminders",
    description: "Never miss a lesson with intelligent notifications that fit your schedule.",
  },
]
