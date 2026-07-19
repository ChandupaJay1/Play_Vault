"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Zap,
  Star,
  Tag,
  ChevronRight,
  Loader2,
  Gamepad2,
  Users,
  Building,
  Calendar,
  Package,
  Key,
  Lock,
  Copy,
  Check,
  Eye,
  EyeOff,
  Shield,
  MessageSquare,
} from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useSession } from "next-auth/react";
import GameCard from "@/components/GameCard";
import toast from "react-hot-toast";

interface Game {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  imageUrl: string;
  platform?: string | null;
  developer?: string | null;
  publisher?: string | null;
  releaseDate?: string | null;
  rating?: number | null;
  inStock?: boolean;
  category?: { name: string; slug: string } | null;
}

interface PurchaseData {
  purchased: boolean;
  orderId?: string;
  key?: string | null;
  keyStatus?: string | null;
  steam?: { email: string; password: string } | null;
}

interface ReviewData {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string };
  game: { title: string; imageUrl: string; slug: string };
}

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const { data: session } = useSession();

  const [game, setGame] = useState<Game | null>(null);
  const [similar, setSimilar] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchase, setPurchase] = useState<PurchaseData | null>(null);
  const [redeemKey, setRedeemKey] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [steamRevealed, setSteamRevealed] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    fetch("/api/games")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          setError("Failed to load game");
          setLoading(false);
          return;
        }
        const found = data.find((g: Game) => g.slug === slug);
        if (found) {
          setGame(found);
          const sim = data
            .filter((g: Game) => g.category?.slug === found.category?.slug && g.id !== found.id)
            .slice(0, 4);
          setSimilar(sim);
        } else {
          setError("Game not found");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load game");
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    if (!game || !session) return;
    fetch(`/api/games/${game.id}/purchase`)
      .then((r) => r.json())
      .then((data) => {
        if (data.purchased) {
          setPurchase(data);
          setHasPurchased(true);
          if (data.steam) setSteamRevealed(true);
        }
      })
      .catch(() => {});
  }, [game, session]);

  useEffect(() => {
    if (!game) return;
    fetch(`/api/reviews?gameId=${game.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setReviews(data);
          if (session) {
            const userId = (session.user as { id?: string })?.id;
            setHasReviewed(data.some((r: ReviewData) => false));
          }
        }
      })
      .catch(() => {});
  }, [game, session]);

  const inCart = game ? items.some((i) => i.gameId === game.id) : false;
  const discount =
    game?.originalPrice
      ? Math.round(((game.originalPrice - game.price) / game.originalPrice) * 100)
      : 0;

  const handleAddToCart = () => {
    if (!game || inCart) return;
    addItem({
      gameId: game.id,
      title: game.title,
      price: game.price,
      imageUrl: game.imageUrl,
    });
    toast.success("Added to cart!");
  };

  const handleBuyNow = () => {
    if (!game) return;
    if (!inCart) {
      addItem({
        gameId: game.id,
        title: game.title,
        price: game.price,
        imageUrl: game.imageUrl,
      });
    }
    router.push("/checkout");
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemKey.trim()) {
      toast.error("Enter your activation key");
      return;
    }
    setRedeeming(true);
    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: redeemKey.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Invalid key");
      }
      const data = await res.json();
      setSteamRevealed(true);
      setPurchase((prev) => prev ? { ...prev, steam: data.steam } : prev);
      setRedeemKey("");
      toast.success("Key verified! Steam credentials revealed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to verify key");
    } finally {
      setRedeeming(false);
    }
  };

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!game || !reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: game.id, rating: reviewRating, comment: reviewComment.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
      }
      const newReview = await res.json();
      setReviews((prev) => [newReview, ...prev]);
      setReviewComment("");
      setReviewRating(5);
      setHasReviewed(true);
      toast.success("Review submitted!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#f97316] animate-spin" />
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <Gamepad2 className="w-16 h-16 text-[#2a2a4a] mb-4" />
        <h1 className="text-2xl font-bold text-[#f1f5f9] mb-2">{error || "Game not found"}</h1>
        <Link href="/shop" className="text-[#fb923c] hover:text-[#f97316] mt-4">
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <nav className="flex items-center gap-2 text-sm text-[#64748b] mb-8">
          <Link href="/" className="hover:text-[#fb923c] transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/shop" className="hover:text-[#fb923c] transition-colors">Shop</Link>
          <ChevronRight className="w-4 h-4" />
          {game.category && (
            <>
              <Link href={`/shop?category=${game.category.slug}`} className="hover:text-[#fb923c] transition-colors">
                {game.category.name}
              </Link>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
          <span className="text-[#94a3b8]">{game.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-2xl overflow-hidden bg-[#0d0d24] aspect-[16/10]"
          >
            <img
              src={game.imageUrl}
              alt={game.title}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#ef4444] rounded-lg text-white text-sm font-bold">
                -{discount}% OFF
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            {game.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f97316]/10 text-[#fb923c] text-xs font-medium rounded-full">
                <Tag className="w-3 h-3" />
                {game.category.name}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-[#f1f5f9]">{game.title}</h1>

            {game.rating && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(game.rating!) ? "text-[#f59e0b] fill-[#f59e0b]" : "text-[#2a2a4a]"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[#94a3b8] text-sm">({game.rating.toFixed(1)})</span>
              </div>
            )}

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-[#f1f5f9]">Rs. {game.price.toFixed(2)}</span>
              {game.originalPrice && (
                <span className="text-lg text-[#64748b] line-through">Rs. {game.originalPrice.toFixed(2)}</span>
              )}
            </div>

            <p className="text-[#94a3b8] leading-relaxed">{game.description}</p>

            <div className="grid grid-cols-2 gap-3">
              {game.developer && (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="w-4 h-4 text-[#64748b]" />
                  <span className="text-[#64748b]">Developer:</span>
                  <span className="text-[#f1f5f9]">{game.developer}</span>
                </div>
              )}
              {game.publisher && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-[#64748b]" />
                  <span className="text-[#64748b]">Publisher:</span>
                  <span className="text-[#f1f5f9]">{game.publisher}</span>
                </div>
              )}
              {game.platform && (
                <div className="flex items-center gap-2 text-sm">
                  <Gamepad2 className="w-4 h-4 text-[#64748b]" />
                  <span className="text-[#64748b]">Platform:</span>
                  <span className="text-[#f1f5f9]">{game.platform}</span>
                </div>
              )}
              {game.releaseDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-[#64748b]" />
                  <span className="text-[#64748b]">Release:</span>
                  <span className="text-[#f1f5f9]">{game.releaseDate}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#10b981]" />
              <span className="text-[#10b981] text-sm font-medium">
                {game.inStock !== false ? "In Stock - Instant Delivery" : "Out of Stock"}
              </span>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={inCart || game.inStock === false}
                className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  inCart
                    ? "bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30"
                    : "btn-gaming"
                } disabled:opacity-50`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  {inCart ? "Already in Cart" : "Add to Cart"}
                </span>
              </button>
              <button
                onClick={handleBuyNow}
                disabled={game.inStock === false}
                className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 border border-[#eab308] text-[#eab308] hover:bg-[#eab308]/10 transition-all disabled:opacity-50"
              >
                <Zap className="w-5 h-5" />
                Buy Now
              </button>
            </div>
          </motion.div>
        </div>

        {session && purchase?.purchased && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-16"
          >
            <div className="bg-[#0f1019] border border-[#272836] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#272836] flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#eab308]" />
                <h2 className="text-lg font-semibold text-[#f1f5f9]">Steam Accounts</h2>
              </div>
              <div className="p-6">
                {!steamRevealed ? (
                  <div className="text-center">
                    <Lock className="w-10 h-10 text-[#64748b] mx-auto mb-3" />
                    <h3 className="text-[#f1f5f9] font-semibold mb-1">Enter Game Code</h3>
                    <p className="text-sm text-[#64748b] mb-4">
                      This game is protected. Enter the activation key shared by admin.
                    </p>
                    <form onSubmit={handleRedeem} className="flex gap-3 max-w-md mx-auto">
                      <input
                        type="text"
                        value={redeemKey}
                        onChange={(e) => setRedeemKey(e.target.value)}
                        placeholder="PV-XXXXX-XXXXX-XXXXX"
                        className="flex-1 px-4 py-3 bg-[#05050a] border border-[#272836] rounded-xl text-[#f1f5f9] font-mono text-center placeholder:text-[#64748b] focus:border-[#f97316] focus:outline-none transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={redeeming || !redeemKey.trim()}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#f97316] to-[#eab308] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
                      >
                        {redeeming ? <Loader2 className="w-5 h-5 animate-spin" /> : "UNLOCK"}
                      </button>
                    </form>
                  </div>
                ) : purchase?.steam ? (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="px-2 py-1 bg-[#10b981]/10 border border-[#10b981]/20 rounded text-[#10b981] text-xs font-medium">
                        ACTIVE ACCESS
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center justify-between p-4 bg-[#05050a] rounded-xl border border-[#272836]">
                        <div className="flex items-center gap-3 min-w-0">
                          <Key className="w-4 h-4 text-[#64748b] shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-[#64748b] uppercase">Username</p>
                            <p className="text-sm text-[#f1f5f9] font-mono truncate">{purchase.steam.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCopy(purchase.steam!.email, "email")}
                          className="p-2 rounded-lg hover:bg-white/5 text-[#64748b] hover:text-[#f1f5f9] transition-colors shrink-0"
                        >
                          {copiedField === "email" ? <Check className="w-4 h-4 text-[#10b981]" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-[#05050a] rounded-xl border border-[#272836]">
                        <div className="flex items-center gap-3 min-w-0">
                          <Lock className="w-4 h-4 text-[#64748b] shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-[#64748b] uppercase">Password</p>
                            <p className="text-sm text-[#f1f5f9] font-mono truncate">
                              {showPassword ? purchase.steam.password : "•".repeat(purchase.steam.password.length)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="p-2 rounded-lg hover:bg-white/5 text-[#64748b] hover:text-[#f1f5f9] transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleCopy(purchase.steam!.password, "password")}
                            className="p-2 rounded-lg hover:bg-white/5 text-[#64748b] hover:text-[#f1f5f9] transition-colors"
                          >
                            {copiedField === "password" ? <Check className="w-4 h-4 text-[#10b981]" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-[#64748b] py-4">
                    <p>No Steam account assigned yet. Please contact support.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {!session && (
          <div className="max-w-2xl mx-auto mb-16">
            <div className="bg-[#0f1019] border border-[#272836] rounded-xl p-6 text-center">
              <Lock className="w-10 h-10 text-[#64748b] mx-auto mb-3" />
              <h3 className="text-[#f1f5f9] font-semibold mb-1">Login to view Steam credentials</h3>
              <p className="text-sm text-[#64748b] mb-4">Sign in to access your purchased game keys.</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white font-medium transition-colors text-sm"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}

        {similar.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-[#f1f5f9] mb-6">Similar Games</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similar.map((g) => (
                <GameCard key={g.id} game={g} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-6 h-6 text-[#f97316]" />
            <h2 className="text-2xl font-bold text-[#f1f5f9]">Reviews</h2>
            <span className="text-sm text-[#64748b]">({reviews.length})</span>
          </div>

          {session && hasPurchased && !hasReviewed && (
            <div className="bg-[#0f1019] border border-[#272836] rounded-xl p-6 mb-6">
              <h3 className="text-[#f1f5f9] font-semibold mb-4">Write a Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs text-[#64748b] mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-0.5"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewRating
                              ? "text-[#f59e0b] fill-[#f59e0b]"
                              : "text-[#2a2a4a]"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  placeholder="Share your experience with this game..."
                  className="w-full px-4 py-3 bg-[#05050a] border border-[#272836] rounded-xl text-[#f1f5f9] text-sm placeholder:text-[#64748b] focus:border-[#f97316] focus:outline-none resize-none"
                />
                <button
                  type="submit"
                  disabled={submittingReview || !reviewComment.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#f97316] to-[#eab308] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          )}

          {session && hasPurchased && hasReviewed && (
            <div className="bg-[#10b981]/5 border border-[#10b981]/20 rounded-xl p-4 mb-6 text-center">
              <p className="text-sm text-[#10b981]">You have already reviewed this game</p>
            </div>
          )}

          {!session && (
            <div className="bg-[#0f1019] border border-[#272836] rounded-xl p-6 mb-6 text-center">
              <p className="text-sm text-[#64748b]">
                <Link href="/login" className="text-[#f97316] hover:underline">Sign in</Link> to leave a review
              </p>
            </div>
          )}

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-12 text-[#64748b]">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No reviews yet. Be the first to review this game!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-[#0f1019] border border-[#272836] rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#f97316]/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-[#f97316]">
                          {review.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#f1f5f9]">{review.user.name}</p>
                        <p className="text-xs text-[#64748b]">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? "text-[#f59e0b] fill-[#f59e0b]"
                              : "text-[#2a2a4a]"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-[#94a3b8] leading-relaxed">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
