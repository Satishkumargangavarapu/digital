"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

export default function SubscribePage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function getUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data } = await supabase.from('profiles').select('subscription_status').eq('id', user.id).single();
        if (data?.subscription_status === 'active') setIsSubscribed(true);
      }
    }
    getUserData();
  }, [supabase]);

  const handleSubscribe = async (planId: string, isYearly: boolean) => {
    setLoading(planId);
    try {
      const res = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, isYearly }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to create checkout session");
      }
      
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error(e);
      alert("Something went wrong with checkout");
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Choose Your Plan</h1>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          Unlock the ability to log scores, participate in monthly draws, and support your favorite charity.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="h-full flex flex-col hover:border-primary/50 transition-colors">
            <CardHeader className="text-center pb-8 border-b border-border/50">
              <CardTitle className="text-xl text-muted-foreground">Monthly Swing</CardTitle>
              <div className="mt-4 flex items-baseline justify-center gap-1">
                <span className="text-5xl font-extrabold">$19</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-8">
              <ul className="space-y-3 flex-1 mb-8">
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" /> Track up to 5 rolling scores</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" /> Enter monthly reward draws</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" /> 10% auto-donated to charity</li>
              </ul>
              <Button 
                onClick={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || "price_dummy", false)} 
                disabled={loading !== null || isSubscribed}
                className="w-full font-bold"
              >
                {isSubscribed ? "Active Plan" : loading ? "Processing..." : "Subscribe Monthly"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="h-full flex flex-col relative border-accent/50 bg-accent/5 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
            <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-accent text-accent-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <CardHeader className="text-center pb-8 border-b border-border/50">
              <CardTitle className="text-xl text-accent font-semibold">Annual Pro</CardTitle>
              <div className="mt-4 flex items-baseline justify-center gap-1">
                <span className="text-5xl font-extrabold">$190</span>
                <span className="text-muted-foreground">/yr</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Save $38 annually</p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-8">
              <ul className="space-y-3 flex-1 mb-8">
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-accent" /> Track up to 5 rolling scores</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-accent" /> Enter monthly reward draws</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-accent" /> 10% auto-donated to charity</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-accent" /> Premium supporter badge</li>
              </ul>
              <Button 
                onClick={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID || "price_dummy2", true)} 
                disabled={loading !== null || isSubscribed}
                className="w-full font-bold bg-accent hover:bg-accent/90 text-white"
              >
                {isSubscribed ? "Active Plan" : loading ? "Processing..." : "Subscribe Yearly"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
