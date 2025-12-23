import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button, Card, CardContent, Badge, Input, Select } from "@/components/ui";

// Mock job data
const jobs = [
  {
    id: "1",
    title: "Senior Software Engineer",
    company: "TechCorp Philippines",
    location: "Makati City",
    type: "FULL_TIME",
    salary: { min: 80000, max: 120000 },
    posted: "2024-01-15",
    description: "We are looking for an experienced software engineer to join our team...",
    skills: ["React", "Node.js", "TypeScript"],
  },
  {
    id: "2",
    title: "Product Manager",
    company: "StartupHub",
    location: "BGC, Taguig",
    type: "FULL_TIME",
    salary: { min: 70000, max: 100000 },
    posted: "2024-01-14",
    description: "Join our product team to drive innovation...",
    skills: ["Product Strategy", "Agile", "Data Analysis"],
  },
  {
    id: "3",
    title: "UI/UX Designer",
    company: "DesignStudio",
    location: "Cebu City",
    type: "FULL_TIME",
    salary: { min: 50000, max: 75000 },
    posted: "2024-01-16",
    description: "Create beautiful and intuitive user experiences...",
    skills: ["Figma", "UI Design", "User Research"],
  },
  {
    id: "4",
    title: "Marketing Manager",
    company: "BrandCo",
    location: "Makati City",
    type: "FULL_TIME",
    salary: { min: 60000, max: 90000 },
    posted: "2024-01-13",
    description: "Lead our marketing initiatives...",
    skills: ["Digital Marketing", "SEO", "Content Strategy"],
  },
  {
    id: "5",
    title: "Data Analyst",
    company: "Analytics Inc",
    location: "Quezon City",
    type: "FULL_TIME",
    salary: { min: 45000, max: 65000 },
    posted: "2024-01-12",
    description: "Transform data into actionable insights...",
    skills: ["SQL", "Python", "Tableau"],
  },
  {
    id: "6",
    title: "Customer Success Manager",
    company: "SaaS Company",
    location: "Remote",
    type: "FULL_TIME",
    salary: { min: 55000, max: 80000 },
    posted: "2024-01-11",
    description: "Ensure customer satisfaction and retention...",
    skills: ["Customer Service", "CRM", "Communication"],
  },
];

const employmentTypes = [
  { value: "", label: "All Types" },
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "INTERNSHIP", label: "Internship" },
];

const locations = [
  { value: "", label: "All Locations" },
  { value: "Makati City", label: "Makati City" },
  { value: "BGC, Taguig", label: "BGC, Taguig" },
  { value: "Cebu City", label: "Cebu City" },
  { value: "Quezon City", label: "Quezon City" },
  { value: "Remote", label: "Remote" },
];

function formatSalary(min: number, max: number) {
  return `₱${(min / 1000).toFixed(0)}K - ₱${(max / 1000).toFixed(0)}K`;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function formatEmploymentType(type: string) {
  return type.replace("_", "-").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function JobsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow">
        {/* Search Header */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input placeholder="Job title, keyword, or company" />
              </div>
              <div className="w-full md:w-48">
                <Select options={locations} placeholder="Location" />
              </div>
              <div className="w-full md:w-48">
                <Select options={employmentTypes} placeholder="Job Type" />
              </div>
              <Button>Search</Button>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{jobs.length}</span> jobs
              </p>
              <Select
                options={[
                  { value: "recent", label: "Most Recent" },
                  { value: "salary_high", label: "Highest Salary" },
                  { value: "salary_low", label: "Lowest Salary" },
                ]}
                className="w-44"
              />
            </div>

            <div className="space-y-4">
              {jobs.map((job) => (
                <Link href={`/jobs/${job.id}`} key={job.id}>
                  <Card variant="bordered" className="card-hover">
                    <CardContent>
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        {/* Company Logo */}
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-xl flex items-center justify-center text-2xl font-bold text-blue-600 flex-shrink-0">
                          {job.company[0]}
                        </div>

                        {/* Job Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {job.title}
                              </h3>
                              <p className="text-gray-600">{job.company}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-emerald-600">
                                {formatSalary(job.salary.min, job.salary.max)}
                              </p>
                              <p className="text-sm text-gray-400">
                                {formatDate(job.posted)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <div className="flex items-center text-sm text-gray-500">
                              <svg
                                className="w-4 h-4 mr-1"
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
                            <Badge variant="info">
                              {formatEmploymentType(job.type)}
                            </Badge>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {job.skills.map((skill) => (
                              <Badge key={skill} variant="default">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="primary" size="sm">
                  1
                </Button>
                <Button variant="ghost" size="sm">
                  2
                </Button>
                <Button variant="ghost" size="sm">
                  3
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </nav>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
