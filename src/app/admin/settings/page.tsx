"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Save, RefreshCw, Building2, MessageSquare, Clock, Sparkles } from "lucide-react";

interface SettingsData {
    restaurant_description?: string;
    cuisine_type?: string;
    operating_hours?: string;
    ai_tone?: string;
    special_instructions?: string;
    restaurant_features?: string;
    system_prompt?: string;
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<"config" | "prompt">("config");
    const [settings, setSettings] = useState<SettingsData>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/settings");
            const data = await res.json();

            if (data.success) {
                setSettings(data.settings || {});
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            setMessage({ text: "Failed to load settings", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async (key: string, value: string) => {
        try {
            setSaving(true);
            setMessage(null);

            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key, value }),
            });

            const data = await res.json();

            if (data.success) {
                setMessage({ text: "Settings updated successfully!", type: "success" });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ text: data.error || "Failed to update", type: "error" });
            }
        } catch (error) {
            setMessage({ text: "Network error", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAll = async () => {
        for (const [key, value] of Object.entries(settings)) {
            if (value) {
                await handleSave(key, value);
            }
        }
    };

    return (
        <ProtectedRoute>
            <AppLayout>
                <div className="p-8 max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Restaurant Settings</h1>
                            <p className="text-gray-500 mt-1">Configure your AI waiter and restaurant details</p>
                        </div>
                        <button
                            onClick={fetchSettings}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Refresh settings"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                        </button>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-2 mb-6 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab("config")}
                            className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === "config"
                                    ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <Building2 className="w-4 h-4 inline mr-2" />
                            Restaurant Configuration
                        </button>
                        <button
                            onClick={() => setActiveTab("prompt")}
                            className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === "prompt"
                                    ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <MessageSquare className="w-4 h-4 inline mr-2" />
                            Custom System Prompt
                        </button>
                    </div>

                    {message && (
                        <div
                            className={`mb-4 p-4 rounded-lg text-sm font-medium ${message.type === "success"
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                        >
                            {message.text}
                        </div>
                    )}

                    {/* Configuration Tab */}
                    {activeTab === "config" && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    🏪 Restaurant Description
                                </label>
                                <textarea
                                    value={settings.restaurant_description || ""}
                                    onChange={(e) => setSettings({ ...settings, restaurant_description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                    placeholder="A premium restaurant specializing in..."
                                />
                                <p className="text-xs text-gray-500 mt-1">Brief description of your restaurant</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        🍽️ Cuisine Type
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.cuisine_type || ""}
                                        onChange={(e) => setSettings({ ...settings, cuisine_type: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
                                        placeholder="e.g., Italian, South Indian"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        🕐 Operating Hours
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.operating_hours || ""}
                                        onChange={(e) => setSettings({ ...settings, operating_hours: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
                                        placeholder="e.g., 9:00 AM - 10:00 PM"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    💬 AI Tone
                                </label>
                                <select
                                    value={settings.ai_tone || "warm and professional"}
                                    onChange={(e) => setSettings({ ...settings, ai_tone: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
                                >
                                    <option value="warm and professional">Warm & Professional</option>
                                    <option value="friendly and casual">Friendly & Casual</option>
                                    <option value="formal and elegant">Formal & Elegant</option>
                                    <option value="enthusiastic and energetic">Enthusiastic & Energetic</option>
                                    <option value="warm and welcoming">Warm & Welcoming</option>
                                    <option value="friendly and helpful">Friendly & Helpful</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">How should the AI communicate with guests?</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    🎯 Services/Features
                                </label>
                                <input
                                    type="text"
                                    value={settings.restaurant_features || ""}
                                    onChange={(e) => setSettings({ ...settings, restaurant_features: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
                                    placeholder="e.g., Dine-in, Takeaway, Delivery, Catering"
                                />
                                <p className="text-xs text-gray-500 mt-1">Comma-separated list of services</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    ✨ Special Instructions
                                </label>
                                <textarea
                                    value={settings.special_instructions || ""}
                                    onChange={(e) => setSettings({ ...settings, special_instructions: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
                                    placeholder="Highlight signature dishes, mention chef specialties, dietary accommodations..."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Unique guidelines, signature items, or special notes for the AI
                                </p>
                            </div>

                            <div className="flex justify-end pt-4 border-t">
                                <button
                                    onClick={handleSaveAll}
                                    disabled={saving || loading}
                                    className="flex items-center gap-2 bg-[var(--color-primary)] hover:brightness-90 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 shadow-sm hover:shadow"
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? "Saving..." : "Save Configuration"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Custom Prompt Tab */}
                    {activeTab === "prompt" && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    🤖 Override System Prompt
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Advanced: Replace the auto-generated prompt with a completely custom one.
                                    Leave blank to use the configuration above.
                                </p>
                            </div>

                            <div className="p-6">
                                <textarea
                                    value={settings.system_prompt || ""}
                                    onChange={(e) => setSettings({ ...settings, system_prompt: e.target.value })}
                                    disabled={loading}
                                    rows={20}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] font-mono text-sm leading-relaxed resize-y"
                                    placeholder="Leave empty to use auto-generated prompt from configuration..."
                                />

                                <div className="mt-6 flex items-center justify-between">
                                    <button
                                        onClick={() => setSettings({ ...settings, system_prompt: "" })}
                                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                                    >
                                        Clear Custom Prompt
                                    </button>

                                    <button
                                        onClick={() => handleSave("system_prompt", settings.system_prompt || "")}
                                        disabled={saving || loading}
                                        className="flex items-center gap-2 bg-[var(--color-primary)] hover:brightness-90 text-white font-semibold py-2.5 px-6 rounded-lg transition-all disabled:opacity-50 shadow-sm hover:shadow"
                                    >
                                        <Save className="w-4 h-4" />
                                        {saving ? "Saving..." : "Save Custom Prompt"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </AppLayout>
        </ProtectedRoute>
    );
}
