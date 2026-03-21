"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Heart, MapPin } from "lucide-react";
import { motion } from "framer-motion";

// Mock data for UI presentation until Supabase is fully connected
const mockCharities = [
  { id: 1, name: "Fairways for Youth", description: "Empowering underprivileged children through golf and mentorship.", location: "Global", tags: ["Youth", "Sports"], featured: true },
  { id: 2, name: "Green Initiatives", description: "Promoting sustainable practices and conservation on golf courses worldwide.", location: "North America", tags: ["Environment"], featured: false },
  { id: 3, name: "Veterans Swing Recovery", description: "Helping wounded veterans rehabilitate via adaptive golf clinics.", location: "USA", tags: ["Veterans", "Health"], featured: true },
  { id: 4, name: "Golf Against Cancer", description: "Raising funds for cancer research through community golf events.", location: "Europe", tags: ["Health", "Research"], featured: false },
];

export default function CharitiesPage() {
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("");

  const filtered = mockCharities.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchesTag = filterTag ? c.tags.includes(filterTag) : true;
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(mockCharities.flatMap(c => c.tags)));

  return (
    <div className="flex flex-col min-h-screen pt-24 pb-12 px-4 md:px-8 relative">
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[100px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto w-full space-y-8 z-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Charity <span className="text-primary">Directory</span></h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Discover and select the foundations you want to support with every swing.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/30 p-4 rounded-xl border border-border/50">
          <div className="relative w-full md:w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search charities..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background/50 border-border"
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Button variant={filterTag === "" ? "default" : "outline"} size="sm" onClick={() => setFilterTag("")}>All</Button>
            {allTags.map(tag => (
              <Button key={tag} variant={filterTag === tag ? "default" : "outline"} size="sm" onClick={() => setFilterTag(tag)}>
                {tag}
              </Button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
          {filtered.map((charity, i) => (
            <motion.div key={charity.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
              <Card className="h-full flex flex-col relative overflow-hidden group">
                {charity.featured && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                    Featured
                  </div>
                )}
                <div className="h-32 bg-muted/50 w-full relative flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                  <Heart className="h-10 w-10 text-muted-foreground/30 group-hover:text-primary/40 transition-colors" />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{charity.name}</CardTitle>
                  <div className="flex items-center text-xs text-muted-foreground gap-1 mt-2">
                    <MapPin className="h-3 w-3" /> {charity.location}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <p className="text-sm text-foreground/80 mb-6">{charity.description}</p>
                  <Button variant="outline" className="w-full gap-2 hover:bg-pink-500/10 hover:text-pink-500 hover:border-pink-500/50">
                    <Heart className="h-4 w-4" /> Support This
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No charities found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
