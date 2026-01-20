"use client";

import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheck } from "react-icons/fi";
import { FaInstagram, FaTiktok, FaFacebook } from "react-icons/fa";

export default function ContactPage() {
  const t = useTranslations("contact");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, message }),
    });
    const data = await res.json();
    console.log(data);
    setResponseMessage(data.message);
    setSuccess(true);
    setLoading(false);
    setName("");
    setEmail("");
    setMessage("");

    // Reset success message after 3 seconds
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <div className="min-h-[80vh] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            {t("title")}
          </h1>
          <p className="text-gray-400 text-lg">{t("subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-gray-800/50  backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-300">
                  {t("name")}
                </label>
                <input
                  className="px-4 py-3 border border-gray-600 bg-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  required
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-300">
                  {t("email")}
                </label>
                <input
                  className="px-4 py-3 border border-gray-600 bg-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  required
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label
                  htmlFor="message"
                  className="text-sm font-medium text-gray-300">
                  {t("message")}
                </label>
                <textarea
                  className="px-4 py-3 border border-gray-600 bg-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  id="message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("messagePlaceholder")}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group">
                {success ? (
                  <>
                    <FiCheck className="w-5 h-5" />
                    {t("sent")}
                  </>
                ) : loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("sending")}
                  </>
                ) : (
                  <>
                    <FiSend className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    {t("send")}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            {/* Info Cards */}
            <div className="space-y-4">
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 flex items-center gap-4 hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <FiMail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm text-gray-400">{t("email")}</h3>
                  <p className="text-white font-medium">
                    sebiskveradzed@gmail.com
                  </p>
                </div>
              </div>

              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 flex items-center gap-4 hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <FiPhone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm text-gray-400">{t("phone")}</h3>
                  <p className="text-white font-medium">+995 558 200 609</p>
                </div>
              </div>

              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 flex items-center gap-4 hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <FiMapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm text-gray-400">{t("location")}</h3>
                  <p className="text-white font-medium">Tbilisi, Georgia</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
              <h3 className="text-lg font-semibold text-white mb-4">
                {t("followUs")}
              </h3>
              <div className="flex gap-4">
                <a
                  href="https://instagram.com/reni_store.ge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  <FaInstagram className="w-6 h-6 text-white" />
                </a>
                <a
                  href="https://tiktok.com/reni__istore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-black rounded-full flex items-center justify-center hover:scale-110 transition-transform border border-gray-700">
                  <FaTiktok className="w-5 h-5 text-white" />
                </a>
                {/* <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  <FaFacebook className="w-6 h-6 text-white" />
                </a> */}
              </div>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
              <h3 className="text-lg font-semibold text-white mb-4">
                {t("workingHours")}
              </h3>
              <div className="space-y-2 text-gray-300">
                <div className="flex justify-between">
                  <span>{t("mondayFriday")}</span>
                  <span className="text-white">10:00 - 20:00</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("saturday")}</span>
                  <span className="text-white">11:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("sunday")}</span>
                  <span className="text-primary">{t("closed")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
