export interface NavigationDropdownItem {
  label: string;
  href: string;
  desc?: string;
}

export interface NavigationItem {
  label: string;
  href: string;
  dropdown?: NavigationDropdownItem[];
}

export interface MetricItem {
  id: string;
  value: string;
  label: string;
  icon?: string;
  enabled: boolean;
}

export interface BusinessTypeCard {
  id: string;
  name: string;
  badge_color: "cyan" | "orange" | "purple" | "green" | "pink" | "blue" | "teal" | "amber";
  icon: string;
  description: string;
  cta_text: string;
  cta_url: string;
  enabled: boolean;
}

export interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export interface HowItWorksStep {
  number: number;
  title: string;
  description: string;
  icon: string;
}

export interface NotificationBadgeItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  icon: string;
}

export interface PricingPlanItem {
  id: string;
  name: string;
  description: string;
  monthly_inr: number;
  annual_inr: number;
  popular?: boolean;
  features: string[];
  cta_text: string;
  cta_url: string;
  enabled: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  enabled: boolean;
}

export interface FooterColumn {
  title: string;
  links: Array<{ label: string; href: string }>;
}

export interface SectionMeta {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

export interface LandingPageCMS {
  sections: SectionMeta[];
  navigation: {
    logo_title: string;
    logo_subtitle: string;
    items: NavigationItem[];
    cta_demo_text: string;
    cta_demo_url: string;
    cta_trial_text: string;
    cta_trial_url: string;
  };
  hero: {
    badge: string;
    headline_line1: string;
    headline_highlight: string;
    subheadline: string;
    primary_cta_text: string;
    primary_cta_url: string;
    secondary_cta_text: string;
    secondary_cta_url: string;
    trust_points: string[];
    mockup: {
      lead_count: string;
      lead_growth: string;
      booking_count: string;
      booking_growth: string;
      sales_inr: string;
      sales_growth: string;
      automation_runs: string;
      automation_growth: string;
      resolved_pct: string;
      in_progress_pct: string;
      needs_attention_pct: string;
    };
  };
  metrics_strip: {
    badge?: string;
    items: MetricItem[];
  };
  business_types: {
    badge: string;
    title: string;
    subtitle: string;
    filter_categories: string[];
    cards: BusinessTypeCard[];
  };
  features: {
    badge: string;
    title: string;
    subtitle: string;
    cta_text: string;
    cta_url: string;
    cards: FeatureCard[];
  };
  how_it_works: {
    badge: string;
    title: string;
    subtitle: string;
    steps: HowItWorksStep[];
  };
  outcomes: {
    badge: string;
    title: string;
    bullets: string[];
    notifications: NotificationBadgeItem[];
  };
  faqs: {
    badge: string;
    title: string;
    items: FAQItem[];
  };
  pricing: {
    badge: string;
    title: string;
    subtitle: string;
    annual_discount_pct: number;
    plans: PricingPlanItem[];
  };
  final_cta: {
    title: string;
    subtitle: string;
    primary_cta_text: string;
    primary_cta_url: string;
    secondary_cta_text: string;
    secondary_cta_url: string;
  };
  footer: {
    company_name: string;
    tagline: string;
    copyright: string;
    columns: FooterColumn[];
    newsletter_title: string;
    social_links: {
      linkedin: string;
      youtube: string;
      twitter: string;
      instagram: string;
    };
  };
  seo: {
    meta_title: string;
    meta_description: string;
    canonical_url: string;
    og_title: string;
    og_description: string;
    og_image: string;
  };
}

export const DEFAULT_LANDING_CMS: LandingPageCMS = {
  sections: [
    { id: "hero", name: "Hero Section & Mockup", enabled: true, order: 1 },
    { id: "metrics_strip", name: "Trust & Metrics Strip", enabled: true, order: 2 },
    { id: "business_types", name: "Business Types (Industry Workflows)", enabled: true, order: 3 },
    { id: "features", name: "Core Features Platform Grid", enabled: true, order: 4 },
    { id: "how_it_works", name: "3-Step Onboarding Process", enabled: true, order: 5 },
    { id: "outcomes_and_faqs", name: "Outcomes & FAQs Split Section", enabled: true, order: 6 },
    { id: "pricing", name: "Subscription Pricing Matrix", enabled: true, order: 7 },
    { id: "final_cta", name: "Final Conversion Banner", enabled: true, order: 8 },
  ],
  navigation: {
    logo_title: "Dodail",
    logo_subtitle: "WhatsApp CRM",
    items: [
      {
        label: "Solutions",
        href: "#business-types",
        dropdown: [
          { label: "Sales & Lead Conversion", href: "#features", desc: "Qualify inbound prospects instantly on WhatsApp." },
          { label: "Appointment & Booking Automation", href: "#business-types", desc: "Lock clinic chairs, salons, or test drives." },
          { label: "Agency & Client Hub", href: "/agency", desc: "Client content calendar & reel approvals." },
          { label: "Preventive Hygiene Recalls", href: "/dental", desc: "Automated 6-month checkup reminders." },
        ],
      },
      {
        label: "Features",
        href: "#features",
        dropdown: [
          { label: "Shared WhatsApp Inbox", href: "#features", desc: "Multi-agent team chat with internal notes." },
          { label: "AI Sales & Follow-up Agents", href: "#features", desc: "Trained on your business catalog." },
          { label: "Resource & Calendar Locking", href: "#features", desc: "Zero double-bookings with sanitization buffers." },
          { label: "Universal Business Catalog", href: "/catalog", desc: "Manage services, products & rental tariffs." },
        ],
      },
      {
        label: "Business Types",
        href: "#business-types",
        dropdown: [
          { label: "Dental Clinics", href: "#business-types", desc: "Operatory chair locking & post-op guides." },
          { label: "Laundry & Dry Cleaning", href: "#business-types", desc: "Garment tags, doorstep society routes." },
          { label: "Digital Marketing Agencies", href: "#business-types", desc: "Ad retainer & reels approval pipelines." },
          { label: "Car Rental & Fleets", href: "#business-types", desc: "Deposit holding & vehicle slot allocations." },
          { label: "Pet Spas & Grooming", href: "#business-types", desc: "Grooming tubs & rabies booster alerts." },
          { label: "Real Estate & Housing", href: "#business-types", desc: "Site visits, brochure PDFs & lead triage." },
        ],
      },
      {
        label: "Resources",
        href: "#resources",
        dropdown: [
          { label: "Documentation & Setup", href: "#", desc: "Meta Cloud API step-by-step guides." },
          { label: "Automation Templates", href: "/automations", desc: "Ready-to-use WhatsApp drip sequences." },
          { label: "Interactive Demo", href: "/dashboard", desc: "Explore a fully populated test workspace." },
        ],
      },
      { label: "Pricing", href: "#pricing" },
    ],
    cta_demo_text: "Book a Demo",
    cta_demo_url: "#book-demo",
    cta_trial_text: "Start Free Trial",
    cta_trial_url: "/login",
  },
  hero: {
    badge: "WhatsApp CRM for Real Businesses",
    headline_line1: "Turn WhatsApp into",
    headline_highlight: "Sales, Bookings & Repeat Business",
    subheadline:
      "An AI-powered WhatsApp CRM to capture leads, manage customers, automate follow-ups, take bookings, and run your daily business operations — all in one place.",
    primary_cta_text: "Start Free Trial",
    primary_cta_url: "/login",
    secondary_cta_text: "Book a Demo",
    secondary_cta_url: "#book-demo",
    trust_points: ["No credit card required", "Setup in minutes", "Official WhatsApp Cloud API"],
    mockup: {
      lead_count: "342",
      lead_growth: "+22%",
      booking_count: "128",
      booking_growth: "+18%",
      sales_inr: "₹4,96,000",
      sales_growth: "+21%",
      automation_runs: "2,840",
      automation_growth: "+41%",
      resolved_pct: "72%",
      in_progress_pct: "18%",
      needs_attention_pct: "10%",
    },
  },
  metrics_strip: {
    badge: "Platform Metrics",
    items: [
      { id: "m1", value: "98.4%", label: "Message Delivery Rate", icon: "Users", enabled: true },
      { id: "m2", value: "3.4x", label: "Faster Customer Response", icon: "Zap", enabled: true },
      { id: "m3", value: "100%", label: "WhatsApp Compliant", icon: "ShieldCheck", enabled: true },
      { id: "m4", value: "24/7", label: "AI & Automation Support", icon: "Bot", enabled: true },
    ],
  },
  business_types: {
    badge: "Built for Your Business",
    title: "Everything You Need to Grow Your Business on WhatsApp",
    subtitle: "Industry-ready workflows, templates, and AI built for real business operations.",
    filter_categories: [
      "All Business Types",
      "Dental",
      "Laundry",
      "Real Estate",
      "Healthcare",
      "Rental Car",
      "Pet Shop",
      "Digital Marketing",
    ],
    cards: [
      {
        id: "dental",
        name: "Dental Clinic",
        badge_color: "cyan",
        icon: "Stethoscope",
        description: "Appointments, reminders, treatment follow-ups & patient communication.",
        cta_text: "Explore Dental",
        cta_url: "/dental",
        enabled: true,
      },
      {
        id: "laundry",
        name: "Laundry & Dry Cleaning",
        badge_color: "orange",
        icon: "Shirt",
        description: "Pickup, delivery, order tracking, area/society & delivery team management.",
        cta_text: "Explore Laundry",
        cta_url: "/catalog",
        enabled: true,
      },
      {
        id: "digital_marketing",
        name: "Digital Marketing & Solutions",
        badge_color: "purple",
        icon: "Megaphone",
        description: "Manage clients, projects, campaigns, content, approvals & renewals.",
        cta_text: "Explore Agency",
        cta_url: "/agency",
        enabled: true,
      },
      {
        id: "rental_car",
        name: "Rental Car",
        badge_color: "green",
        icon: "Car",
        description: "Reservations, fleet, pickup & return reminders, and customer follow-ups.",
        cta_text: "Explore Rental Car",
        cta_url: "/catalog",
        enabled: true,
      },
      {
        id: "pet_shop",
        name: "Pet Shop",
        badge_color: "pink",
        icon: "Dog",
        description: "Product sales, grooming bookings, service reminders & reorder campaigns.",
        cta_text: "Explore Pet Shop",
        cta_url: "/catalog",
        enabled: true,
      },
      {
        id: "real_estate",
        name: "Real Estate",
        badge_color: "blue",
        icon: "Building2",
        description: "Property site visits, brochure PDF delivery, broker commission tracking.",
        cta_text: "Explore Real Estate",
        cta_url: "/catalog",
        enabled: true,
      },
      {
        id: "healthcare",
        name: "OPD & Healthcare",
        badge_color: "teal",
        icon: "Stethoscope",
        description: "Specialist consultation slots, prescription delivery alerts & checkups.",
        cta_text: "Explore Healthcare",
        cta_url: "/catalog",
        enabled: true,
      },
      {
        id: "other",
        name: "Custom Enterprise",
        badge_color: "amber",
        icon: "Layers",
        description: "Universal catalog, multi-location branches, and flexible custom fields.",
        cta_text: "Explore Custom",
        cta_url: "/dashboard",
        enabled: true,
      },
    ],
  },
  features: {
    badge: "Powerful Features",
    title: "A Complete WhatsApp Business Platform",
    subtitle:
      "Everything your business needs to manage customers, operations, and growth — in one AI-powered platform.",
    cta_text: "See All Features",
    cta_url: "#features",
    cards: [
      {
        id: "f1",
        title: "Shared WhatsApp Inbox",
        description: "Collaborate with your team",
        icon: "MessageSquare",
        enabled: true,
      },
      {
        id: "f2",
        title: "AI Sales & Support",
        description: "Qualify, convert & follow up",
        icon: "Bot",
        enabled: true,
      },
      {
        id: "f3",
        title: "Automations & Workflows",
        description: "Save time & increase revenue",
        icon: "Zap",
        enabled: true,
      },
      {
        id: "f4",
        title: "Bookings & Appointments",
        description: "Google Calendar or built-in",
        icon: "CalendarCheck",
        enabled: true,
      },
      {
        id: "f5",
        title: "Services & Catalog",
        description: "Manage services, products & packages",
        icon: "Package",
        enabled: true,
      },
      {
        id: "f6",
        title: "Team & Locations",
        description: "Roles, managers & delivery teams",
        icon: "Users",
        enabled: true,
      },
    ],
  },
  how_it_works: {
    badge: "Get Started in 3 Simple Steps",
    title: "From Setup to More Sales — in Minutes",
    subtitle: "A quick and guided setup to get your business live on WhatsApp.",
    steps: [
      {
        number: 1,
        title: "Create Your Workspace",
        description: "Sign up and choose your business type.",
        icon: "Laptop",
      },
      {
        number: 2,
        title: "Set Up Your Business",
        description: "Add services, team, locations, and connect WhatsApp.",
        icon: "Sliders",
      },
      {
        number: 3,
        title: "Automate & Grow",
        description: "Use ready templates, AI, and bookings to get more customers.",
        icon: "Rocket",
      },
    ],
  },
  outcomes: {
    badge: "Real Business Outcomes",
    title: "Real Results for Service Businesses & Agencies",
    bullets: [
      "Turn WhatsApp chats into qualified leads and paying customers",
      "Automate bookings, reminders, and follow-ups",
      "Manage orders, projects, and customer service in one place",
      "Collaborate with your team and track performance",
      "Save time with industry-ready AI and automation templates",
    ],
    notifications: [
      {
        id: "n1",
        title: "New Booking",
        subtitle: "Dental Check-up",
        time: "Now",
        icon: "CalendarCheck",
      },
      {
        id: "n2",
        title: "Order Ready",
        subtitle: "Laundry #5261",
        time: "5m ago",
        icon: "Package",
      },
      {
        id: "n3",
        title: "New Lead",
        subtitle: "Website Enquiry",
        time: "10m ago",
        icon: "User",
      },
    ],
  },
  faqs: {
    badge: "FAQs",
    title: "Frequently Asked Questions",
    items: [
      {
        id: "faq-1",
        question: "How does Dodail connect to WhatsApp?",
        answer:
          "Dodail uses the official WhatsApp Cloud API to connect your business number securely and reliably with zero risk of third-party phone bans.",
        enabled: true,
      },
      {
        id: "faq-2",
        question: "Can I use it for multiple business types?",
        answer:
          "Yes. Dodail supports multi-workspace operations. You can run dental practices, digital agencies, dry cleaning hubs, and car rental fleets with isolated catalogs and branding.",
        enabled: true,
      },
      {
        id: "faq-3",
        question: "Is there a free trial?",
        answer:
          "Yes! You can explore our live demo workspace instantly or start a 14-day free trial on any plan without requiring a credit card.",
        enabled: true,
      },
      {
        id: "faq-4",
        question: "Do you offer a booking system?",
        answer:
          "Yes. Dodail features built-in resource locking (operatory chairs, grooming tubs, rental vehicles) with configurable sanitization buffer windows to prevent double-booking.",
        enabled: true,
      },
      {
        id: "faq-5",
        question: "Can I import my existing contacts?",
        answer:
          "Absolutely. Import contacts via CSV or sync from existing tools with custom tags, attributes, and purchase history.",
        enabled: true,
      },
      {
        id: "faq-6",
        question: "Is my data secure?",
        answer:
          "Yes. Dodail enforces strict PostgreSQL Row-Level Security (RLS) ensuring strict workspace-level isolation. Your customer conversations, tokens, and records are never cross-accessible.",
        enabled: true,
      },
    ],
  },
  pricing: {
    badge: "Simple & Flexible Pricing",
    title: "Plans That Scale With Your Business",
    subtitle: "Choose a plan that fits your needs. Upgrade or downgrade anytime.",
    annual_discount_pct: 20,
    plans: [
      {
        id: "starter",
        name: "Starter",
        description: "Get started with essential tools.",
        monthly_inr: 1999,
        annual_inr: 1599,
        popular: false,
        features: [
          "1 WhatsApp Number",
          "Up to 1,000 Contacts",
          "3 Team Members",
          "Core Automations",
          "Email Support",
        ],
        cta_text: "Start Free Trial",
        cta_url: "/login",
        enabled: true,
      },
      {
        id: "growth",
        name: "Growth",
        description: "Grow your business with more power.",
        monthly_inr: 4999,
        annual_inr: 3999,
        popular: true,
        features: [
          "Up to 3 WhatsApp Numbers",
          "Up to 10,000 Contacts",
          "Up to 10 Team Members",
          "AI Agents & Templates",
          "Bookings & Calendar",
          "Priority Support",
        ],
        cta_text: "Start Free Trial",
        cta_url: "/login",
        enabled: true,
      },
      {
        id: "pro",
        name: "Pro Business",
        description: "For scaling teams and operations.",
        monthly_inr: 9999,
        annual_inr: 7999,
        popular: false,
        features: [
          "Up to 10 Numbers",
          "Up to 50,000 Contacts",
          "Up to 25 Team Members",
          "Advanced Automations",
          "Multi-location Support",
          "Reports & Analytics",
        ],
        cta_text: "Start Free Trial",
        cta_url: "/login",
        enabled: true,
      },
      {
        id: "enterprise",
        name: "Enterprise",
        description: "Custom plan for large businesses.",
        monthly_inr: 24999,
        annual_inr: 19999,
        popular: false,
        features: [
          "Unlimited Numbers",
          "Unlimited Contacts",
          "Unlimited Team Members",
          "Custom Integrations",
          "Dedicated Account Manager",
          "SLA & Priority Support",
        ],
        cta_text: "Contact Sales",
        cta_url: "#book-demo",
        enabled: true,
      },
    ],
  },
  final_cta: {
    title: "Ready to Automate Your Business on WhatsApp?",
    subtitle:
      "Join hundreds of businesses using Dodail to get more leads, bookings, and repeat customers.",
    primary_cta_text: "Start Free Trial",
    primary_cta_url: "/login",
    secondary_cta_text: "Book a Demo",
    secondary_cta_url: "#book-demo",
  },
  footer: {
    company_name: "Dodail",
    tagline: "Dodail WhatsApp CRM — AI-Powered Business Communication Platform",
    copyright: "© 2026 Dodail Solutions Pvt Ltd. All rights reserved.",
    columns: [
      {
        title: "Product",
        links: [
          { label: "Features", href: "#features" },
          { label: "Pricing", href: "#pricing" },
          { label: "Business Types", href: "#business-types" },
          { label: "Integrations", href: "#features" },
        ],
      },
      {
        title: "Resources",
        links: [
          { label: "Blog", href: "#" },
          { label: "Help Center", href: "#" },
          { label: "Templates", href: "/automations" },
          { label: "Guides", href: "#" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About Us", href: "#" },
          { label: "Contact", href: "#" },
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Terms of Service", href: "/terms" },
        ],
      },
    ],
    newsletter_title: "Stay Updated",
    social_links: {
      linkedin: "https://linkedin.com",
      youtube: "https://youtube.com",
      twitter: "https://x.com",
      instagram: "https://instagram.com",
    },
  },
  seo: {
    meta_title: "Dodail WhatsApp CRM — Turn WhatsApp into Sales, Bookings & Repeat Business",
    meta_description:
      "An AI-powered WhatsApp CRM to capture leads, manage customers, automate follow-ups, take bookings, and run your daily business operations — all in one place.",
    canonical_url: "https://dodail.com",
    og_title: "Dodail WhatsApp CRM — Built for Real Businesses",
    og_description:
      "Official Meta Cloud API WhatsApp CRM with AI Agents, Resource Locking, Universal Catalog, and Multi-Location support.",
    og_image: "/logo.png",
  },
};
