import { useTranslations } from "next-intl";
import React from "react";
export default function OrdersPage() {
  const t = useTranslations();
  return <div>{t("dashboard.orders")}</div>;
}
