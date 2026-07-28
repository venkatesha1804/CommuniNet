export interface CareerService {
    id: string;
    title: string;
    description: string;
    category: "Resume" | "Interview" | "Referral" | "Upskilling";
    benefits: string[];
    actionLabel: string;
}

export const careerServices: CareerService[] = [
    {
        id: "resume-review",
        title: "Resume & Profile Review",
        description: "Get your resume and LinkedIn profile reviewed by industry experts from our community.",
        category: "Resume",
        benefits: [
            "Keyword optimization for ATS",
            "LinkedIn profile branding",
            "Professional summary guidance"
        ],
        actionLabel: "Submit for Review"
    },
    {
        id: "mock-interview",
        title: "Mock Interviews",
        description: "Practice your interview skills with seniors who have experience in your target domain.",
        category: "Interview",
        benefits: [
            "Domain-specific technical questions",
            "Body language and soft skills feedback",
            "Confidence building"
        ],
        actionLabel: "Schedule Interview"
    },
    {
        id: "job-referral",
        title: "Internal Job Referrals",
        description: "Connect with community members working in top companies for internal job referrals.",
        category: "Referral",
        benefits: [
            "Direct reach to hiring managers",
            "Higher chance of resume shortlist",
            "Insider company insights"
        ],
        actionLabel: "Request Referral"
    },
    {
        id: "upskilling-advice",
        title: "Upskilling & Certifications",
        description: "Get guidance on which certifications and skills are trending in your field.",
        category: "Upskilling",
        benefits: [
            "Cost-effective certification paths",
            "Practical skill roadmap",
            "Access to community study groups"
        ],
        actionLabel: "Get Roadmap"
    }
];
