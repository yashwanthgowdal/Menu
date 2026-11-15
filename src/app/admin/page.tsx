"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, Plus, RotateCcw, ExternalLink, Search, ChevronDown,
  Trash2, Edit3, X, Upload, AlertTriangle, Check, Coffee,
  FolderOpen, GripVertical, Flame
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn, formatPrice, AVAILABILITY_LABELS, DIETARY_LABELS } from "@/lib/utils";

// ─── Types ───
interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  _count?: { items: number };
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

// ─── Toast ───
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={cn(
        "fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl font-sans text-sm font-medium flex items-center gap-2 max-w-sm",
        type === "success"
          ? "bg-veg-green text-white"
          : "bg-red-600 text-white"
      )}
    >
      {type === "success" ? <Check className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
      {message}
    </motion.div>
  );
}

// ─── Confirmation Dialog ───
function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-serif text-xl font-bold text-espresso mb-2">{title}</h3>
        <p className="text-sm text-espresso/60 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-espresso/70 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Item Edit/Add Modal ───
function ItemModal({
  item,
  categories,
  onSave,
  onClose,
}: {
  item: MenuItem | null;
  categories: Category[];
  onSave: (data: Record<string, unknown>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: item?.name || "",
    description: item?.description || "",
    price: item?.price?.toString() || "",
    imageUrl: item?.imageUrl || "",
    dietaryType: item?.dietaryType || "veg",
    spiceLevel: item?.spiceLevel || 1,
    isChefSpecial: item?.isChefSpecial || false,
    availabilitySlot: item?.availabilitySlot || "all_day",
    categoryId: item?.categoryId || categories[0]?.id || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      ...form,
      price: parseFloat(form.price),
      imageUrl: form.imageUrl || null,
    });
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="font-serif text-xl font-bold text-espresso">
            {item ? "Edit Dish" : "Add New Dish"}
          </h3>
          <button onClick={onClose} className="text-espresso/40 hover:text-espresso transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-espresso/70 mb-1">Dish Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brass/30 focus:border-brass text-espresso"
              required
              maxLength={100}
            />
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-espresso/70 mb-1">Category *</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brass/30 focus:border-brass text-espresso bg-white"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-espresso/70 mb-1">Price (₹) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brass/30 focus:border-brass text-espresso"
                required
                min="1"
                step="any"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-espresso/70 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brass/30 focus:border-brass text-espresso resize-none"
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-espresso/70 mb-1">
              <Upload className="w-3.5 h-3.5 inline mr-1" />
              Image URL
            </label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brass/30 focus:border-brass text-espresso text-sm"
              placeholder="https://images.unsplash.com/..."
            />
            {form.imageUrl && (
              <img src={form.imageUrl} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
            )}
          </div>

          {/* Dietary Type, Spice, Availability */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-espresso/70 mb-1">Dietary</label>
              <select
                value={form.dietaryType}
                onChange={(e) => setForm({ ...form, dietaryType: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brass/30 text-espresso bg-white text-sm"
              >
                {Object.entries(DIETARY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-espresso/70 mb-1">Spice (1-5)</label>
              <input
                type="number"
                value={form.spiceLevel}
                onChange={(e) => setForm({ ...form, spiceLevel: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brass/30 text-espresso"
                min="1"
                max="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-espresso/70 mb-1">Available</label>
              <select
                value={form.availabilitySlot}
                onChange={(e) => setForm({ ...form, availabilitySlot: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brass/30 text-espresso bg-white text-sm"
              >
                {Object.entries(AVAILABILITY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Chef's Special */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isChefSpecial}
              onChange={(e) => setForm({ ...form, isChefSpecial: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-brass focus:ring-brass"
            />
            <span className="text-sm font-medium text-espresso/70">
              ★ Chef&apos;s Special
            </span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-espresso/70 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-brass text-white font-medium hover:bg-brass-dark transition-colors disabled:opacity-50 shadow-lg shadow-brass/20"
            >
              {saving ? "Saving..." : item ? "Update Dish" : "Add Dish"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Category Manager Modal ───
function CategoryManagerModal({
  categories,
  onClose,
  onRefresh,
  showToast,
}: {
  categories: Category[];
  onClose: () => void;
  onRefresh: () => void;
  showToast: (msg: string, type: "success" | "error") => void;
}) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const addCategory = async () => {
    if (!newName.trim()) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, sortOrder: categories.length }),
    });
    if (res.ok) {
      setNewName("");
      showToast(`Category "${newName}" added`, "success");
      onRefresh();
    } else {
      showToast("Failed to add category", "error");
    }
  };

  const updateCategory = async (id: string) => {
    if (!editName.trim()) return;
    const res = await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });
    if (res.ok) {
      setEditingId(null);
      showToast("Category updated", "success");
      onRefresh();
    } else {
      showToast("Failed to update category", "error");
    }
  };

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" and all its items?`)) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast(`"${name}" deleted`, "success");
      onRefresh();
    } else {
      showToast("Failed to delete category", "error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="font-serif text-xl font-bold text-espresso">Manage Categories</h3>
          <button onClick={onClose} className="text-espresso/40 hover:text-espresso"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2 group">
              <GripVertical className="w-4 h-4 text-gray-300" />
              {editingId === cat.id ? (
                <>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-brass focus:outline-none text-sm"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && updateCategory(cat.id)}
                  />
                  <button onClick={() => updateCategory(cat.id)} className="text-veg-green hover:text-green-700">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-espresso/40 hover:text-espresso">
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium text-espresso">{cat.name}</span>
                  <span className="text-xs text-espresso/30">{cat._count?.items || 0} items</span>
                  <button
                    onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                    className="opacity-0 group-hover:opacity-100 text-espresso/40 hover:text-brass transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id, cat.name)}
                    className="opacity-0 group-hover:opacity-100 text-espresso/40 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New category name…"
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brass/30 text-sm"
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
            />
            <button
              onClick={addCategory}
              className="px-4 py-2.5 rounded-xl bg-brass text-white font-medium hover:bg-brass-dark transition-colors text-sm"
            >
              Add
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// ─── ADMIN DASHBOARD ───
// ═══════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [editItem, setEditItem] = useState<MenuItem | null | "new">(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string; message: string; confirmLabel: string; onConfirm: () => void;
  } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [catRes, itemRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/menu-items"),
      ]);
      if (catRes.ok) setCategories(await catRes.json());
      if (itemRes.ok) setItems(await itemRes.json());
    } catch (e) {
      console.error("Fetch error:", e);
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Toggle struck out ───
  const toggleStruckOut = async (item: MenuItem) => {
    const newState = !item.isStruckOut;
    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isStruckOut: newState } : i))
    );

    try {
      const res = await fetch(`/api/menu-items/${item.id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isStruckOut: newState }),
      });

      if (res.ok) {
        showToast(
          newState
            ? `"${item.name}" struck out from menu`
            : `"${item.name}" is back on the menu`,
          "success"
        );
      } else {
        // Revert on failure
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isStruckOut: !newState } : i))
        );
        showToast("Failed to update item", "error");
      }
    } catch {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isStruckOut: !newState } : i))
      );
      showToast("Network error", "error");
    }
  };

  // ─── Reset all struck out ───
  const handleResetAll = () => {
    const struckOutCount = items.filter((i) => i.isStruckOut).length;
    if (struckOutCount === 0) {
      showToast("No items are currently struck out", "error");
      return;
    }
    setConfirmDialog({
      title: "Reset All Struck-Out Items?",
      message: `This will restore ${struckOutCount} item${struckOutCount > 1 ? "s" : ""} back to Available. Typically done at the start of a new shift.`,
      confirmLabel: "Reset All",
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          const res = await fetch("/api/menu-items/reset", { method: "POST" });
          if (res.ok) {
            setItems((prev) => prev.map((i) => ({ ...i, isStruckOut: false })));
            const data = await res.json();
            showToast(`${data.restoredCount} items restored to menu`, "success");
          }
        } catch {
          showToast("Failed to reset items", "error");
        }
      },
    });
  };

  // ─── Save item (create or update) ───
  const handleSaveItem = async (data: Record<string, unknown>) => {
    const isEdit = editItem !== "new" && editItem !== null;
    const url = isEdit ? `/api/menu-items/${(editItem as MenuItem).id}` : "/api/menu-items";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        showToast(isEdit ? "Dish updated" : "Dish added to menu", "success");
        setEditItem(null);
        fetchData();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to save", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  // ─── Delete item ───
  const handleDeleteItem = (item: MenuItem) => {
    setConfirmDialog({
      title: "Delete Dish?",
      message: `"${item.name}" will be permanently removed from the menu.`,
      confirmLabel: "Delete",
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          const res = await fetch(`/api/menu-items/${item.id}`, { method: "DELETE" });
          if (res.ok) {
            setItems((prev) => prev.filter((i) => i.id !== item.id));
            showToast(`"${item.name}" deleted`, "success");
          }
        } catch {
          showToast("Failed to delete item", "error");
        }
      },
    });
  };

  // ─── Logout ───
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  // ─── Filtered items ───
  const filteredItems = items.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                       item.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "all" || item.categoryId === filterCategory;
    return matchSearch && matchCategory;
  });

  const struckOutCount = items.filter((i) => i.isStruckOut).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-brass/30 border-t-brass rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Header ─── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coffee className="w-6 h-6 text-brass" />
              <div>
                <h1 className="font-serif text-xl font-bold text-espresso">NoWave Admin</h1>
                <p className="text-xs text-espresso/40 hidden sm:block">Restaurant Manager Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/menu"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-brass hover:bg-brass/10 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Live Menu</span>
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-espresso/60 hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ─── Action Bar ─── */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setEditItem("new")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brass text-white font-semibold hover:bg-brass-dark transition-colors shadow-lg shadow-brass/20 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Dish
          </button>

          <button
            onClick={() => setShowCategoryManager(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-espresso/70 font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            <FolderOpen className="w-4 h-4" /> Categories
          </button>

          <button
            onClick={handleResetAll}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-colors text-sm",
              struckOutCount > 0
                ? "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20"
                : "border border-gray-200 text-espresso/30 cursor-not-allowed"
            )}
            disabled={struckOutCount === 0}
          >
            <RotateCcw className="w-4 h-4" />
            Reset Struck-Out
            {struckOutCount > 0 && (
              <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">
                {struckOutCount}
              </span>
            )}
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search & Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search dishes…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brass/30 text-sm bg-white"
              />
            </div>
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brass/30 text-sm bg-white text-espresso"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ─── Stats Cards ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-espresso/40 uppercase tracking-wider font-medium">Total Dishes</p>
            <p className="text-2xl font-bold text-espresso mt-1">{items.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-espresso/40 uppercase tracking-wider font-medium">Available</p>
            <p className="text-2xl font-bold text-veg-green mt-1">{items.length - struckOutCount}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-espresso/40 uppercase tracking-wider font-medium">Struck Out</p>
            <p className="text-2xl font-bold text-soldout-red mt-1">{struckOutCount}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-espresso/40 uppercase tracking-wider font-medium">Categories</p>
            <p className="text-2xl font-bold text-brass mt-1">{categories.length}</p>
          </div>
        </div>

        {/* ─── Item List ─── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-espresso/40 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-espresso/40 uppercase tracking-wider">Dish</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-espresso/40 uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-espresso/40 uppercase tracking-wider">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-espresso/40 uppercase tracking-wider hidden sm:table-cell">Type</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-espresso/40 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredItems.map((item) => (
                  <motion.tr
                    key={item.id}
                    layout
                    className={cn(
                      "hover:bg-gray-50/50 transition-colors",
                      item.isStruckOut && "bg-red-50/30"
                    )}
                  >
                    {/* Toggle */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStruckOut(item)}
                        className={cn(
                          "toggle-switch",
                        )}
                        data-state={item.isStruckOut ? "unchecked" : "checked"}
                        title={item.isStruckOut ? "Mark as Available" : "Strike Out"}
                      >
                        <span className="toggle-knob" />
                      </button>
                    </td>

                    {/* Dish info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover hidden sm:block"
                          />
                        )}
                        <div>
                          <p className={cn(
                            "font-medium text-sm text-espresso",
                            item.isStruckOut && "line-through text-espresso/40"
                          )}>
                            {item.name}
                            {item.isChefSpecial && <span className="ml-1 text-brass">★</span>}
                          </p>
                          {item.isStruckOut && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-soldout-red">
                              Sold Out
                            </span>
                          )}
                          <span className="text-xs text-espresso/30 block sm:hidden">
                            {item.category?.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-espresso/60">{item.category?.name}</span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3">
                      <span className={cn(
                        "text-sm font-semibold",
                        item.isStruckOut ? "text-espresso/30 line-through" : "text-espresso"
                      )}>
                        {formatPrice(item.price)}
                      </span>
                    </td>

                    {/* Dietary */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={cn(
                        "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                        item.dietaryType === "veg" && "bg-green-50 text-green-700",
                        item.dietaryType === "nonveg" && "bg-orange-50 text-orange-700",
                        item.dietaryType === "vegan" && "bg-emerald-50 text-emerald-700",
                        item.dietaryType === "egg" && "bg-yellow-50 text-yellow-700",
                      )}>
                        {DIETARY_LABELS[item.dietaryType]}
                        {item.spiceLevel > 2 && <Flame className="w-3 h-3" />}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditItem(item)}
                          className="p-2 rounded-lg text-espresso/40 hover:text-brass hover:bg-brass/10 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="p-2 rounded-lg text-espresso/40 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-espresso/30">
              <p className="text-lg font-serif">No dishes found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </main>

      {/* ─── Modals ─── */}
      <AnimatePresence>
        {editItem && (
          <ItemModal
            key="item-modal"
            item={editItem === "new" ? null : editItem}
            categories={categories}
            onSave={handleSaveItem}
            onClose={() => setEditItem(null)}
          />
        )}
        {showCategoryManager && (
          <CategoryManagerModal
            key="category-manager-modal"
            categories={categories}
            onClose={() => setShowCategoryManager(false)}
            onRefresh={fetchData}
            showToast={showToast}
          />
        )}
        {confirmDialog && (
          <ConfirmDialog
            key="confirm-dialog"
            title={confirmDialog.title}
            message={confirmDialog.message}
            confirmLabel={confirmDialog.confirmLabel}
            onConfirm={confirmDialog.onConfirm}
            onCancel={() => setConfirmDialog(null)}
          />
        )}
        {toast && (
          <Toast
            key="toast-alert"
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
