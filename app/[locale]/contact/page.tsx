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
    <div className="min-h-[80vh] py-6 sm:py-12 px-2 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            {t("title")}
          </h1>
          <p className="text-gray-400 text-sm sm:text-lg">{t("subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-12">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-gray-700/50">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-300">
                  {t("name")}
                </label>
                <input
                  className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-600 bg-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm sm:text-base"
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
                  className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-600 bg-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm sm:text-base"
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
                  className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-600 bg-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none text-sm sm:text-base"
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
                className="w-full bg-primary text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group text-sm sm:text-base">
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
          <div className="space-y-6 sm:space-y-8">
            {/* Info Cards */}
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/30 flex items-center gap-3 sm:gap-4 hover:border-primary/50 transition-colors">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiMail className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs sm:text-sm text-gray-400">
                    {t("email")}
                  </h3>
                  <p className="text-white font-medium text-sm sm:text-base break-all">
                    sebiskveradzed@gmail.com
                  </p>
                </div>
              </div>

              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/30 flex items-center gap-3 sm:gap-4 hover:border-primary/50 transition-colors">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiPhone className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs sm:text-sm text-gray-400">
                    {t("phone")}
                  </h3>
                  <p className="text-white font-medium text-sm sm:text-base">
                    +995 558 200 609
                  </p>
                </div>
              </div>

              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/30 flex items-center gap-3 sm:gap-4 hover:border-primary/50 transition-colors">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiMapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs sm:text-sm text-gray-400">
                    {t("location")}
                  </h3>
                  <p className="text-white font-medium text-sm sm:text-base">
                    Tbilisi, Georgia
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/30">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
                {t("followUs")}
              </h3>
              <div className="flex gap-3 sm:gap-4">
                <a
                  href="https://instagram.com/reni_store.ge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  <FaInstagram className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </a>
                <a
                  href="https://tiktok.com/reni__istore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-full flex items-center justify-center hover:scale-110 transition-transform border border-gray-700">
                  <FaTiktok className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
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

            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/30">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
                {t("workingHours")}
              </h3>
              <div className="space-y-2 text-gray-300 text-sm sm:text-base">
                <div className="flex justify-between gap-2">
                  <span className="flex-shrink-0">{t("mondayFriday")}</span>
                  <span className="text-white text-right">10:00 - 20:00</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="flex-shrink-0">{t("saturday")}</span>
                  <span className="text-white text-right">11:00 - 18:00</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="flex-shrink-0">{t("sunday")}</span>
                  <span className="text-primary text-right">{t("closed")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
