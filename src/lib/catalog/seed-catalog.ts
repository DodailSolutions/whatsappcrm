import { supabaseAdmin } from "@/lib/automations/admin-client";
import type { BusinessType } from "@/types/business";

export interface StarterCatalogData {
  categories: Array<{
    name: string;
    description: string;
    items: Array<{
      name: string;
      description: string;
      item_type: "service" | "product" | "package" | "procedure" | "rental" | "custom";
      price: number;
      tax_rate: number;
      duration_minutes: number;
      required_booking: boolean;
      custom_fields?: Record<string, any>;
    }>;
  }>;
}

export const STARTER_CATALOGS: Partial<Record<BusinessType, StarterCatalogData>> = {
  dental: {
    categories: [
      {
        name: "Consultations & Diagnostics",
        description: "Initial dental checkups, intraoral scans, and specialist consults",
        items: [
          {
            name: "Comprehensive Dental Exam & X-Ray",
            description: "Full mouth digital assessment, decay screening, and gum health diagnosis.",
            item_type: "procedure",
            price: 500,
            tax_rate: 0,
            duration_minutes: 30,
            required_booking: true,
            custom_fields: { chair_required: true, category_code: "EXAM-01" },
          },
          {
            name: "Clear Aligners Consultation",
            description: "3D digital smile scan and orthodontic treatment simulation.",
            item_type: "service",
            price: 1000,
            tax_rate: 0,
            duration_minutes: 30,
            required_booking: true,
            custom_fields: { chair_required: true, category_code: "ORTHO-CONSULT" },
          },
        ],
      },
      {
        name: "Preventive & Hygiene",
        description: "Professional cleaning, scaling, and enamel polishing",
        items: [
          {
            name: "Ultrasonic Scaling & Teeth Cleaning",
            description: "Deep plaque and calculus removal with enamel polishing.",
            item_type: "procedure",
            price: 1500,
            tax_rate: 0,
            duration_minutes: 45,
            required_booking: true,
            custom_fields: { chair_required: true, category_code: "CLEAN-01" },
          },
        ],
      },
      {
        name: "Restorative Dentistry",
        description: "Cavity restorations, root canal treatments, and crowns",
        items: [
          {
            name: "Composite Tooth-Colored Filling",
            description: "Natural-looking aesthetic composite filling per tooth surface.",
            item_type: "procedure",
            price: 2000,
            tax_rate: 0,
            duration_minutes: 45,
            required_booking: true,
            custom_fields: { chair_required: true, category_code: "FILL-01" },
          },
          {
            name: "Root Canal Therapy (Single Visit)",
            description: "Microscopic rotary canal cleaning and biocompatible obturation.",
            item_type: "procedure",
            price: 5500,
            tax_rate: 0,
            duration_minutes: 60,
            required_booking: true,
            custom_fields: { chair_required: true, category_code: "RCT-01" },
          },
        ],
      },
      {
        name: "Cosmetic Dentistry",
        description: "Teeth whitening, veneers, and smile makeovers",
        items: [
          {
            name: "In-Office Laser Teeth Whitening",
            description: "Safe, immediate 3 to 8 shade brightening session.",
            item_type: "service",
            price: 8000,
            tax_rate: 18,
            duration_minutes: 60,
            required_booking: true,
            custom_fields: { chair_required: true, category_code: "WHITE-01" },
          },
        ],
      },
    ],
  },

  dry_cleaning: {
    categories: [
      {
        name: "Dry Cleaning",
        description: "Eco-friendly hydrocarbon delicate garment cleaning",
        items: [
          {
            name: "Suit 2-Piece Dry Clean",
            description: "Jacket and trouser organic dry cleaning with hand steam finish.",
            item_type: "service",
            price: 350,
            tax_rate: 18,
            duration_minutes: 15,
            required_booking: false,
          },
          {
            name: "Silk Saree Dry Clean & Roll Polish",
            description: "Specialized delicate fabric care and preservation.",
            item_type: "service",
            price: 280,
            tax_rate: 18,
            duration_minutes: 15,
            required_booking: false,
          },
          {
            name: "Heavy Blanket / Comforter Clean",
            description: "Deep allergen-free sanitized washing and thermal dry.",
            item_type: "service",
            price: 450,
            tax_rate: 18,
            duration_minutes: 20,
            required_booking: false,
          },
        ],
      },
      {
        name: "Wash & Fold",
        description: "Daily laundry by weight with fabric softener",
        items: [
          {
            name: "Everyday Wash & Fold (Per Kg)",
            description: "Sorted by colors, washed with premium detergent and neatly folded.",
            item_type: "service",
            price: 99,
            tax_rate: 18,
            duration_minutes: 10,
            required_booking: false,
          },
        ],
      },
    ],
  },

  laundry_service: {
    categories: [
      {
        name: "Laundry Packages",
        description: "Bulk subscriptions and monthly door-to-door plans",
        items: [
          {
            name: "Monthly Family Laundry Pass (30kg)",
            description: "4 scheduled weekly pickups with wash, fold, and steam iron included.",
            item_type: "package",
            price: 2499,
            tax_rate: 18,
            duration_minutes: 30,
            required_booking: true,
          },
          {
            name: "Wash & Steam Iron (Per Kg)",
            description: "Full service laundry washed, conditioned, and crisp steam pressed.",
            item_type: "service",
            price: 139,
            tax_rate: 18,
            duration_minutes: 15,
            required_booking: false,
          },
        ],
      },
    ],
  },

  rental_car: {
    categories: [
      {
        name: "Fleet Rentals",
        description: "Self-drive and chauffeur vehicles by daily tariff",
        items: [
          {
            name: "Compact Hatchback (Maruti Swift / i20)",
            description: "24 Hours self-drive rental with 250 km included. Comprehensive insurance.",
            item_type: "rental",
            price: 1800,
            tax_rate: 18,
            duration_minutes: 30,
            required_booking: true,
            custom_fields: { security_deposit: 3000, fuel_type: "Petrol" },
          },
          {
            name: "Executive Sedan (Honda City / Verna)",
            description: "24 Hours self-drive rental with unlimited mileage option.",
            item_type: "rental",
            price: 2800,
            tax_rate: 18,
            duration_minutes: 30,
            required_booking: true,
            custom_fields: { security_deposit: 5000, fuel_type: "Petrol" },
          },
          {
            name: "7-Seater Premium SUV (Innova Crysta / XUV700)",
            description: "Spacious long-distance touring SUV with GPS tracker.",
            item_type: "rental",
            price: 4200,
            tax_rate: 18,
            duration_minutes: 30,
            required_booking: true,
            custom_fields: { security_deposit: 8000, fuel_type: "Diesel" },
          },
        ],
      },
    ],
  },

  pet_shop: {
    categories: [
      {
        name: "Pet Spa & Grooming",
        description: "Bathing, coat trimming, nail clipping, and ear cleaning",
        items: [
          {
            name: "Full Bath & Haircut Grooming",
            description: "Organic medicated shampoo, blow dry, sanitary trim, nail clipping & ear cleaning.",
            item_type: "service",
            price: 1200,
            tax_rate: 18,
            duration_minutes: 60,
            required_booking: true,
            custom_fields: { bay_required: true },
          },
          {
            name: "Anti-Tick & Flea Spa Treatment",
            description: "Herbal anti-parasitic wash and preventive coat protection.",
            item_type: "service",
            price: 650,
            tax_rate: 18,
            duration_minutes: 30,
            required_booking: true,
          },
        ],
      },
      {
        name: "Nutrition & Treats",
        description: "Premium dog & cat foods, kibbles, and dental sticks",
        items: [
          {
            name: "Super-Premium Puppy Kibble 3kg",
            description: "High-protein chicken & egg formula with DHA for brain development.",
            item_type: "product",
            price: 1450,
            tax_rate: 12,
            duration_minutes: 0,
            required_booking: false,
          },
          {
            name: "Veterinary Dental Chew Sticks (Pack of 7)",
            description: "Plaque reducing enzymatic dental treats for medium & large breeds.",
            item_type: "product",
            price: 350,
            tax_rate: 12,
            duration_minutes: 0,
            required_booking: false,
          },
        ],
      },
    ],
  },
};

/**
 * Seed starter catalog categories and items for an account
 */
export async function seedStarterCatalog(accountId: string, businessType: BusinessType) {
  const admin = supabaseAdmin();
  const catalog = STARTER_CATALOGS[businessType] || STARTER_CATALOGS.dental;

  if (!catalog) return;

  for (let cIdx = 0; cIdx < catalog.categories.length; cIdx++) {
    const cat = catalog.categories[cIdx];
    const { data: createdCat, error: catErr } = await admin
      .from("catalog_categories")
      .insert({
        account_id: accountId,
        name: cat.name,
        business_type: businessType,
        description: cat.description,
        sort_order: cIdx,
      })
      .select("id")
      .single();

    if (catErr || !createdCat) {
      console.error("[seedStarterCatalog] Category insert error:", catErr);
      continue;
    }

    const itemsToInsert = cat.items.map((item) => ({
      account_id: accountId,
      category_id: createdCat.id,
      name: item.name,
      description: item.description,
      item_type: item.item_type,
      price: item.price,
      tax_rate: item.tax_rate,
      duration_minutes: item.duration_minutes,
      required_booking: item.required_booking,
      custom_fields: item.custom_fields || {},
      is_active: true,
    }));

    const { error: itemsErr } = await admin.from("catalog_items").insert(itemsToInsert);
    if (itemsErr) {
      console.error("[seedStarterCatalog] Items insert error:", itemsErr);
    }
  }

  // Also seed primary location & initial resource if none exists
  const { data: existingLoc } = await admin
    .from("locations")
    .select("id")
    .eq("account_id", accountId)
    .maybeSingle();

  if (!existingLoc) {
    const { data: loc } = await admin
      .from("locations")
      .insert({
        account_id: accountId,
        name: "Main Branch",
        address: "Central Business District",
        is_primary: true,
      })
      .select("id")
      .single();

    if (loc) {
      if (businessType === "dental") {
        await admin.from("clinic_resources").insert([
          {
            account_id: accountId,
            location_id: loc.id,
            name: "Dental Chair 1 (Main Operatory)",
            resource_type: "chair",
          },
          {
            account_id: accountId,
            location_id: loc.id,
            name: "Dental Chair 2 (Hygiene Suite)",
            resource_type: "chair",
          },
        ]);
      } else if (businessType === "pet_shop") {
        await admin.from("clinic_resources").insert([
          {
            account_id: accountId,
            location_id: loc.id,
            name: "Grooming Bay 1",
            resource_type: "bay",
          },
        ]);
      }
    }
  }
}

