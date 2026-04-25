/**
 * MockDeveloperData.js
 * Standardized data for template creators to test their designs.
 */

export const MOCK_DEVELOPER_DATA = {
    userDetail: {
        full_name: "Alexander J. Kensington",
        email: "alexander.kensington@example.com",
        phone: "+1 (555) 987-6543",
        address: "123 Innovation Drive, Silicon Valley, CA 94025",
        professional_summary: "Innovative Senior Software Architect with 12+ years of experience in distributed systems and cloud-native applications. Proven track record of leading cross-functional teams to deliver high-scale SaaS products. Expertise in React, Node.js, and Kubernetes.",
        job_title: "Senior Software Architect",
        linkedin: "linkedin.com/in/alexkensington",
        website: "kensington.dev",
        profile_photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop"
    },
    experiences: [
        {
            id: 1,
            company: "TechNexus Solutions",
            position: "Senior Lead Engineer",
            start_date: "Jan 2020",
            end_date: "Present",
            location: "San Francisco, CA",
            description: "Led the migration of legacy monolithic architectures to microservices, improving deployment speed by 40%. Managed a team of 15 engineers across three continents."
        },
        {
            id: 2,
            company: "Quantum Cybernetics",
            position: "Full Stack Developer",
            start_date: "Mar 2016",
            end_date: "Dec 2019",
            location: "Austin, TX",
            description: "Developed core platform features using React and Go. Reduced database latency by 30% through advanced indexing and query optimization."
        }
    ],
    educations: [
        {
            id: 1,
            school: "Stanford University",
            degree: "M.S. in Computer Science",
            start_date: "2014",
            end_date: "2016",
            description: "Specialized in Artificial Intelligence and Distributed Computing."
        },
        {
            id: 2,
            school: "Georgia Institute of Technology",
            degree: "B.S. in Software Engineering",
            start_date: "2010",
            end_date: "2014",
            description: "Graduated với Summâ Cum Laude honours."
        }
    ],
    skills: [
        { id: 1, name: "React & Next.js" },
        { id: 2, name: "Node.js (TypeScript)" },
        { id: 3, name: "Cloud Architecture" },
        { id: 4, name: "UI/UX Design" },
        { id: 5, name: "PostgreSQL & Redis" }
    ]
};
