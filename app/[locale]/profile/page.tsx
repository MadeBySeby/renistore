"use client";
import { useAuth } from "@/app/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "next-intl";
import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";
function page() {
  const { user, profile, loading } = useAuth();
  const supabase = createClient();
  const locale = useLocale();
  console.log("Profile Page - User:", user);
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");
  if (!user && !loading) {
    redirect(`/${locale}/login`);
  }
  useEffect(() => {
    if (profile?.name) {
      setName(profile.name);
    }
  }, [profile]);
  async function handleNameChange() {
    const { data, error } = await supabase
      .from("profiles")
      .update({ name: name })
      .eq("id", user?.id);
    if (error) {
      console.error("Error updating name:", error);
    } else {
      console.log("Name updated successfully:", data);
    }
    setModal(false);
  }
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-xl mx-auto bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>
        <div className="space-y-4">
          <div className="bg-gray-700 rounded-md p-4">
            <p className="text-gray-400 text-sm mb-1">Email</p>
            <p className="text-white text-lg">{user?.email}</p>
          </div>
          <div className="bg-gray-700 rounded-md p-4">
            <p className="text-gray-400 text-sm mb-1">Name</p>
            <div className="flex w-full justify-between items-center">
              <p className="text-white text-lg">{name}</p>
              <button
                onClick={() => {
                  setModal(true);
                }}
                className="text-white text-lg bg-red-500 rounded-2xl p-2 cursor-pointer hover:opacity-80  ">
                change name
              </button>
              {modal && (
                <div className="fixed inset-0   flex items-center justify-center">
                  <div className="bg-white rounded-lg p-6 w-96">
                    <h2 className="text-xl text-primary font-bold mb-4">
                      Change Name
                    </h2>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-primary border border-gray-300 rounded-md p-2 mb-4"
                      placeholder="Enter new name"
                    />
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() => setModal(false)}
                        className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400">
                        Cancel
                      </button>
                      <button
                        onClick={handleNameChange}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90">
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;
