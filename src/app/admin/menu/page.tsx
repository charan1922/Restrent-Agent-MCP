"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Search } from "lucide-react";

interface MenuItem {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    ingredients: string[];
    allergens: string[];
    spice_level: number;
    is_vegetarian: boolean;
    is_vegan: boolean;
    prep_time: number;
    image_url?: string;
    is_available: boolean;
}

export default function MenuPage() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    const categories = ["appetizers", "mains", "breads", "beverages", "desserts"];

    const fetchMenu = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/menu");
            const data = await res.json();
            if (data.success) {
                setItems(data.items);
            }
        } catch (error) {
            console.error("Error fetching menu:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;

        try {
            const res = await fetch(`/api/menu?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                fetchMenu();
            }
        } catch (error) {
            console.error("Error deleting item:", error);
        }
    };

    const handleToggleAvailability = async (item: MenuItem) => {
        try {
            const res = await fetch("/api/menu", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: item.id, is_available: !item.is_available }),
            });
            const data = await res.json();
            if (data.success) {
                fetchMenu();
            }
        } catch (error) {
            console.error("Error toggling availability:", error);
        }
    };

    const filteredItems = items.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !categoryFilter || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <ProtectedRoute>
            <AppLayout>
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
                            <p className="text-gray-500 mt-1">Manage your restaurant's menu items</p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingItem(null);
                                setShowModal(true);
                            }}
                            className="flex items-center gap-2 bg-[var(--color-primary)] hover:brightness-90 text-white font-semibold py-2.5 px-6 rounded-lg transition-all shadow-sm hover:shadow"
                        >
                            <Plus className="w-5 h-5" />
                            Add Item
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="flex gap-4 flex-wrap">
                            <div className="flex-1 min-w-[250px]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search menu items..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Menu Items Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    className={`bg-white rounded-xl shadow-sm border hover:shadow-md transition-all ${!item.is_available ? "opacity-60" : ""
                                        }`}
                                >
                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                                                <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded mt-1">
                                                    {item.category}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-[var(--color-primary)]">₹{item.price}</p>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                                        <div className="flex gap-2 mb-4 flex-wrap">
                                            {item.is_vegetarian && (
                                                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Veg</span>
                                            )}
                                            {item.is_vegan && (
                                                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Vegan</span>
                                            )}
                                            {item.spice_level > 0 && (
                                                <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                                                    🌶️ {item.spice_level}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleToggleAvailability(item)}
                                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm font-medium ${item.is_available
                                                        ? "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                                                        : "border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100"
                                                    }`}
                                            >
                                                {item.is_available ? (
                                                    <>
                                                        <ToggleRight className="w-4 h-4" />
                                                        Available
                                                    </>
                                                ) : (
                                                    <>
                                                        <ToggleLeft className="w-4 h-4" />
                                                        Hidden
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingItem(item);
                                                    setShowModal(true);
                                                }}
                                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4 text-gray-600" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {filteredItems.length === 0 && !loading && (
                        <div className="text-center py-16">
                            <p className="text-gray-500 text-lg">No menu items found</p>
                        </div>
                    )}
                </div>

                {/* Modal */}
                {showModal && (
                    <MenuItemModal
                        item={editingItem}
                        onClose={() => {
                            setShowModal(false);
                            setEditingItem(null);
                        }}
                        onSave={() => {
                            setShowModal(false);
                            setEditingItem(null);
                            fetchMenu();
                        }}
                    />
                )}
            </AppLayout>
        </ProtectedRoute>
    );
}

function MenuItemModal({
    item,
    onClose,
    onSave,
}: {
    item: MenuItem | null;
    onClose: () => void;
    onSave: () => void;
}) {
    const [formData, setFormData] = useState<any>(
        item || {
            name: "",
            description: "",
            category: "mains",
            price: 0,
            ingredients: [],
            allergens: [],
            spice_level: 0,
            is_vegetarian: false,
            is_vegan: false,
            prep_time: 15,
            image_url: "",
        }
    );
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const url = "/api/menu";
            const method = item ? "PUT" : "POST";
            const body = item ? { id: item.id, ...formData } : formData;

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (data.success) {
                onSave();
            }
        } catch (error) {
            console.error("Error saving item:", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-2xl font-bold mb-6">{item ? "Edit Menu Item" : "Add Menu Item"}</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="appetizers">Appetizers</option>
                                    <option value="mains">Mains</option>
                                    <option value="breads">Breads</option>
                                    <option value="beverages">Beverages</option>
                                    <option value="desserts">Desserts</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Spice Level (0-3)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="3"
                                    value={formData.spice_level}
                                    onChange={(e) => setFormData({ ...formData, spice_level: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (mins)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.prep_time}
                                    onChange={(e) => setFormData({ ...formData, prep_time: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.is_vegetarian}
                                    onChange={(e) => setFormData({ ...formData, is_vegetarian: e.target.checked })}
                                    className="w-4 h-4 text-[var(--color-primary)] focus:ring-orange-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Vegetarian</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.is_vegan}
                                    onChange={(e) => setFormData({ ...formData, is_vegan: e.target.checked })}
                                    className="w-4 h-4 text-[var(--color-primary)] focus:ring-orange-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Vegan</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-4 py-2.5 bg-[var(--color-primary)] hover:brightness-90 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
