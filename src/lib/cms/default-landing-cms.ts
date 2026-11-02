export interface CaseStudyItem {
  id: string;
  business_name: string;
  industry: string;
  metric_badge: string;
  title: string;
  story: string;
  quote: string;
  author: string;
  author_role: string;
}

export interface LandingPageCMS {
  hero: {
    badge: string;
    headline: string;
    subheadline: string;
    primary_cta_text: string;
    primary_cta_url: string;
    secondary_cta_text: string;
    secondary_cta_url: string;
  };
  stats: Array<{ value: string; label: string }>;
  industries_section: {
    badge: string;
    title: string;
    subtitle: string;
  };
  catalog_section: {
    badge: string;
    title: string;
    subtitle: string;
  };
  case_studies_section: {
    badge: string;
    title: string;
    subtitle: string;
    items: CaseStudyItem[];
  };
  pricing_section: {
    badge: string;
    title: string;
    subtitle: string;
  };
  faqs_section: {
    title: string;
    subtitle: string;
    items: Array<{ q: string; a: string }>;
  };
  footer: {
    company_name: string;
    tagline: string;
    copyright: string;
  };
}

export const DEFAULT_LANDING_CMS: LandingPageCMS = {
  hero: {
    badge: "Official Meta Cloud API • Multi-Tenant SaaS",
    headline: "The WhatsApp CRM Built for Real Businesses & Agencies",
    subheadline:
      "Transform high-volume WhatsApp chats into qualified leads, confirmed bookings, and repeat retainers. Pre-tuned with intelligent AI sales agents, universal business catalogs, and multi-location resource locking.",
    primary_cta_text: "Start Free Trial",
    primary_cta_url: "/login",
    secondary_cta_text: "Explore Live Demo",
    secondary_cta_url: "/dashboard",
  },
  stats: [
    { value: "98.4%", label: "Average Message Open Rate" },
    { value: "3.4x", label: "Lead-to-Booking Conversion" },
    { value: "100%", label: "Verified 24h Meta Cloud API Compliance" },
    { value: "0", label: "Double-Bookings with Resource Locking" },
  ],
  industries_section: {
    badge: "15+ Primary Business Categories",
    title: "Tailored For Your Exact Operational Reality",
    subtitle:
      "No generic chat boxes. Dodail configures stage names, catalogs, booking rules, and AI workflows specific to your industry.",
  },
  catalog_section: {
    badge: "Universal Business Catalog",
    title: "Services, Products, Packages, and Rentals",
    subtitle:
      "Power your WhatsApp sales reps, online booking links, and invoices with a unified catalog.",
  },
  case_studies_section: {
    badge: "Customer Proof & ROI",
    title: "Real Businesses Scaling on Dodail WhatsApp CRM",
    subtitle:
      "See how digital agencies, dental practices, dry cleaners, and car rental fleets automate client workflows and drive revenue.",
    items: [
      {
        id: "cs-1",
        business_name: "Apex Growth Agency",
        industry: "Digital Marketing Agency",
        metric_badge: "+320% Retainer Client Approvals",
        title: "Automated Content Approvals & ₹12L/mo Retainer Pipeline",
        story:
          "Managing 18 retainer clients across Meta Ads and Reels was causing endless WhatsApp message chaos. By moving to Dodail's Agency Hub, client creative approvals went from 4 days to under 4 hours with brand voice isolation.",
        quote:
          "Our clients love reviewing social reels directly on WhatsApp. We cut internal churn and scaled our agency to ₹12 Lakh monthly retainer revenue without hiring extra project managers.",
        author: "Karan Malhotra",
        author_role: "Managing Director, Apex Growth",
      },
      {
        id: "cs-2",
        business_name: "Dr. Sharma's Smile Studio",
        industry: "Dental Clinic",
        metric_badge: "Zero Double-Bookings Across 3 Chairs",
        title: "Chair Resource Locking & 6-Month WhatsApp Hygiene Recalls",
        story:
          "Patients frequently missed appointments or booked conflicting slots. Dodail's operatory chair locking with 10-minute sanitization buffers and automated 6-month preventive scaling recalls generated 42 additional checkups in the first month.",
        quote:
          "The automated WhatsApp post-op care guide and recall reminders run like clockwork. Our reception team spends half the time on the phone while patient retention jumped by 40%.",
        author: "Dr. Ananya Sharma",
        author_role: "Lead Cosmetic Dentist & Clinic Founder",
      },
      {
        id: "cs-3",
        business_name: "Sparkle Eco Dry Cleaners",
        industry: "Laundry & Dry Cleaning",
        metric_badge: "4,500+ Society Pickups Scheduled",
        title: "Automated Doorstep Pickup Routes & WhatsApp Garment Alerts",
        story:
          "Serving 12 gated residential societies required endless manual coordination. Dodail's universal catalog with wash & fold pricing per kg and automatic pickup dispatch alerts streamlined daily routes completely.",
        quote:
          "Our residential customers now schedule pickups on WhatsApp in 10 seconds. The delivery team receives live route updates, and customer complaints dropped to almost zero.",
        author: "Vikram Singhania",
        author_role: "Operations Head, Sparkle Cleaners",
      },
      {
        id: "cs-4",
        business_name: "Royal Fleet Self-Drive",
        industry: "Rental Car & Fleet",
        metric_badge: "₹18.5L Booking Deposits Protected",
        title: "Instant Vehicle Availability & Automated Return Reminders",
        story:
          "Managing a fleet of 25 SUVs required constant manual verification of license docs and deposits. Dodail automated vehicle slot availability, security deposit rules, and GPS return checklists via official WhatsApp messaging.",
        quote:
          "Customers receive their verified booking voucher on WhatsApp instantly. Vehicle turnaround time improved by 35% with automatic return reminders.",
        author: "Rohan Varma",
        author_role: "Fleet Manager, Royal Fleet",
      },
    ],
  },
  pricing_section: {
    badge: "Transparent SaaS Pricing",
    title: "Simple Plans That Scale With Your Business",
    subtitle:
      "No hidden costs. Connect your official WhatsApp Business Platform number and start automating.",
  },
  faqs_section: {
    title: "Frequently Asked Questions",
    subtitle: "Everything you need to know about Dodail WhatsApp CRM & Platform.",
    items: [
      {
        q: "Does Dodail connect to the official Meta WhatsApp Business Platform?",
        a: "Yes. Dodail connects directly to Meta's official Cloud API. You receive verified enterprise delivery, green checkmark eligibility, and complete immunity from third-party unofficial number bans.",
      },
      {
        q: "Can I manage multiple clients with separate brand voices?",
        a: "Yes. The Agency Operations Hub provides isolated client workspaces. Each client has their own brand tone of voice, guidelines, content calendar, and approval portal without cross-client leakage.",
      },
      {
        q: "How does resource locking prevent double-booking?",
        a: "When a customer books a dental chair, grooming bay, rental vehicle, or consultation slot, Dodail holds the resource and automatically inserts a configurable sanitization buffer (e.g. 10 minutes) before allowing the next slot.",
      },
      {
        q: "Can I edit all landing page content and case studies from the dashboard?",
        a: "Yes! Every single headline, stat, case study, industry description, and FAQ is dynamically managed via the Super Admin CMS editor.",
      },
      {
        q: "How does the AI ensure commercial accuracy?",
        a: "Our AI Copilot and Auto-Reply engines are grounded strictly in your configured Business Catalog and Knowledge Base. If an inquiry asks for prices or services outside your catalog, it flags the thread for human review instead of hallucinating.",
      },
    ],
  },
  footer: {
    company_name: "Dodail Solutions Pvt Ltd",
    tagline: "Official WhatsApp Business Platform Partner Integration",
    copyright: "© 2026 Dodail Solutions Pvt Ltd. All rights reserved.",
  },
};

