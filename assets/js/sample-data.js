/**
 * Zamboanga del Sur KALIPI-RIC Women Federation, Inc.
 * Initial Sample Dataset - CY 2026
 */

const INITIAL_ASSOCIATION_INFO = {
    municipality: "Pagadian City",
    barangay: "San Jose",
    associationName: "KALIPI San Jose Women's Association, Inc.",
    presidentLeader: "Ma. Elena S. Santos",
    contactNo: "0917-890-1234",
    doleRegNo: "DOLE-IX-2024-0589-WA"
};

const INITIAL_WOMEN_PROFILES = [
    {
        id: "wom-001",
        name: "Ma. Elena S. Santos",
        birthdate: "1978-03-14",
        age: 48,
        civilStatus: "Married",
        occupation: "Public School Teacher",
        position: "President",
        contactNo: "0917-890-1234",
        remarks: "Federation Board Representative & Livelihood Lead",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        imgUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
    },
    {
        id: "wom-002",
        name: "Rosalinda G. Mendoza",
        birthdate: "1981-07-22",
        age: 45,
        civilStatus: "Married",
        occupation: "Business Owner / Enterprise",
        position: "Vice President",
        contactNo: "0919-234-5678",
        remarks: "Crafts & Weaving Project Head",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
        imgUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
    },
    {
        id: "wom-003",
        name: "Teresita V. Alcantara",
        birthdate: "1987-11-05",
        age: 39,
        civilStatus: "Single",
        occupation: "Barangay Health Worker (BHW)",
        position: "Secretary",
        contactNo: "0920-345-6789",
        remarks: "Health & Nutrition Committee Chair",
        avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
        imgUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80"
    },
    {
        id: "wom-004",
        name: "Carmencita D. Roxas",
        birthdate: "1974-01-19",
        age: 52,
        civilStatus: "Married",
        occupation: "Micro-Entrepreneur",
        position: "Treasurer",
        contactNo: "0918-456-7890",
        remarks: "Savings & Credit Cooperative Officer",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        imgUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
    },
    {
        id: "wom-005",
        name: "Luzviminda M. Castro",
        birthdate: "1985-09-30",
        age: 41,
        civilStatus: "Solo Parent",
        occupation: "Dressmaker & Tailor",
        position: "Auditor",
        contactNo: "0921-567-8901",
        remarks: "Solo Parent Welfare Advocate",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        imgUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    {
        id: "wom-006",
        name: "Corazon B. Aquino-Flores",
        birthdate: "1990-04-12",
        age: 36,
        civilStatus: "Married",
        occupation: "Organic Farmer / RIC Coordinator",
        position: "P.R.O.",
        contactNo: "0917-678-9012",
        remarks: "Rural Improvement Club (RIC) Agriculture Focal",
        avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80",
        imgUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80"
    },
    {
        id: "wom-007",
        name: "Analyn P. Sumalinog",
        birthdate: "1971-08-08",
        age: 55,
        civilStatus: "Widowed",
        occupation: "Sari-Sari Store Owner",
        position: "Board Member",
        contactNo: "0998-789-0123",
        remarks: "Senior Citizen Women Group Lead",
        avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80",
        imgUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80"
    },
    {
        id: "wom-008",
        name: "Jacqueline K. Cabahug",
        birthdate: "1992-02-25",
        age: 34,
        civilStatus: "Married",
        occupation: "Daycare Worker",
        position: "Board Member",
        contactNo: "0905-890-1234",
        remarks: "Early Childhood Care Coordinator",
        avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80",
        imgUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80"
    },
    {
        id: "wom-009",
        name: "Merlinda R. Dela Cruz",
        birthdate: "1997-06-18",
        age: 29,
        civilStatus: "Single",
        occupation: "Online Seller / Digital Artisan",
        position: "Member",
        contactNo: "0916-901-2345",
        remarks: "Youth Women Representative & IT Support",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
        imgUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
    },
    {
        id: "wom-010",
        name: "Evelyn T. Gonzaga",
        birthdate: "1976-10-04",
        age: 50,
        civilStatus: "Married",
        occupation: "Food Processing Specialist",
        position: "Member",
        contactNo: "0922-012-3456",
        remarks: "KALIPI Food Production Team",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        imgUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
    },
    {
        id: "wom-011",
        name: "Grace H. Manalo",
        birthdate: "1988-12-14",
        age: 38,
        civilStatus: "Solo Parent",
        occupation: "Financial Literacy Trainer",
        position: "Member",
        contactNo: "0935-123-4567",
        remarks: "Microfinance & Budgeting Workshop Facilitator",
        avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
        imgUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80"
    },
    {
        id: "wom-012",
        name: "Fe Maria C. Villarin",
        birthdate: "1982-05-27",
        age: 44,
        civilStatus: "Married",
        occupation: "Livestock Farmer",
        position: "Member",
        contactNo: "0947-234-5678",
        remarks: "RIC Poultry & Goat Raising Project",
        avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&auto=format&fit=crop&q=80",
        imgUrl: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&auto=format&fit=crop&q=80"
    }
];

const MUNICIPALITIES_ZDS = [
    "Pagadian City",
    "Aurora",
    "Bayog",
    "Dimataling",
    "Dinas",
    "Dumalinao",
    "Dumingag",
    "Guipos",
    "Josefina",
    "Kumalarang",
    "Labangan",
    "Lapuyan",
    "Mahayag",
    "Margosatubig",
    "Midsalip",
    "Molave",
    "Pitogo",
    "Ramon Magsaysay",
    "San Pablo",
    "San Miguel",
    "Sominot",
    "Tabina",
    "Tamboani",
    "Tigbao",
    "Tukuran",
    "Vincenzo A. Sagun"
];
