"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  Plus,
  Search,
  Sparkles,
  Tag,
  Clock,
  CalendarCheck,
  Package,
  Trash2,
  Stethoscope,
  Shirt,
  Car,
  Dog,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CatalogCategory, CatalogItem, CatalogItemType, BusinessType } from "@/types/business";

const ITEM_TYPE_COLORS: Record<CatalogItemType, { label: string; badge: string }> = {
  service: { label: "Service", badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  procedure: { label: "Procedure", badge: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  product: { label: "Product", badge: "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  package: { label: "Package", badge: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  rental: { label: "Rental", badge: "border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
  custom: { label: "Custom", badge: "border-border bg-muted text-foreground" },
};

export default function CatalogPage() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Create item dialog state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [newItemType, setNewItemType] = useState<CatalogItemType>("service");
  const [newItemPrice, setNewItemPrice] = useState("500");
  const [newItemTax, setNewItemTax] = useState("0");
  const [newItemDuration, setNewItemDuration] = useState("30");
  const [newItemRequiresBooking, setNewItemRequiresBooking] = useState(true);

  // New category dialog state
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

  // Seed state
  const [isSeeding, setIsSeeding] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catsRes, itemsRes] = await Promise.all([
        fetch("/api/catalog/categories"),
        fetch("/api/catalog/items"),
      ]);

      if (catsRes.ok) {
        const cData = await catsRes.json();
        setCategories(cData.categories || []);
      }
      if (itemsRes.ok) {
        const iData = await itemsRes.json();
        setItems(iData.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSeedStarter = async (bType: BusinessType) => {
    try {
      setIsSeeding(true);
      const res = await fetch("/api/catalog/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed", businessType: bType }),
      });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const res = await fetch("/api/catalog/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim(), description: newCatDesc.trim() || null }),
      });
      if (res.ok) {
        setIsCatOpen(false);
        setNewCatName("");
        setNewCatDesc("");
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/catalog/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newItemName.trim(),
          description: newItemDesc.trim() || null,
          categoryId: newItemCategory || null,
          item_type: newItemType,
          price: parseFloat(newItemPrice) || 0,
          tax_rate: parseFloat(newItemTax) || 0,
          duration_minutes: parseInt(newItemDuration) || 0,
          required_booking: newItemRequiresBooking,
        }),
      });

      if (res.ok) {
        setIsAddOpen(false);
        setNewItemName("");
        setNewItemDesc("");
        await loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to remove this catalog item?")) return;
    try {
      const res = await fetch(`/api/catalog/items/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items.filter((item) => {
    if (selectedCategory !== "all" && item.category_id !== selectedCategory) return false;
    if (selectedType !== "all" && item.item_type !== selectedType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Universal Business Catalog</h1>
            <Badge variant="outline" className="text-xs">Multi-Tenant</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure services, procedures, packages, rental rates, and products offered in your workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsCatOpen(true)}
            className="text-xs"
          >
            <Tag className="mr-1.5 size-3.5" />
            New Category
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="text-xs font-semibold"
          >
            <Plus className="mr-1.5 size-3.5" />
            Add Catalog Item
          </Button>
        </div>
      </div>

      {/* Starter Seed Banner if empty */}
      {items.length === 0 && !loading && (
        <Card className="border-primary/30 bg-primary/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Sparkles className="size-5 text-primary" />
                <span>Your Business Catalog is currently empty</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Quick-start with ready-to-use pricing, tax rates, durations, and booking requirements for your industry:
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isSeeding}
                onClick={() => handleSeedStarter("dental")}
                className="text-xs"
              >
                <Stethoscope className="mr-1.5 size-3.5 text-blue-500" />
                Seed Dental Clinic
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isSeeding}
                onClick={() => handleSeedStarter("dry_cleaning")}
                className="text-xs"
              >
                <Shirt className="mr-1.5 size-3.5 text-emerald-500" />
                Seed Dry Cleaning
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isSeeding}
                onClick={() => handleSeedStarter("rental_car")}
                className="text-xs"
              >
                <Car className="mr-1.5 size-3.5 text-purple-500" />
                Seed Rental Car
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isSeeding}
                onClick={() => handleSeedStarter("pet_shop")}
                className="text-xs"
              >
                <Dog className="mr-1.5 size-3.5 text-amber-500" />
                Seed Pet Shop
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search items by name or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 rounded-md border border-border bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Item Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-9 rounded-md border border-border bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Item Types</option>
            <option value="service">Services</option>
            <option value="procedure">Procedures</option>
            <option value="package">Packages</option>
            <option value="product">Products</option>
            <option value="rental">Rentals</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <Package className="mx-auto size-10 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-foreground">No catalog items found</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Try adjusting your search filters or click "Add Catalog Item" to create one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const typeConfig = ITEM_TYPE_COLORS[item.item_type] || ITEM_TYPE_COLORS.service;
            return (
              <Card key={item.id} className="border-border bg-card transition-all hover:border-primary/40 shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className={`text-[11px] font-medium ${typeConfig.badge}`}>
                      {typeConfig.label}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-muted-foreground hover:text-destructive p-1"
                      title="Archive item"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <CardTitle className="text-base font-semibold text-foreground leading-snug mt-1">
                    {item.name}
                  </CardTitle>
                  {item.category?.name && (
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Tag className="size-3" />
                      <span>{item.category.name}</span>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="p-4 pt-1 space-y-3">
                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between border-t border-border pt-2 text-xs">
                    <div>
                      <span className="text-base font-bold text-foreground">
                        ₹{item.price.toLocaleString("en-IN")}
                      </span>
                      {item.tax_rate > 0 && (
                        <span className="ml-1 text-[10px] text-muted-foreground">
                          +{item.tax_rate}% GST
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                      {item.duration_minutes > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {item.duration_minutes}m
                        </span>
                      )}
                      {item.required_booking ? (
                        <span className="flex items-center gap-1 text-primary">
                          <CalendarCheck className="size-3" />
                          Booking
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Direct Order</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Item Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Catalog Item</DialogTitle>
            <DialogDescription>
              Add a new offering to your business catalog with price, duration, and booking parameters.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateItem} className="space-y-4">
            <div>
              <Label className="text-xs">Item Name *</Label>
              <Input
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="e.g. Laser Teeth Whitening or Suit 2-Piece Dry Clean"
                className="mt-1 h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Item Type</Label>
                <select
                  value={newItemType}
                  onChange={(e) => setNewItemType(e.target.value as CatalogItemType)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-xs text-foreground"
                >
                  <option value="service">Service</option>
                  <option value="procedure">Procedure (Clinical)</option>
                  <option value="package">Package / Subscription</option>
                  <option value="product">Product / Retail</option>
                  <option value="rental">Vehicle / Equipment Rental</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <Label className="text-xs">Category</Label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-xs text-foreground"
                >
                  <option value="">Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Price (₹) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="mt-1 h-9"
                />
              </div>

              <div>
                <Label className="text-xs">Tax Rate (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newItemTax}
                  onChange={(e) => setNewItemTax(e.target.value)}
                  className="mt-1 h-9"
                />
              </div>

              <div>
                <Label className="text-xs">Duration (Min)</Label>
                <Input
                  type="number"
                  min="0"
                  step="5"
                  value={newItemDuration}
                  onChange={(e) => setNewItemDuration(e.target.value)}
                  className="mt-1 h-9"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="req-booking"
                checked={newItemRequiresBooking}
                onChange={(e) => setNewItemRequiresBooking(e.target.checked)}
                className="size-4 rounded border-border text-primary"
              />
              <Label htmlFor="req-booking" className="text-xs cursor-pointer">
                Requires advance appointment or resource reservation
              </Label>
            </div>

            <div>
              <Label className="text-xs">Description</Label>
              <Input
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
                placeholder="Key details, materials used, deliverables..."
                className="mt-1 h-9"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Save Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={isCatOpen} onOpenChange={setIsCatOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New Category</DialogTitle>
            <DialogDescription>
              Group catalog items into logical sections (e.g. Preventive, Dry Cleaning, Fleet).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <Label className="text-xs">Category Name *</Label>
              <Input
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Cosmetic Dentistry"
                className="mt-1 h-9"
              />
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Input
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Optional description..."
                className="mt-1 h-9"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCatOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Create Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

