"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Gamepad2,
  Swords,
  Shield,
  Compass,
  Brain,
  Cpu,
  Trophy,
  ArrowRight,
  Zap,
  Clock,
  CheckCircle,
  Download,
  Star,
  MessageSquare,
} from "lucide-react";
import GameCard from "@/components/GameCard";
import AnimatedSection from "@/components/AnimatedSection";

interface Game {
  id: string;
  title: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  imageUrl: string;
  rating?: number | null;
  featured?: boolean;
  category?: { name: string; slug: string } | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string };
  game: { title: string; imageUrl: string; slug: string };
}

const categories = [
  { name: "Action", slug: "action", icon: Swords, color: "#ef4444" },
  { name: "RPG", slug: "rpg", icon: Shield, color: "#f97316" },
  { name: "Adventure", slug: "adventure", icon: Compass, color: "#eab308" },
  { name: "Strategy", slug: "strategy", icon: Brain, color: "#f59e0b" },
  { name: "Simulation", slug: "simulation", icon: Cpu, color: "#10b981" },
  { name: "Sports", slug: "sports", icon: Trophy, color: "#ec4899" },
];

const steps = [
  { icon: Gamepad2, title: "Browse & Buy", desc: "Find your favorite games and complete your purchase" },
  { icon: Zap, title: "Upload Payment", desc: "Upload proof of payment for quick manual verification" },
  { icon: CheckCircle, title: "Get Credentials", desc: "Receive your Steam activation key and account credentials" },
  { icon: Download, title: "Play Offline", desc: "Login, disable Remote Play & Cloud, go offline and enjoy" },
];

const stats = [
  { label: "Games Available", value: "10,000+" },
  { label: "Happy Customers", value: "50,000+" },
  { label: "Average Rating", value: "4.8★" },
  { label: "Keys Delivered", value: "100,000+" },
];

export default function HomePage() {
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/games?featured=true").then((r) => r.json()),
      fetch("/api/reviews?limit=6").then((r) => r.json()),
    ]).then(([gamesData, reviewsData]) => {
      setFeaturedGames(Array.isArray(gamesData) ? gamesData : []);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#f97316]/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#eab308]/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#f97316]/5 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-block px-4 py-2 bg-[#f97316]/10 border border-[#f97316]/30 rounded-full text-[#fb923c] text-sm font-medium mb-6">
              🎮 Your One-Stop Gaming Marketplace
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black leading-tight mb-6"
          >
            Premium{" "}
            <span className="bg-gradient-to-r from-[#f97316] to-[#eab308] bg-clip-text text-transparent">
              PC Games
            </span>
            <br />
            at Unbeatable Prices
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[#94a3b8] text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Buy and sell verified PC game keys. Instant delivery, secure payments, and the best prices guaranteed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/shop"
              className="btn-gaming px-8 py-4 text-lg rounded-xl inline-flex items-center justify-center gap-2"
            >
              <span className="relative z-10 flex items-center gap-2">
                Browse Games <ArrowRight className="w-5 h-5" />
              </span>
            </Link>
            <Link
              href="/shop?sell=true"
              className="px-8 py-4 text-lg rounded-xl border border-[#272836] text-[#94a3b8] hover:text-[#f1f5f9] hover:border-[#f97316] transition-all inline-flex items-center justify-center gap-2"
            >
              Sell a Game
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Games */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9] mb-2">Featured Games</h2>
                <p className="text-[#64748b]">Top picks curated by our team</p>
              </div>
              <Link href="/shop" className="text-[#fb923c] hover:text-[#f97316] text-sm font-medium flex items-center gap-1 transition-colors">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </AnimatedSection>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-[#0f1019] border border-[#272836] rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-[16/10] bg-[#181926]" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-[#181926] rounded w-1/3" />
                    <div className="h-5 bg-[#181926] rounded w-2/3" />
                    <div className="h-6 bg-[#181926] rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredGames.map((game, i) => (
                <AnimatedSection key={game.id} delay={i * 0.1}>
                  <GameCard game={game} />
                </AnimatedSection>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-[#64748b]">
              <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-[#272836]" />
              <p className="text-lg">No featured games yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4 bg-[#0f1019]/50">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9] mb-2">Browse by Category</h2>
              <p className="text-[#64748b]">Find games that match your style</p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <AnimatedSection key={cat.slug} delay={i * 0.05}>
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="block p-6 bg-[#0f1019] border border-[#272836] rounded-xl text-center hover:border-[#f97316] transition-all duration-300 group hover:shadow-[0_8px_30px_rgba(249,115,22,0.15)]"
                >
                  <cat.icon
                    className="w-10 h-10 mx-auto mb-3 transition-colors group-hover:scale-110 transform"
                    style={{ color: cat.color }}
                  />
                  <span className="text-[#f1f5f9] text-sm font-medium">{cat.name}</span>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9] mb-2">How It Works</h2>
              <p className="text-[#64748b]">Get your games in 4 simple steps</p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <AnimatedSection key={step.title} delay={i * 0.1}>
                <div className="text-center relative">
                  {i < 3 && (
                    <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-[#f97316]/50 to-transparent" />
                  )}
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#f97316]/10 border border-[#f97316]/30 flex items-center justify-center relative">
                    <step.icon className="w-9 h-9 text-[#f97316]" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-[#f97316] rounded-full text-white text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-[#f1f5f9] font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-[#64748b] text-sm leading-relaxed">{step.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 bg-[#0f1019]/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <AnimatedSection key={stat.label} delay={i * 0.1}>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-[#f97316] to-[#eab308] bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-[#64748b] text-sm">{stat.label}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Live Reviews */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#f97316]/10 rounded-full text-[#fb923c] text-sm font-medium mb-4">
                <MessageSquare className="w-4 h-4" />
                Live Reviews
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9] mb-2">What Gamers Say</h2>
              <p className="text-[#64748b]">Trusted by thousands of gamers worldwide</p>
            </div>
          </AnimatedSection>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review, i) => (
                <AnimatedSection key={review.id} delay={i * 0.1}>
                  <div className="bg-[#0f1019] border border-[#272836] rounded-xl p-6 hover:border-[#f97316]/50 transition-all h-full flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#f97316]/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-[#f97316]">
                            {review.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#f1f5f9]">{review.user.name}</p>
                          <p className="text-xs text-[#64748b]">{review.game.title}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= review.rating
                                ? "text-[#f59e0b] fill-[#f59e0b]"
                                : "text-[#2a2a4a]"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-[#94a3b8] text-sm leading-relaxed flex-1">&ldquo;{review.comment}&rdquo;</p>
                    <p className="text-xs text-[#64748b] mt-3">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[#64748b]">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No reviews yet. Be the first to share your experience!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <AnimatedSection>
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-[#f97316]/10 to-[#eab308]/10 border border-[#f97316]/30 rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#f97316]/10 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9] mb-4">Ready to Start Gaming?</h2>
              <p className="text-[#94a3b8] mb-8 max-w-xl mx-auto">
                Join thousands of gamers who are already saving big on their favorite titles.
              </p>
              <Link
                href="/shop"
                className="btn-gaming px-8 py-4 text-lg rounded-xl inline-flex items-center gap-2"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Explore the Store <ArrowRight className="w-5 h-5" />
                </span>
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>
    </div>
  );
}
