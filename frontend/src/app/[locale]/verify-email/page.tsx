"use client";

import { useEffect, useState, Suspense } from "react";
import { Link } from "@/navigation";
import { useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import { useTranslations } from "next-intl";

function VerifyEmailContent() {
  const t = useTranslations("Auth.verify");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState(t("verifying"));

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(t("error"));
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/auth/verify-email/${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || t("error"));
        }

        setStatus("success");
        setMessage(t("success"));
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || t("error"));
      }
    };

    verifyToken();
  }, [token, t]);

  return (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary">{t("title")}</h1>
        <p className="text-sm text-gray-500">
          {status === "loading" ? t("verifying") : "Verification complete"}
        </p>
      </div>

      {status === "loading" && (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      )}

      {status === "success" && (
        <div className="p-4 text-sm font-medium text-green-700 bg-green-50 rounded-xl border border-green-200">
          {message}
        </div>
      )}

      {status === "error" && (
        <div className="p-4 text-sm font-medium text-red-700 bg-red-50 rounded-xl border border-red-200">
          {message}
        </div>
      )}

      {status !== "loading" && (
        <Link href="/login" className="block w-full mt-6">
          <Button variant={status === "success" ? "accent" : "outline"} className="w-full h-12">
            {t("backToLogin")}
          </Button>
        </Link>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/5 via-background to-background">
      <div className="w-full max-w-md p-8 glass rounded-2xl border border-border/50 shadow-2xl">
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
