import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const charities = [
  {
    name: "The First Tee Foundation",
    description: "Impacting the lives of young people by providing educational programs that build character and instill life-enhancing values through the game of golf.",
    image_url: "https://images.unsplash.com/photo-1535136128458-751bd7303e87?w=500&q=80",
    is_featured: true,
  },
  {
    name: "Golf Course Environmental Fund",
    description: "Funding research, education, and advocacy to advance the work of golf course superintendents and ensure the sustainability of the game.",
    image_url: "https://images.unsplash.com/photo-1593111774240-d529f12eb4d6?w=500&q=80",
    is_featured: true,
  },
  {
    name: "Birdies for the Brave",
    description: "Supporting local and national charities through pledges based on the number of birdies made by participating players worldwide.",
    image_url: "https://images.unsplash.com/photo-1587329310686-91414b8e3cb7?w=500&q=80",
    is_featured: false,
  }
];

async function seed() {
  console.log("Seeding charities...");
  
  // Check if any exist
  const { data: existing } = await supabaseAdmin.from('charities').select('id').limit(1);
  if (existing && existing.length > 0) {
    console.log("Charities already exist! Skipping.");
    return;
  }
  
  const { data, error } = await supabaseAdmin.from('charities').insert(charities).select();
  if (error) {
     console.error("Error inserting charities:", error);
  } else {
     console.log(`Successfully seeded ${data?.length || 0} charities!`);
  }
}

seed();
