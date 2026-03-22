"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import Button from "@/components/ui/Button";

function PaymentCallbackContent() {
  const t = useTranslations("PaymentCallback");
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const queryString = searchParams.toString();
        if (!queryString) {
          setStatus('failed');
          setMessage('No transaction details provided.');
          return;
        }

        const res = await fetch(`http://localhost:5000/api/payments/callback?${queryString}`);
        const data = await res.json();
        
        if (data.success) {
          setStatus('success');
        } else {
          setStatus('failed');
          setMessage(data.message || 'Payment processing failed');
        }
      } catch (err) {
        setStatus('failed');
        setMessage('Network error while verifying payment');
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center bg-background">
      <div className="glass w-full max-w-md p-10 rounded-3xl border border-border/50 shadow-2xl text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-3xl font-black text-primary tracking-tight">{t("title")}</h1>

        {status === 'processing' && (
          <div className="space-y-4 py-8">
            <div className="w-16 h-16 mx-auto border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">{t("processing")}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 py-4">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center border-4 border-green-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600">{t("success")}</h2>
            <p className="text-gray-500">{t("successMsg")}</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="space-y-4 py-4">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center border-4 border-red-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600">{t("failed")}</h2>
            <p className="text-gray-500">{t("failedMsg")}</p>
            {message && <p className="text-sm font-medium text-red-500">{message}</p>}
          </div>
        )}

        {status !== 'processing' && (
          <div className="pt-6">
            <Link href="/dashboard">
              <Button variant="accent" size="lg" className="w-full text-lg h-14">
                {t("returnBtn")}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 text-center text-primary font-bold">Loading...</div>}>
      <PaymentCallbackContent />
    </Suspense>
  );
}
