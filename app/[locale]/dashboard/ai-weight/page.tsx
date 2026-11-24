"use client";
import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";
import { FiCpu, FiImage, FiTrash2 } from "react-icons/fi";
import { sendToAi } from "@/lib/aiUtils";
import { formatGel } from "@/lib/orders";

const YUAN_TO_GEL = 0.38;
const SHIPPING_GEL_PER_KG = 21.56;
const MARKUPS = [20, 40] as const;

export default function AiWeightPage() {
  const t = useTranslations("admin");
  const [image, setImage] = useState<File | null>(null);
  const [chinesePrice, setChinesePrice] = useState("");
  const [weight, setWeight] = useState<number | null>(null);
  const [markup, setMarkup] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const previewUrl = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const costPrice = useMemo(
    () => (parseFloat(chinesePrice) || 0) * YUAN_TO_GEL + (weight ?? 0) * SHIPPING_GEL_PER_KG,
    [chinesePrice, weight],
  );

  async function handleEstimate() {
    if (!image) return;
    setLoading(true);
    setError(false);
    try {
      const data = await sendToAi(image, "/api/ai");
      const estimated = Number(data.estimatedWeightKg);
      if (!Number.isFinite(estimated) || estimated <= 0) throw new Error("Invalid weight");
      setWeight(estimated);
    } catch (err) {
      console.error("Error estimating weight:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    setImage(event.target.files?.[0] ?? null);
    setWeight(null);
    setMarkup(null);
    setError(false);
  }

  function clearImage() {
    setImage(null);
    setWeight(null);
    setMarkup(null);
    setError(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">{t("aiTitle")}</h1>
        <p className="mt-1 max-w-2xl text-gray-400">{t("aiSubtitle")}</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-4 rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
          <input type="file" id="ai-image" accept="image/*" className="sr-only" onChange={handleImageChange} />
          <label
            htmlFor="ai-image"
            className="flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-700 bg-gray-950/60 text-gray-400 transition hover:border-primary hover:text-primary">
            {previewUrl ? (
              <img src={previewUrl} alt="" className="max-h-80 w-full object-contain" />
            ) : (
              <span className="flex min-h-48 flex-col items-center justify-center gap-2">
                <FiImage className="text-3xl" />
                {t("aiUpload")}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-gray-300">
            {t("aiChinesePrice")}
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={chinesePrice}
              onChange={(e) => setChinesePrice(e.target.value)}
              placeholder="120"
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 text-white placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleEstimate}
              disabled={!image || loading}
              className="flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50">
              <FiCpu /> {loading ? t("aiProcessing") : t("aiSend")}
            </button>
            {image && (
              <button
                type="button"
                onClick={clearImage}
                className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/40 px-4 text-red-300 transition hover:bg-red-500/10">
                <FiTrash2 /> {t("aiRemove")}
              </button>
            )}
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-300">
              {t("aiError")}
            </p>
          )}
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-gray-950/60 p-4">
              <dt className="text-sm text-gray-400">{t("aiWeight")}</dt>
              <dd className="mt-1 text-2xl font-bold">{weight !== null ? `${weight} kg` : "—"}</dd>
            </div>
            <div className="rounded-xl bg-gray-950/60 p-4">
              <dt className="text-sm text-gray-400">{t("aiCost")}</dt>
              <dd className="mt-1 text-2xl font-bold">{weight !== null ? formatGel(costPrice) : "—"}</dd>
            </div>
          </dl>

          {weight !== null && (
            <>
              <div className="flex flex-wrap gap-3">
                {MARKUPS.map((percent) => (
                  <button
                    key={percent}
                    type="button"
                    onClick={() => setMarkup(percent)}
                    aria-pressed={markup === percent}
                    className={`min-h-11 flex-1 cursor-pointer rounded-xl border px-4 font-medium transition ${
                      markup === percent
                        ? "border-primary bg-primary text-white"
                        : "border-gray-700 text-gray-200 hover:border-primary"
                    }`}>
                    {t("aiMarkup", { percent })}
                  </button>
                ))}
              </div>
              {markup !== null && (
                <div className="rounded-xl border border-primary/50 bg-primary/10 p-4">
                  <p className="text-sm text-gray-300">{t("aiSellingPrice")}</p>
                  <p className="mt-1 text-3xl font-bold text-primary">{formatGel(costPrice * (1 + markup / 100))}</p>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
