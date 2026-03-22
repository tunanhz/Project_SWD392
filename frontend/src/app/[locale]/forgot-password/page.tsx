"use client";

import { useState } from "react";
import { Link } from "@/navigation";
import Button from "@/components/ui/Button";
import { useTranslations } from "next-intl";

export default function ForgotPasswordPage() {
  const t = useTranslations("Auth.forgot");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to process request");
      }

      setStatus("success");
    } catch (err: any) {
      setErrorMessage(err.message);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/5 via-background to-background">
      <div className="w-full max-w-md p-8 space-y-8 glass rounded-2xl border border-border/50 shadow-2xl">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-primary">{t("title")}</h1>
          <p className="text-sm text-gray-500">{t("subtitle")}</p>
        </div>

        {status === "success" ? (
          <div className="space-y-6">
            <div className="p-4 text-sm font-medium text-green-700 bg-green-50 rounded-xl border border-green-200">
              {t("success")}
            </div>
            <Link href="/login" className="block w-full">
              <Button variant="outline" className="w-full h-12">
                {t("backToLogin")}
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {status === "error" && (
              <div className="p-3 text-xs font-bold text-red-500 bg-red-50 rounded-xl border border-red-100 animate-shake">
                {errorMessage}
              </div>
            )}
            
            <div className="space-y-2">
              <label 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" 
                htmlFor="email"
              >
                {t("email")}
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="flex h-12 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all border-border/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              variant="accent" 
              className="w-full h-12 text-lg" 
              disabled={status === "loading"}
            >
              {status === "loading" ? t("loading") : t("submit")}
            </Button>

            <div className="text-center">
              <Link href="/login" className="text-sm text-gray-500 hover:text-accent hover:underline transition-colors">
                &larr; {t("backToLogin")}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
