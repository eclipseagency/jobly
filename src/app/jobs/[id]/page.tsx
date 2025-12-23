import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button, Card, CardContent, Badge } from "@/components/ui";

// Mock job detail
const job = {
  id: "1",
  title: "Senior Software Engineer",
  company: {
    name: "TechCorp Philippines",
    industry: "Technology",
    size: "50-200 employees",
    location: "Makati City, Metro Manila",
    website: "https://techcorp.ph",
    verified: true,
  },
  location: "Makati City",
  type: "FULL_TIME",
  salary: { min: 80000, max: 120000 },
  posted: "2024-01-15",
  description: `
We are looking for an experienced Senior Software Engineer to join our growing team.
You will be responsible for designing, developing, and maintaining high-quality software solutions.

## About the Role

As a Senior Software Engineer at TechCorp, you will:
- Lead the development of new features and improvements
- Mentor junior developers and conduct code reviews
- Collaborate with product and design teams
- Contribute to architectural decisions
- Ensure code quality and best practices

## What We Offer

- Competitive salary and benefits
- Flexible work arrangements
- Health insurance for you and your dependents
- Professional development opportunities
- Modern tech stack and tools
  `,
  requirements: `
## Requirements

- 5+ years of experience in software development
- Strong proficiency in React, Node.js, and TypeScript
- Experience with cloud services (AWS/GCP)
- Excellent problem-solving skills
- Strong communication skills

## Nice to Have

- Experience with microservices architecture
- Knowledge of DevOps practices
- Contributions to open source projects
  `,
  skills: ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL"],
  benefits: [
    "Health Insurance",
    "Flexible Hours",
    "Remote Work Options",
    "Professional Development",
    "Team Events",
  ],
};

function formatSalary(min: number, max: number) {
  return `₱${min.toLocaleString()} - ₱${max.toLocaleString()}`;
}

export default function JobDetailPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow">
        {/* Job Header */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link
              href="/jobs"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Jobs
            </Link>

            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Company Logo */}
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-xl flex items-center justify-center text-3xl font-bold text-blue-600 flex-shrink-0">
                {job.company.name[0]}
              </div>

              {/* Job Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {job.title}
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg text-gray-600">
                        {job.company.name}
                      </span>
                      {job.company.verified && (
                        <Badge variant="success">Verified</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-gray-600">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
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
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Full-time
                  </div>
                  <div className="flex items-center text-emerald-600 font-semibold">
                    <svg
                      className="w-5 h-5 mr-2"
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
                    {formatSalary(job.salary.min, job.salary.max)}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/login">
                    <Button size="lg">Apply Now</Button>
                  </Link>
                  <Button variant="outline" size="lg">
                    Save Job
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Job Content */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <Card variant="bordered">
                  <CardContent>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Job Description
                    </h2>
                    <div className="prose prose-gray max-w-none">
                      <div className="whitespace-pre-wrap text-gray-600">
                        {job.description}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="bordered">
                  <CardContent>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Requirements
                    </h2>
                    <div className="prose prose-gray max-w-none">
                      <div className="whitespace-pre-wrap text-gray-600">
                        {job.requirements}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="bordered">
                  <CardContent>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Required Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <Badge key={skill} variant="info" size="md">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card variant="bordered">
                  <CardContent>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      About the Company
                    </h2>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Industry</span>
                        <span className="text-gray-900">
                          {job.company.industry}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Company Size</span>
                        <span className="text-gray-900">{job.company.size}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Location</span>
                        <span className="text-gray-900">
                          {job.company.location}
                        </span>
                      </div>
                    </div>
                    <Link href={`/companies/${job.company.name}`}>
                      <Button variant="outline" className="w-full mt-4">
                        View Company Profile
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card variant="bordered">
                  <CardContent>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Benefits
                    </h2>
                    <ul className="space-y-2">
                      {job.benefits.map((benefit) => (
                        <li
                          key={benefit}
                          className="flex items-center text-sm text-gray-600"
                        >
                          <svg
                            className="w-4 h-4 mr-2 text-emerald-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card variant="bordered" className="bg-blue-50 border-blue-100">
                  <CardContent>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                      Ready to Apply?
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                      Create an account or log in to submit your application.
                    </p>
                    <Link href="/login">
                      <Button className="w-full">Apply Now</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
