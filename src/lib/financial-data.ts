export interface FinancialScheme {
    id: string;
    title: string;
    provider: string; // Govt, Community, Bank
    category: "Education" | "Business" | "Marriage" | "Personal" | "Agriculture";
    maxAmount: number;
    interestRate: string;
    eligibility: string[];
    description: string;
    link?: string;
}

export const financialSchemes: FinancialScheme[] = [
    {
        id: "comm-edu-1",
        title: "Community Education Interest-Free Loan",
        provider: "Community Trust",
        category: "Education",
        maxAmount: 500000,
        interestRate: "0% (Interest-Free)",
        eligibility: [
            "Must be a registered community member",
            "Annual family income < 8L",
            "Minimum 75% marks in previous degree"
        ],
        description: "Special interest-free loans for higher education (Engineering, Medical, MBA) within India and abroad."
    },
    {
        id: "msme-mudra",
        title: "PMMY - Mudra Loan (Shishu)",
        provider: "Govt of India",
        category: "Business",
        maxAmount: 50000,
        interestRate: "Varies (approx 8-12%)",
        eligibility: [
            "Small business owners",
            "Startup entrepreneurs",
            "Micro units"
        ],
        description: "Collateral-free loans for setting up or expanding small businesses under the Pradhan Mantri Mudra Yojana."
    },
    {
        id: "community-biz-gold",
        title: "Business Startup Seed Fund",
        provider: "Community Business Cell",
        category: "Business",
        maxAmount: 200000,
        interestRate: "Low (4% p.a.)",
        eligibility: [
            "Community members aged 20-35",
            "Innovative business plan",
            "Residence proof of last 5 years"
        ],
        description: "Seed funding with minimal interest to encourage young community entrepreneurs to start their own ventures."
    },
    {
        id: "marriage-sumangali",
        title: "Sumangali Marriage Grant",
        provider: "Welfare Board",
        category: "Marriage",
        maxAmount: 100000,
        interestRate: "Grant (Non-repayable)",
        eligibility: [
            "BPL families",
            "Daughters of community members",
            "Age above 18"
        ],
        description: "Financial grant provided to assist low-income families with marriage expenses of their daughters."
    },
    {
        id: "vidya-lakshmi",
        title: "Vidya Lakshmi Education Portal",
        provider: "Govt (Multi-Bank)",
        category: "Education",
        maxAmount: 2000000,
        interestRate: "Bank Rates (approx 9-11%)",
        eligibility: [
            "Students with admission in recognized courses",
            "Collateral required above 7.5L"
        ],
        description: "A single window for Students to access information and make applications for Educational Loans provided by Banks."
    },
    {
        id: "personal-emerg-gold",
        title: "Emergency Personal Credit",
        provider: "Community Co-operative Bank",
        category: "Personal",
        maxAmount: 150000,
        interestRate: "7.5% p.a.",
        eligibility: [
            "Salary account with the co-operative bank",
            "Member for over 1 year"
        ],
        description: "Instant credit for personal emergencies like medical bills or sudden family needs."
    }
];
