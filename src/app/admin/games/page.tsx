"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Search, Key } from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Game {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number | null;
  imageUrl: string;
  platform: string;
  developer: string | null;
  publisher: string | null;
  releaseDate: string | null;
  rating: number | null;
  inStock: boolean;
  featured: boolean;
  categoryId: string;
  category: Category;
  keys?: { id: string; status: string }[];
}

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  price: 0,
  originalPrice: 0,
  imageUrl: "",
  platform: "PC",
  developer: "",
  publisher: "",
  releaseDate: "",
  rating: 0,
  inStock: true,
  featured: false,
  categoryId: "",
};

export default function AdminGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/games").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([gamesData, catsData]) => {
      setGames(gamesData);
      setCategories(catsData);
      setLoading(false);
    });
  }, []);

  const filteredGames = games.filter(
    (g) =>
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.category?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingGame(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (game: Game) => {
    setEditingGame(game);
    setForm({
      title: game.title,
      slug: game.slug,
      description: game.description,
      price: game.price,
      originalPrice: game.originalPrice || 0,
      imageUrl: game.imageUrl,
      platform: game.platform,
      developer: game.developer || "",
      publisher: game.publisher || "",
      releaseDate: game.releaseDate || "",
      rating: game.rating || 0,
      inStock: game.inStock,
      featured: game.featured,
      categoryId: game.categoryId,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const slug =
        form.slug ||
        form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const payload = { ...form, slug };

      const res = editingGame
        ? await fetch(`/api/games/${editingGame.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/games", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save game");
      }

      const savedGame = await res.json();
      if (editingGame) {
        setGames((prev) =>
          prev.map((g) => (g.id === editingGame.id ? savedGame : g))
        );
        toast.success("Game updated successfully");
      } else {
        setGames((prev) => [savedGame, ...prev]);
        toast.success("Game created successfully");
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save game");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/games/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete game");
      setGames((prev) => prev.filter((g) => g.id !== id));
      setDeleteConfirm(null);
      toast.success("Game deleted successfully");
    } catch {
      toast.error("Failed to delete game");
    }
  };

  const availableKeys = (game: Game) =>
    game.keys?.filter((k) => k.status === "available").length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Games</h1>
          <p className="text-text-muted text-sm mt-1">
            Manage your game catalog
          </p>
        </div>
        <button onClick={openAdd} className="btn-gaming flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          <span>Add Game</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary text-sm placeholder:text-text-muted focus:ring-2 focus:ring-accent-primary/20"
        />
      </div>

      <div className="card-gaming rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-border/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="p-8 text-center text-text-muted">No games found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">Game</th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">Category</th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">Price</th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">Stock</th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">Keys</th>
                  <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredGames.map((game) => (
                  <tr key={game.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-border overflow-hidden shrink-0">
                          <img
                            src={game.imageUrl}
                            alt={game.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{game.title}</p>
                          <p className="text-xs text-text-muted">{game.platform}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-text-secondary">{game.category?.name || "-"}</td>
                    <td className="px-5 py-3">
                      <span className="text-sm font-medium text-text-primary">Rs. {game.price.toFixed(2)}</span>
                      {game.originalPrice && game.originalPrice > game.price && (
                        <span className="text-xs text-text-muted line-through ml-2">Rs. {game.originalPrice.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${game.inStock ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {game.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 text-sm text-text-secondary">
                        <Key className="w-3.5 h-3.5" />
                        {availableKeys(game)}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(game)}
                          className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-accent-primary-light transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(game.id)}
                          className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-text-primary">
                  {editingGame ? "Edit Game" : "Add Game"}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Title *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Slug</label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      placeholder="auto-generated from title"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm placeholder:text-text-muted"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Description *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm resize-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Original Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.originalPrice}
                      onChange={(e) => setForm({ ...form, originalPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={form.rating}
                      onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Image URL *</label>
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Platform</label>
                    <select
                      value={form.platform}
                      onChange={(e) => setForm({ ...form, platform: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
                    >
                      <option value="PC">PC</option>
                      <option value="PlayStation">PlayStation</option>
                      <option value="Xbox">Xbox</option>
                      <option value="Nintendo">Nintendo</option>
                      <option value="Multi-Platform">Multi-Platform</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Category *</label>
                    <select
                      value={form.categoryId}
                      onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Developer</label>
                    <input
                      type="text"
                      value={form.developer}
                      onChange={(e) => setForm({ ...form, developer: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Publisher</label>
                    <input
                      type="text"
                      value={form.publisher}
                      onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Release Date</label>
                  <input
                    type="text"
                    value={form.releaseDate}
                    onChange={(e) => setForm({ ...form, releaseDate: e.target.value })}
                    placeholder="e.g. 2024-01-15"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm placeholder:text-text-muted"
                  />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.inStock}
                      onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                      className="w-4 h-4 rounded border-border bg-background text-accent-primary focus:ring-accent-primary/20"
                    />
                    <span className="text-sm text-text-secondary">In Stock</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                      className="w-4 h-4 rounded border-border bg-background text-accent-primary focus:ring-accent-primary/20"
                    />
                    <span className="text-sm text-text-secondary">Featured</span>
                  </label>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.title || !form.price || !form.imageUrl || !form.categoryId}
                  className="btn-gaming text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{saving ? "Saving..." : editingGame ? "Update Game" : "Create Game"}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-border rounded-xl w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-text-primary mb-2">Delete Game</h3>
              <p className="text-sm text-text-muted mb-6">
                Are you sure you want to delete this game? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
