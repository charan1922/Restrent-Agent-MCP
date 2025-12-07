"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Save, RefreshCw } from "lucide-react";

export default function SettingsPage() {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/settings");
            const data = await res.json();

            if (data.success) {
                setPrompt(data.settings?.system_prompt || "");
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

    const handleSave = async () => {
        try {
            setSaving(true);
            setMessage(null);

            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    key: "system_prompt",
                    value: prompt
                }),
            });

            const data = await res.json();

            if (data.success) {
                setMessage({ text: "System prompt updated successfully!", type: "success" });
            } else {
                setMessage({ text: data.error || "Failed to update", type: "error" });
            }
        } catch (error) {
            setMessage({ text: "Network error", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    const cleanPrompt = `You are an expert AI waiter...
(Default prompt template placeholder)`;

    return (
        <ProtectedRoute>
            <AppLayout>
                <div className="p-8 max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Restaurant Settings</h1>
                            <p className="text-gray-500 mt-1">Customize your AI waiter's persona and instructions</p>
                        </div>
                        <button
                            onClick={fetchSettings}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Refresh settings"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                🤖 AI System Prompt
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                This prompt defines how your AI waiter behaves, speaks, and handles orders.
                                Adjust the persona, tone, and specific instructions for your restaurant.
                            </p>
                        </div>

                        <div className="p-6">
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

                            <div className="space-y-4">
                                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                                    System Instructions
                                </label>
                                <div className="relative">
                                    <textarea
                                        id="prompt"
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        disabled={loading}
                                        rows={20}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm leading-relaxed resize-y"
                                        placeholder="Enter the system prompt here..."
                                    />
                                    {loading && (
                                        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                                            <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                                <button
                                    onClick={() => setPrompt("")} // Ideally reset to default
                                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                                >
                                    Clear Prompt
                                </button>

                                <button
                                    onClick={handleSave}
                                    disabled={saving || loading}
                                    className="flex items-center gap-2 bg-[var(--color-primary)] hover:brightness-90 text-white font-semibold py-2.5 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow active:scale-95"
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </ProtectedRoute>
    );
}
