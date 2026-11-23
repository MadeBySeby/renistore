"use client";
import { useAuth } from "@/app/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const locale = useLocale();
  const router = useRouter();
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!user && !loading) router.replace(`/${locale}/login`);
  }, [user, loading, locale, router]);

  useEffect(() => {
    if (profile?.name) setName(profile.name);
  }, [profile]);

  async function handleNameChange() {
    if (!user) return;
    setSaving(true);
    setSaveError("");
    const { error } = await createClient()
      .from("profiles")
      .update({ name: name.trim() })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      console.error("Error updating name:", error);
      setSaveError("Couldn't save your name. Please try again.");
      return;
    }
    await refreshProfile();
    setModal(false);
  }

  function closeModal() {
    setName(profile?.name ?? "");
    setSaveError("");
    setModal(false);
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-700 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] px-4 py-10">
      <div className="mx-auto max-w-xl rounded-xl border border-gray-800 bg-gray-900/80 p-8 shadow-xl">
        <h1 className="mb-6 text-2xl font-bold text-white">Profile</h1>
        <div className="space-y-4">
          <div className="rounded-md bg-gray-950/70 p-4">
            <p className="mb-1 text-sm text-gray-400">Email</p>
            <p className="break-all text-lg text-white">{user.email}</p>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-md bg-gray-950/70 p-4">
            <div className="min-w-0">
              <p className="mb-1 text-sm text-gray-400">Name</p>
              <p className="truncate text-lg text-white">{profile?.name || "—"}</p>
            </div>
            <button
              onClick={() => setModal(true)}
              className="shrink-0 cursor-pointer rounded-md border border-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/10">
              Change name
            </button>
          </div>
        </div>
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={closeModal}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-name-title"
            className="w-full max-w-sm rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <h2 id="change-name-title" className="mb-4 text-xl font-bold text-white">
              Change name
            </h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mb-2 w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2.5 text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Enter new name"
              autoFocus
            />
            {saveError && <p className="mb-2 text-sm text-red-400">{saveError}</p>}
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="cursor-pointer rounded-md px-4 py-2 text-gray-300 hover:bg-gray-800">
                Cancel
              </button>
              <button
                onClick={handleNameChange}
                disabled={saving || !name.trim()}
                className="cursor-pointer rounded-md bg-primary px-4 py-2 font-semibold text-white hover:bg-primary/90 disabled:opacity-60">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
