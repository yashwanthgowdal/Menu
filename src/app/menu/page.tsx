"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, BookOpen, ScrollText, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn, formatPrice, AVAILABILITY_LABELS, DIETARY_LABELS } from "@/lib/utils";

// ─── Types ───
interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  dietaryType: string;
  spiceLevel: number;
  isChefSpecial: boolean;
  availabilitySlot: string;
  isStruckOut: boolean;
  sortOrder: number;
  categoryId: string;
  category: Category;
}

// ─── Dietary Badge ───
function DietaryBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    veg: "bg-veg-green",
    nonveg: "bg-nonveg-brown",
    vegan: "bg-emerald-600",
    egg: "bg-yellow-600",
  };
  const isTriangle = type === "nonveg";

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      {isTriangle ? (
        <span
          className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[8px] border-l-transparent border-r-transparent border-b-nonveg-brown"
        />
      ) : (
        <span className={cn("w-2.5 h-2.5 rounded-sm", colors[type] || colors.veg)} />
      )}
      <span className="text-espresso/70 dark:text-parchment/70">
        {DIETARY_LABELS[type] || type}
      </span>
    </span>
  );
}

// ─── Spice Dots ───
function SpiceDots({ level }: { level: number }) {
  return (
    <span className="inline-flex gap-0.5 items-center" title={`Spice level: ${level}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            i < level
              ? "bg-red-500 dark:bg-red-400"
              : "bg-gray-300 dark:bg-gray-600"
          )}
        />
      ))}
    </span>
  );
}

// ─── Lightbox Modal ───
function Lightbox({
  imageUrl,
  dishName,
  onClose,
}: {
  imageUrl: string;
  dishName: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-8 h-8" />
        </button>
        <img
          src={imageUrl}
          alt={dishName}
          className="w-full h-auto rounded-xl shadow-2xl"
          loading="lazy"
        />
        <p className="text-center text-white/90 font-serif text-lg mt-4">
          {dishName}
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── Dish Card ───
function DishCard({
  item,
  onImageClick,
}: {
  item: MenuItem;
  onImageClick: (url: string, name: string) => void;
}) {
  const isSoldOut = item.isStruckOut;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative border border-brass/10 dark:border-amber/10 rounded-xl overflow-hidden",
        "bg-white/50 dark:bg-charcoal-light/50 backdrop-blur-sm",
        "hover:shadow-lg hover:shadow-brass/5 transition-all duration-300",
        isSoldOut && "opacity-55"
      )}
    >
      {/* Photo */}
      {item.imageUrl && (
        <div
          className="relative h-44 overflow-hidden cursor-pointer"
          onClick={() => !isSoldOut && onImageClick(item.imageUrl!, item.name)}
        >
          <img
            src={item.imageUrl}
            alt={item.name}
            className={cn(
              "w-full h-full object-cover transition-transform duration-500",
              !isSoldOut && "group-hover:scale-105"
            )}
            loading="lazy"
          />
          {item.isChefSpecial && !isSoldOut && (
            <span className="absolute top-3 left-3 bg-brass text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
              Chef&apos;s Special ★
            </span>
          )}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <span className="sold-out-stamp bg-white/90 dark:bg-charcoal/90 text-[11px]">
                Sold Out for Today
              </span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-2">
        <div className="relative">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                "font-serif font-semibold text-lg leading-tight text-espresso dark:text-parchment",
                isSoldOut && "line-through decoration-soldout-red/60 decoration-2"
              )}
            >
              {item.name}
            </h3>
            <span
              className={cn(
                "font-sans font-bold text-brass dark:text-amber whitespace-nowrap text-lg",
                isSoldOut && "line-through decoration-soldout-red/60 decoration-2"
              )}
            >
              {formatPrice(item.price)}
            </span>
          </div>
        </div>

        <p className="text-sm text-espresso/60 dark:text-parchment/50 leading-relaxed line-clamp-2">
          {item.description}
        </p>

        <div className="flex items-center flex-wrap gap-3 pt-1">
          <DietaryBadge type={item.dietaryType} />
          {item.spiceLevel > 1 && <SpiceDots level={item.spiceLevel} />}
          {item.availabilitySlot !== "all_day" && (
            <span className="text-[10px] font-medium uppercase tracking-wider text-brass/80 dark:text-amber/70 bg-brass/10 dark:bg-amber/10 px-2 py-0.5 rounded-full">
              {AVAILABILITY_LABELS[item.availabilitySlot]}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Category Ribbon ───
function CategoryRibbon({
  categories,
  activeCategory,
  onSelect,
}: {
  categories: Category[];
  activeCategory: string;
  onSelect: (slug: string) => void;
}) {
  const ribbonRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ribbonRef}
      className="sticky top-0 z-30 bg-parchment/95 dark:bg-charcoal/95 backdrop-blur-md border-b border-brass/10 dark:border-amber/10"
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-1 overflow-x-auto scrollbar-none py-3 -mx-4 px-4">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => onSelect(cat.slug)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                activeCategory === cat.slug
                  ? "bg-brass text-white shadow-md shadow-brass/20"
                  : "text-espresso/60 dark:text-parchment/50 hover:bg-brass/10 dark:hover:bg-amber/10 hover:text-espresso dark:hover:text-parchment"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page Flip View ───
function PageFlipView({
  categories,
  itemsByCategory,
  onImageClick,
}: {
  categories: Category[];
  itemsByCategory: Record<string, MenuItem[]>;
  onImageClick: (url: string, name: string) => void;
}) {
  const [currentPage, setCurrentPage] = useState(0);

  const goNext = () => setCurrentPage((p) => Math.min(p + 1, categories.length - 1));
  const goPrev = () => setCurrentPage((p) => Math.max(p - 1, 0));

  const currentCat = categories[currentPage];
  const items = currentCat ? itemsByCategory[currentCat.id] || [] : [];

  return (
    <div className="relative">
      {/* Page indicator */}
      <div className="flex justify-center gap-2 mb-6">
        {categories.map((cat, i) => (
          <button
            key={cat.id}
            onClick={() => setCurrentPage(i)}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all duration-200",
              i === currentPage
                ? "bg-brass scale-125"
                : "bg-brass/30 dark:bg-amber/20 hover:bg-brass/50"
            )}
            title={cat.name}
          />
        ))}
      </div>

      {/* Page content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCat?.id}
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: -90, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          style={{ perspective: 1200 }}
        >
          <div className="mb-8">
            <h2 className="font-serif text-3xl font-bold text-espresso dark:text-parchment text-center">
              {currentCat?.name}
            </h2>
            <div className="w-16 h-0.5 bg-brass mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {items.map((item) => (
              <DishCard key={item.id} item={item} onImageClick={onImageClick} />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      <div className="flex justify-between items-center mt-8 max-w-4xl mx-auto">
        <button
          onClick={goPrev}
          disabled={currentPage === 0}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
            currentPage === 0
              ? "opacity-30 cursor-not-allowed"
              : "text-brass hover:bg-brass/10 dark:text-amber dark:hover:bg-amber/10"
          )}
        >
          <ChevronLeft className="w-5 h-5" /> Previous
        </button>
        <span className="text-sm text-espresso/40 dark:text-parchment/40 font-sans">
          {currentPage + 1} of {categories.length}
        </span>
        <button
          onClick={goNext}
          disabled={currentPage === categories.length - 1}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
            currentPage === categories.length - 1
              ? "opacity-30 cursor-not-allowed"
              : "text-brass hover:bg-brass/10 dark:text-amber dark:hover:bg-amber/10"
          )}
        >
          Next <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ─── MAIN MENU PAGE ───
// ═══════════════════════════════════════════════════════════
export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [viewMode, setViewMode] = useState<"scroll" | "flip">("scroll");
  const [lightbox, setLightbox] = useState<{ url: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const table = params.get("table");
      if (table) setTableNumber(table);
    }
  }, []);

  // ─── Fetch data ───
  const fetchData = useCallback(async () => {
    try {
      const [catRes, itemRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/menu-items"),
      ]);
      const cats: Category[] = await catRes.json();
      const menuItems: MenuItem[] = await itemRes.json();
      setCategories(cats);
      setItems(menuItems);
      if (cats.length > 0 && !activeCategory) {
        setActiveCategory(cats[0].slug);
      }
    } catch (e) {
      console.error("Failed to fetch menu data:", e);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── SSE Real-time updates ───
  useEffect(() => {
    const eventSource = new EventSource("/api/events");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "item_updated" || data.type === "item_created") {
          const updatedItem = data.payload.item;
          setItems((prev) => {
            const existing = prev.findIndex((i) => i.id === updatedItem.id);
            if (existing >= 0) {
              const next = [...prev];
              next[existing] = updatedItem;
              return next;
            }
            return [...prev, updatedItem];
          });
        } else if (data.type === "item_deleted") {
          setItems((prev) => prev.filter((i) => i.id !== data.payload.id));
        } else if (data.type === "reset_all") {
          setItems((prev) => prev.map((i) => ({ ...i, isStruckOut: false })));
        } else if (data.type === "category_updated") {
          fetchData(); // Refetch all on category change
        }
      } catch {
        // ignore parse errors (heartbeats etc)
      }
    };

    eventSource.onerror = () => {
      // Auto-reconnect handled by browser
    };

    return () => eventSource.close();
  }, [fetchData]);

  // ─── Dark mode toggle ───
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // ─── Scroll spy ───
  useEffect(() => {
    if (viewMode !== "scroll") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories, viewMode]);

  // ─── Group items by category ───
  const itemsByCategory = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    if (!acc[item.categoryId]) acc[item.categoryId] = [];
    acc[item.categoryId].push(item);
    return acc;
  }, {});

  const handleCategorySelect = (slug: string) => {
    setActiveCategory(slug);
    if (viewMode === "scroll") {
      const el = document.getElementById(slug);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment-texture flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-brass/30 border-t-brass rounded-full animate-spin mx-auto" />
          <p className="font-serif text-lg text-espresso/60">Opening the menu…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment-texture transition-colors duration-500">
      {/* ─── Header ─── */}
      <header className="relative border-b border-brass/15 dark:border-amber/10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-espresso dark:text-parchment tracking-tight">
                  NoWave
                </h1>
                {tableNumber && (
                  <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-brass/15 dark:bg-amber/15 text-brass-dark dark:text-amber border border-brass/30 dark:border-amber/30">
                    Table {tableNumber}
                  </span>
                )}
              </div>
              <p className="text-sm text-espresso/50 dark:text-parchment/40 font-sans mt-0.5 tracking-wide">
                E-Menu
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* View mode toggle */}
              <button
                onClick={() => setViewMode(viewMode === "scroll" ? "flip" : "scroll")}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                           text-espresso/60 dark:text-parchment/50 hover:bg-brass/10 dark:hover:bg-amber/10
                           transition-colors"
                title={viewMode === "scroll" ? "Switch to booklet view" : "Switch to scroll view"}
              >
                {viewMode === "scroll" ? (
                  <BookOpen className="w-4 h-4" />
                ) : (
                  <ScrollText className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {viewMode === "scroll" ? "Booklet" : "Scroll"}
                </span>
              </button>

              {/* Dark mode toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2.5 rounded-lg text-espresso/60 dark:text-parchment/50
                           hover:bg-brass/10 dark:hover:bg-amber/10 transition-colors"
                title={isDark ? "Light mode" : "Evening Lounge mode"}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Decorative brass line */}
          <div className="mt-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brass/30 to-transparent dark:via-amber/20" />
            <span className="text-brass/40 dark:text-amber/30 text-xs tracking-[0.3em] uppercase font-sans">
              Menu
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brass/30 to-transparent dark:via-amber/20" />
          </div>
        </div>
      </header>

      {/* ─── Category Ribbon (scroll mode) ─── */}
      {viewMode === "scroll" && (
        <CategoryRibbon
          categories={categories}
          activeCategory={activeCategory}
          onSelect={handleCategorySelect}
        />
      )}

      {/* ─── Menu Content ─── */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {viewMode === "scroll" ? (
          /* ─── Scroll View ─── */
          <div className="space-y-12">
            {categories.map((cat) => {
              const catItems = itemsByCategory[cat.id] || [];
              return (
                <section
                  key={cat.id}
                  id={cat.slug}
                  ref={(el) => { sectionRefs.current[cat.slug] = el; }}
                  className="scroll-mt-20"
                >
                  <div className="mb-6">
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-espresso dark:text-parchment">
                      {cat.name}
                    </h2>
                    <div className="w-12 h-0.5 bg-brass dark:bg-amber mt-2" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {catItems.map((item) => (
                      <DishCard
                        key={item.id}
                        item={item}
                        onImageClick={(url, name) => setLightbox({ url, name })}
                      />
                    ))}
                  </div>

                  {catItems.length === 0 && (
                    <p className="text-center text-espresso/30 dark:text-parchment/30 py-8 font-sans">
                      No items in this category yet.
                    </p>
                  )}
                </section>
              );
            })}
          </div>
        ) : (
          /* ─── Page Flip View ─── */
          <PageFlipView
            categories={categories}
            itemsByCategory={itemsByCategory}
            onImageClick={(url, name) => setLightbox({ url, name })}
          />
        )}
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-brass/10 dark:border-amber/10 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-12 bg-brass/30 dark:bg-amber/20" />
            <span className="text-brass dark:text-amber text-lg">✦</span>
            <div className="h-px w-12 bg-brass/30 dark:bg-amber/20" />
          </div>
          <p className="font-serif text-sm italic text-espresso/50 dark:text-parchment/40">
            Need service or ready to order?
          </p>
          <p className="font-serif text-lg font-semibold text-brass dark:text-amber mt-1 tracking-wide">
            No Wave. Just Tilt.
          </p>
          <p className="text-xs text-espresso/30 dark:text-parchment/20 mt-4 font-sans">
            © {new Date().getFullYear()} NoWave E-Menu
          </p>
        </div>
      </footer>

      {/* ─── Lightbox ─── */}
      <AnimatePresence>
        {lightbox && (
          <Lightbox
            key="lightbox-modal"
            imageUrl={lightbox.url}
            dishName={lightbox.name}
            onClose={() => setLightbox(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
