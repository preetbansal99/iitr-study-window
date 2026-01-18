/**
 * IITR Student Clubs Database
 * ============================
 * Complete list of Technical, Cultural, Sports, and Other clubs
 */

export interface Club {
    id: string;
    name: string;
    handle: string;
    category: "Technical" | "Cultural" | "Sports" | "Others";
    logo?: string;
    description?: string;
    recruitmentStatus: "Open" | "Closed";
    website?: string;
    events?: { title: string; date: string }[];
    tasks?: { title: string; deadline: string }[];
}

// ============================================
// TECHNICAL CLUBS
// ============================================
export const TECHNICAL_CLUBS: Club[] = [
    {
        id: "stc",
        name: "Students' Technical Council",
        handle: "@stc.iitr",
        category: "Technical",
        recruitmentStatus: "Open",
        description: "The apex technical body of IIT Roorkee, fostering innovation and technical excellence across campus.",
        events: [{ title: "Tech Week Kickoff", date: "Jan 25" }],
    },
    {
        id: "sdslabs",
        name: "SDSLabs",
        handle: "@sdslabs",
        category: "Technical",
        recruitmentStatus: "Open",
        description: "A student-run technical group focused on software development, open-source contributions, and innovative projects.",
        events: [{ title: "Intro Talk", date: "Jan 24" }, { title: "Maker Fair", date: "Feb 5" }],
        tasks: [{ title: "Submit Coding Task", deadline: "Sunday 11:59 PM" }],
        website: "https://sdslabs.co",
    },
    {
        id: "mdg",
        name: "MDG Space",
        handle: "@mdgspace",
        category: "Technical",
        recruitmentStatus: "Open",
        description: "Mobile Development Group - Building cutting-edge mobile applications and web solutions.",
        tasks: [{ title: "Complete App UI Task", deadline: "Monday" }],
    },
    {
        id: "img",
        name: "Information Management Group (IMG)",
        handle: "@img_iitr",
        category: "Technical",
        recruitmentStatus: "Closed",
        description: "Managing and developing the official digital infrastructure of IIT Roorkee.",
    },
    {
        id: "dsg",
        name: "Data Science Group (DSG)",
        handle: "@dsgiitr",
        category: "Technical",
        recruitmentStatus: "Open",
        description: "Exploring machine learning, deep learning, and data-driven insights.",
    },
    {
        id: "infosec",
        name: "InfoSec IITR",
        handle: "@infoseciitr",
        category: "Technical",
        recruitmentStatus: "Open",
        description: "Cybersecurity enthusiasts working on CTFs, security research, and ethical hacking.",
    },
    {
        id: "acm",
        name: "ACM IIT Roorkee Chapter",
        handle: "@acm_iitroorkee",
        category: "Technical",
        recruitmentStatus: "Open",
        description: "Promoting computing as a science and profession through workshops and competitions.",
    },
    {
        id: "gdsc",
        name: "Google Developers Student Clubs (GDSC)",
        handle: "@gdsc_iitr",
        category: "Technical",
        recruitmentStatus: "Open",
        description: "Google-backed community for developers to learn, connect, and grow.",
        events: [{ title: "Android Study Jam", date: "Feb 10" }],
    },
    {
        id: "vlg",
        name: "Vision and Language Group (VLG)",
        handle: "@vlgiitr",
        category: "Technical",
        recruitmentStatus: "Closed",
        description: "Research group focusing on computer vision and natural language processing.",
    },
    {
        id: "blocsoc",
        name: "Blockchain Society",
        handle: "@blocsociitr",
        category: "Technical",
        recruitmentStatus: "Open",
        description: "Exploring blockchain technology, Web3, and decentralized applications.",
    },
    {
        id: "qcg",
        name: "Quantum Computing Group (QCG)",
        handle: "@qcgiitr",
        category: "Technical",
        recruitmentStatus: "Open",
        description: "Pioneering quantum computing education and research at IITR.",
    },
    {
        id: "mars",
        name: "Models and Robotics Section (MaRS)",
        handle: "@mars_iitr",
        category: "Technical",
        recruitmentStatus: "Open",
        description: "Building robots, drones, and autonomous systems.",
        events: [{ title: "Robot Wars", date: "Mar 15" }],
    },
    {
        id: "motorsports",
        name: "IIT Roorkee Motorsports",
        handle: "@iitroorkeemotorsports",
        category: "Technical",
        recruitmentStatus: "Open",
        description: "Designing and building formula-style race cars for national competitions.",
    },
    {
        id: "asme",
        name: "ASME IIT Roorkee",
        handle: "@asmeiitr",
        category: "Technical",
        recruitmentStatus: "Open",
        description: "American Society of Mechanical Engineers student chapter.",
    },
    {
        id: "igem",
        name: "iGEM IIT Roorkee",
        handle: "@igem_iitr",
        category: "Technical",
        recruitmentStatus: "Closed",
        description: "International Genetically Engineered Machine competition team.",
    },
    {
        id: "cognizance",
        name: "Cognizance",
        handle: "@cig_iitr",
        category: "Technical",
        recruitmentStatus: "Open",
        description: "Asia's largest technical festival, organized by IIT Roorkee.",
        events: [{ title: "Cognizance 2024", date: "March 22-24" }],
    },
];

// ============================================
// CULTURAL CLUBS
// ============================================
export const CULTURAL_CLUBS: Club[] = [
    {
        id: "culinary",
        name: "Culinary Club",
        handle: "@culinaryclubiitr",
        category: "Cultural",
        recruitmentStatus: "Open",
        description: "Celebrating the art of cooking and food culture.",
    },
    {
        id: "cultcouncil",
        name: "Cultural Council",
        handle: "@cult.iitr",
        category: "Cultural",
        recruitmentStatus: "Open",
        description: "The apex cultural body organizing festivals and cultural events.",
    },
    {
        id: "drams",
        name: "Dramatics Section",
        handle: "@dramsiitr",
        category: "Cultural",
        recruitmentStatus: "Open",
        description: "Theatre and dramatic arts enthusiasts bringing stories to life.",
        events: [{ title: "Annual Play", date: "Feb 28" }],
    },
    {
        id: "spicmacay",
        name: "SPIC MACAY",
        handle: "@spic_macay_iitr",
        category: "Cultural",
        recruitmentStatus: "Open",
        description: "Promoting Indian classical music and dance among youth.",
    },
    {
        id: "choreo",
        name: "Choreography and Dance",
        handle: "@choreo.iitr",
        category: "Cultural",
        recruitmentStatus: "Open",
        description: "Dance performances and choreography for campus events.",
    },
    {
        id: "music",
        name: "Music Section",
        handle: "@musicsectioniitr",
        category: "Cultural",
        recruitmentStatus: "Open",
        description: "Musicians creating melodies and performing at events.",
        events: [{ title: "Open Mic Night", date: "Jan 30" }],
    },
    {
        id: "cinesec",
        name: "Cinematic Section",
        handle: "@cineseciitr",
        category: "Cultural",
        recruitmentStatus: "Open",
        description: "Filmmaking, video production, and visual storytelling.",
    },
    {
        id: "kshitij",
        name: "Literary Section (Kshitij)",
        handle: "@kshitij_iitr",
        category: "Cultural",
        recruitmentStatus: "Open",
        description: "Creative writing, poetry, and literary events.",
    },
    {
        id: "audio",
        name: "Audio & Lights Section",
        handle: "@audiosection.iitr",
        category: "Cultural",
        recruitmentStatus: "Closed",
        description: "Technical backbone for all cultural events - sound and lighting.",
    },
    {
        id: "finearts",
        name: "Fine Arts",
        handle: "@fineartsiitr",
        category: "Cultural",
        recruitmentStatus: "Open",
        description: "Visual arts, painting, and creative expression.",
    },
    {
        id: "debsoc",
        name: "Debating Society",
        handle: "@debsociitr",
        category: "Cultural",
        recruitmentStatus: "Open",
        description: "Competitive debating and public speaking.",
        events: [{ title: "Inter-IIT Debate", date: "Feb 20" }],
    },
    {
        id: "cinemaclub",
        name: "Cinema Club",
        handle: "@cinema_club_iitr",
        category: "Cultural",
        recruitmentStatus: "Open",
        description: "Film screenings, discussions, and movie appreciation.",
    },
    {
        id: "fashion",
        name: "Fashion Society",
        handle: "@fashionsocietyiitr",
        category: "Cultural",
        recruitmentStatus: "Open",
        description: "Fashion shows and style on campus.",
    },
    {
        id: "quizzing",
        name: "Quizzing Section",
        handle: "@quizzingiitr",
        category: "Cultural",
        recruitmentStatus: "Open",
        description: "Quiz competitions and trivia enthusiasts.",
    },
];

// ============================================
// SPORTS CLUBS
// ============================================
export const SPORTS_CLUBS: Club[] = [
    {
        id: "sportscouncil",
        name: "Institute Sports Council",
        handle: "@sports.iitr",
        category: "Sports",
        recruitmentStatus: "Open",
        description: "Governing body for all sports activities at IIT Roorkee.",
    },
    {
        id: "athletics",
        name: "Athletics IIT Roorkee",
        handle: "@athletics_iitr",
        category: "Sports",
        recruitmentStatus: "Open",
        description: "Track and field athletics training and competitions.",
    },
    {
        id: "sangram",
        name: "Sangram",
        handle: "@sangram_iitr",
        category: "Sports",
        recruitmentStatus: "Open",
        description: "Annual inter-college sports festival of IIT Roorkee.",
        events: [{ title: "Sangram 2024", date: "April 5-7" }],
    },
];

// ============================================
// OTHER STUDENT BODIES
// ============================================
export const OTHER_CLUBS: Club[] = [
    {
        id: "esports",
        name: "IITR ESports",
        handle: "@iitresports",
        category: "Others",
        recruitmentStatus: "Open",
        description: "Competitive gaming and esports tournaments.",
    },
    {
        id: "stuc",
        name: "Students' Club (STUC)",
        handle: "@stuc.iitr",
        category: "Others",
        recruitmentStatus: "Open",
        description: "Student welfare and recreational activities.",
    },
    {
        id: "paac",
        name: "Physics and Astronomy Club (PaAC)",
        handle: "@astro_iitr",
        category: "Others",
        recruitmentStatus: "Open",
        description: "Stargazing, astrophotography, and physics explorations.",
        events: [{ title: "Night Sky Session", date: "New Moon" }],
    },
    {
        id: "hec",
        name: "Himalayan Explorers' Club (HEC)",
        handle: "@hec_iit_roorkee",
        category: "Others",
        recruitmentStatus: "Open",
        description: "Trekking, mountaineering, and adventure sports.",
    },
    {
        id: "ecell",
        name: "E-Cell IIT Roorkee",
        handle: "@ecelliitr",
        category: "Others",
        recruitmentStatus: "Open",
        description: "Entrepreneurship and startup ecosystem.",
        events: [{ title: "Startup Bootcamp", date: "Feb 15" }],
    },
    {
        id: "financeclub",
        name: "Finance Club",
        handle: "@financeclub.iitr",
        category: "Others",
        recruitmentStatus: "Open",
        description: "Financial literacy, investing, and markets.",
    },
    {
        id: "socbiz",
        name: "Society of Business (SocBiz)",
        handle: "@socbiz_iitr",
        category: "Others",
        recruitmentStatus: "Open",
        description: "Business case competitions and consulting.",
    },
    {
        id: "iarc",
        name: "Institute Alumni Relations Cell (IARC)",
        handle: "@iarc_iitr",
        category: "Others",
        recruitmentStatus: "Closed",
        description: "Connecting students with alumni network.",
    },
    {
        id: "outreach",
        name: "Outreach Cell",
        handle: "@outreachiitr",
        category: "Others",
        recruitmentStatus: "Open",
        description: "Community service and social outreach programs.",
    },
    {
        id: "irc",
        name: "International Relations Cell (IRC)",
        handle: "@irc.iitr",
        category: "Others",
        recruitmentStatus: "Open",
        description: "International collaborations and exchange programs.",
    },
    {
        id: "nss",
        name: "NSS IIT Roorkee",
        handle: "@nssiitr",
        category: "Others",
        recruitmentStatus: "Open",
        description: "National Service Scheme - social service initiatives.",
    },
    {
        id: "uba",
        name: "Unnat Bharat Abhiyan",
        handle: "@uba.iitr",
        category: "Others",
        recruitmentStatus: "Open",
        description: "Rural development and village adoption program.",
    },
    {
        id: "wellness",
        name: "Wellness Centre",
        handle: "@wellnessiitr",
        category: "Others",
        recruitmentStatus: "Closed",
        description: "Mental health awareness and student wellness.",
    },
    {
        id: "watchout",
        name: "Watch Out!",
        handle: "@watchoutiitr",
        category: "Others",
        recruitmentStatus: "Open",
        description: "Official campus news magazine and media body.",
    },
    {
        id: "tedx",
        name: "TEDxIITRoorkee",
        handle: "@tedxiitroorkee",
        category: "Others",
        recruitmentStatus: "Closed",
        description: "Independently organized TED talks at IIT Roorkee.",
        events: [{ title: "TEDx 2024", date: "March 10" }],
    },
    {
        id: "thinkindia",
        name: "Think India Club",
        handle: "@thinkindia_iitr",
        category: "Others",
        recruitmentStatus: "Open",
        description: "Policy discussions and national discourse.",
    },
];

// All clubs combined
export const ALL_CLUBS: Club[] = [
    ...TECHNICAL_CLUBS,
    ...CULTURAL_CLUBS,
    ...SPORTS_CLUBS,
    ...OTHER_CLUBS,
];

// Get clubs by category
export function getClubsByCategory(category: Club["category"]): Club[] {
    return ALL_CLUBS.filter((club) => club.category === category);
}

// Get club by ID
export function getClubById(id: string): Club | undefined {
    return ALL_CLUBS.find((club) => club.id === id);
}

// Categories with display names
export const CLUB_CATEGORIES = [
    { id: "Technical", label: "Technical", count: TECHNICAL_CLUBS.length },
    { id: "Cultural", label: "Cultural", count: CULTURAL_CLUBS.length },
    { id: "Sports", label: "Sports", count: SPORTS_CLUBS.length },
    { id: "Others", label: "Other Student Bodies", count: OTHER_CLUBS.length },
] as const;
