import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Heart, Trophy, ArrowRight, Target, CheckCircle2, ShieldCheck, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen relative bg-background overflow-x-hidden selection:bg-primary/30">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[150px] pointer-events-none" />

      {/* Navigation Layer */}
      <header className="px-8 relative z-50 flex h-24 items-center justify-between border-b border-border/20 bg-background/60 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3 font-extrabold text-2xl tracking-tighter hover:opacity-80 transition-opacity">
          <div className="h-10 w-10 flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-lg">
             <Target className="h-6 w-6" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Swing &amp; Give</span>
        </Link>
        <nav className="flex items-center gap-6 sm:gap-8">
          <Link href="/charities" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Charities
          </Link>
          <Link href="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Log In
          </Link>
          <Link href="/signup">
            <Button className="rounded-full shadow-lg hover:shadow-primary/25 transition-all w-28 font-bold">Sign Up</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 md:px-6 z-10 pt-32 pb-24 sm:pt-40 sm:pb-32 relative">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-6 max-w-5xl relative z-10">
          <div className="mx-auto inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary mb-2 backdrop-blur-md shadow-sm">
            <Heart className="mr-2 h-4 w-4 text-pink-500 fill-pink-500/20" /> Drive Change with Every Swing
          </div>
          <h1 className="text-5xl font-black tracking-tight sm:text-7xl md:text-8xl leading-[1.1]">
            Play with <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-blue-400 to-accent">Purpose</span>
          </h1>
          <p className="mx-auto max-w-[800px] text-muted-foreground md:text-2xl/relaxed mt-8 font-medium">
            Log your golf scores, qualify for massive monthly reward draws, and send a portion of every subscription directly to charities you care about.
          </p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200 fill-mode-both flex flex-col sm:flex-row items-center justify-center gap-6 mt-12 w-full max-w-md mx-auto sm:max-w-none">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto font-bold h-14 px-10 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all gap-2">
              Start Your Journey <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/charities" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto font-bold h-14 px-10 text-lg rounded-full border-border/50 bg-background/50 backdrop-blur-md hover:bg-muted hover:text-foreground transition-all">
              Explore Charities
            </Button>
          </Link>
        </div>

        {/* Feature Cards Showcase */}
        <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 max-w-6xl mx-auto w-full text-left relative z-10">
          
          <div className="group relative p-8 rounded-3xl border border-border/30 bg-background/40 backdrop-blur-xl hover:bg-muted/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] transition-colors group-hover:bg-primary/10" />
             <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 ring-1 ring-primary/20 group-hover:scale-110 transition-transform">
               <BarChart3 className="h-7 w-7 text-primary" />
             </div>
             <h3 className="text-2xl font-bold mb-3 tracking-tight">Track Your Form</h3>
             <p className="text-muted-foreground leading-relaxed font-medium">Log your latest 5 Stableford scores automatically in your dashboard to maintain your active pool status with verified stats.</p>
          </div>

          <div className="group relative p-8 rounded-3xl border border-border/30 bg-background/40 backdrop-blur-xl hover:bg-muted/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-[100px] transition-colors group-hover:bg-accent/10" />
             <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 ring-1 ring-accent/20 group-hover:scale-110 transition-transform">
               <Trophy className="h-7 w-7 text-accent" />
             </div>
             <h3 className="text-2xl font-bold mb-3 tracking-tight">Massive Payouts</h3>
             <p className="text-muted-foreground leading-relaxed font-medium">As an active subscriber, match your auto-allocated numbers in our monthly algorithmic draws to win huge pooled cash rewards.</p>
          </div>

          <div className="group relative p-8 rounded-3xl border border-border/30 bg-background/40 backdrop-blur-xl hover:bg-muted/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-bl-[100px] transition-colors group-hover:bg-pink-500/10" />
             <div className="h-14 w-14 rounded-2xl bg-pink-500/10 flex items-center justify-center mb-6 ring-1 ring-pink-500/20 group-hover:scale-110 transition-transform">
               <Heart className="h-7 w-7 text-pink-500 fill-pink-500/20" />
             </div>
             <h3 className="text-2xl font-bold mb-3 tracking-tight">Make an Impact</h3>
             <p className="text-muted-foreground leading-relaxed font-medium">Select your champion charity. A minimum of 10% of your subscription goes straight to organizations driving real change globally.</p>
          </div>

        </div>
        
        {/* Trust Indicators */}
        <div className="animate-in fade-in duration-1000 delay-500 fill-mode-both mt-32 max-w-4xl w-full border-t border-border/30 pt-16 mx-auto flex flex-col md:flex-row items-center justify-center gap-12 sm:gap-24 opacity-60">
           <div className="flex items-center justify-center gap-3">
              <ShieldCheck className="h-8 w-8 text-foreground" />
              <span className="font-semibold text-lg tracking-tight">Verified Charitable Giving</span>
           </div>
           <div className="flex items-center justify-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-foreground" />
              <span className="font-semibold text-lg tracking-tight">Secure Stripe Payments</span>
           </div>
        </div>
      </main>
    </div>
  );
}
