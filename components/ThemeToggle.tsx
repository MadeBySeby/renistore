"use client";
import { useTranslations } from "next-intl";
import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "@/app/context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const t = useTranslations("nav");

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? t("switchToLight") : t("switchToDark")}
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-700 text-gray-200 transition hover:border-primary hover:text-primary">
      {/* Icons switch via CSS so the right one shows before hydration. */}
      <FiSun className="light:hidden" aria-hidden />
      <FiMoon className="hidden light:block" aria-hidden />
    </button>
  );
}
