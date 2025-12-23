import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button, Card, CardContent, Badge } from "@/components/ui";

// Featured job categories
const categories = [
  { name: "Technology", icon: "💻", count: 1234 },
  { name: "Healthcare", icon: "🏥", count: 856 },
  { name: "Finance", icon: "💰", count: 642 },
  { name: "Marketing", icon: "📢", count: 521 },
  { name: "Engineering", icon: "⚙️", count: 487 },
  { name: "Sales", icon: "📈", count: 398 },
];

// Mock featured jobs
const featuredJobs = [
  {
    id: "1",
    title: "Senior Software Engineer",
    company: "TechCorp Philippines",
    location: "Makati City",
    type: "Full-time",
    salary: "₱80,000 - ₱120,000",
    posted: "2 days ago",
  },
  {
    id: "2",
    title: "Product Manager",
    company: "StartupHub",
    location: "BGC, Taguig",
    type: "Full-time",
    salary: "₱70,000 - ₱100,000",
    posted: "3 days ago",
  },
  {
    id: "3",
    title: "UI/UX Designer",
    company: "DesignStudio",
    location: "Cebu City",
    type: "Full-time",
    salary: "₱50,000 - ₱75,000",
    posted: "1 day ago",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-600 text-white">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Find Your Dream Job
                <br />
                <span className="text-emerald-300">in the Philippines</span>
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Connect with thousands of employers and discover opportunities
                that match your skills and ambitions.
              </p>

              {/* Search Box */}
              <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-xl p-2 shadow-2xl">
                  <form className="flex flex-col md:flex-row gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Job title or keyword"
                        className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Location"
                        className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <Button size="lg" className="md:w-auto">
                      Search Jobs
                    </Button>
                  </form>
                </div>
                <p className="text-sm text-blue-200 mt-4">
                  Popular: Software Engineer, Nurse, Accountant, Marketing
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white py-12 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-blue-600">
                  10K+
                </div>
                <div className="text-gray-600">Active Jobs</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-emerald-600">
                  5K+
                </div>
                <div className="text-gray-600">Companies</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-blue-600">
                  50K+
                </div>
                <div className="text-gray-600">Job Seekers</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-emerald-600">
                  15K+
                </div>
                <div className="text-gray-600">Placements</div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Browse by Category
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explore opportunities across various industries and find the
                perfect role for your career.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link href={`/jobs?category=${category.name}`} key={category.name}>
                  <Card
                    variant="bordered"
                    className="p-6 text-center card-hover cursor-pointer"
                  >
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <h3 className="font-semibold text-gray-900">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {category.count.toLocaleString()} jobs
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Jobs Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Featured Jobs
                </h2>
                <p className="text-gray-600">
                  Hand-picked opportunities from top employers
                </p>
              </div>
              <Link href="/jobs">
                <Button variant="outline">View All Jobs</Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <Link href={`/jobs/${job.id}`} key={job.id}>
                  <Card variant="bordered" className="h-full card-hover">
                    <CardContent>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-lg flex items-center justify-center text-xl font-bold text-blue-600">
                          {job.company[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {job.title}
                          </h3>
                          <p className="text-gray-600 text-sm">{job.company}</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {job.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {job.salary}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <Badge variant="info">{job.type}</Badge>
                        <span className="text-xs text-gray-400">
                          {job.posted}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* For Employers CTA */}
        <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">
                  Looking to Hire Top Talent?
                </h2>
                <p className="text-gray-300 mb-6">
                  Post your job openings and connect with thousands of qualified
                  candidates. Our platform makes hiring simple and efficient.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-emerald-400 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Access to verified candidates
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-emerald-400 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Applicant tracking system
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-emerald-400 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Direct messaging with candidates
                  </li>
                </ul>
                <Link href="/for-employers">
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                    Post a Job Now
                  </Button>
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-2xl p-8 backdrop-blur">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold">24hrs</div>
                      <div className="text-sm text-gray-300">
                        Avg. time to first applicant
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold">85%</div>
                      <div className="text-sm text-gray-300">
                        Hiring success rate
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold">50+</div>
                      <div className="text-sm text-gray-300">
                        Applicants per job
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold">4.8★</div>
                      <div className="text-sm text-gray-300">
                        Employer rating
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
