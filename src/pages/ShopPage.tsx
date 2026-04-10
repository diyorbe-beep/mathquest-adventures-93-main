import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  ShoppingCart, 
  ArrowLeft, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ChevronRight,
  Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { MarketplaceService } from '@/services/marketplaceService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCoinBalance } from '@/hooks/useShop';

const ShopPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    items: cartItems, 
    addItem, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    totalPrice: cartTotal 
  } = useCart();
  const { data: coins = 0, refetch: refetchCoins } = useCoinBalance();
  const queryClient = useQueryClient();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  // Fetch items using new service
  const { data: items, isLoading } = useQuery({
    queryKey: ['marketplace_items'],
    queryFn: () => MarketplaceService.getShopItems()
  });

  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (activeCategory === 'all') return items;
    return items.filter((item: any) => item.category === activeCategory);
  }, [items, activeCategory]);

  const categories = [
    { id: 'all', name: 'Barchasi', icon: '🛍️' },
    { id: 'hearts', name: 'Yuraklar', icon: '❤️' },
    { id: 'boost', name: 'Tezlashtirish', icon: '⚡' },
    { id: 'avatar', name: 'Avatar', icon: '👤' },
    { id: 'hint', name: 'Maslahat', icon: '💡' },
  ];

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    if (coins < cartTotal) {
      toast.error('Coinlar yetarli emas!');
      return;
    }

    setIsCheckingOut(true);
    const idempotencyKey = `order_${user?.id}_${Date.now()}`;

    try {
      const result = await MarketplaceService.checkout(cartItems, idempotencyKey);
      if (result.success) {
        toast.success('Xarid muvaffaqiyatli yakunlandi!');
        clearCart();
        setIsCartOpen(false);
        refetchCoins();
        queryClient.invalidateQueries({ queryKey: ['user_inventory'] });
        queryClient.invalidateQueries({ queryKey: ['marketplace_orders'] });
      }
    } catch (error: any) {
      // Error handled in service
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold tracking-tight">Marketplace</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-full font-bold text-sm border border-yellow-500/20">
              <span className="text-base">🪙</span> {coins}
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full"
              onClick={() => navigate('/orders')}
              title="Buyurtmalar"
            >
              <Package className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="relative rounded-full"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {cartItems.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? 'default' : 'outline'}
              className="rounded-full whitespace-nowrap"
              onClick={() => setActiveCategory(cat.id)}
            >
              <span className="mr-2 text-base">{cat.icon}</span>
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Item Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse border border-border" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item: any) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -4 }}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card p-4 transition-all hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 text-3xl transition-transform group-hover:scale-110">
                      {item.icon}
                    </div>
                    {item.stock_quantity <= 10 && (
                      <Badge variant="destructive" className="animate-pulse">
                        Faqat {item.stock_quantity} ta qoldi
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {item.category}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                      <span className="text-xs font-bold text-primary flex items-center gap-1">
                         <Package className="h-3 w-3" /> {item.vendors?.business_name || 'Bosh do\'kon'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground line-clamp-1">{item.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-4">
                    <div className="font-black text-2xl flex items-center gap-1">
                      <span className="text-base grayscale group-hover:grayscale-0 transition-all">🪙</span>
                      {item.price}
                    </div>
                    <Button 
                      onClick={() => addItem(item)}
                      disabled={item.stock_quantity <= 0}
                      className="rounded-xl font-bold"
                    >
                      {item.stock_quantity > 0 ? (
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4" /> Savatga
                        </div>
                      ) : (
                        'Tugadi'
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Cart Drawer Simulation (Overlay) */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-card border-l shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-2xl font-black flex items-center gap-3">
                  <ShoppingCart className="h-6 w-6 text-primary" /> Savat
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)} className="rounded-full">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                    <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-4xl">
                      🛒
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Savat bo'sh</h3>
                      <p className="text-sm text-muted-foreground">O'zingizga kerakli mahsulotlarni qo'shing</p>
                    </div>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-foreground line-clamp-1">{item.name}</h4>
                        <div className="mt-1 flex items-center gap-2 text-sm">
                          <span className="font-bold text-primary">🪙 {item.price}</span>
                          <span className="text-muted-foreground">x {item.quantity}</span>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex items-center border rounded-lg overflow-hidden h-8 bg-background">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 hover:bg-muted transition-colors border-r"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-3 text-xs font-bold leading-none">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 hover:bg-muted transition-colors border-l"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-destructive hover:scale-110 transition-transform"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-6 border-t bg-muted/30 space-y-4">
                  <div className="flex items-center justify-between text-lg">
                    <span className="text-muted-foreground font-medium">Jami:</span>
                    <span className="font-black text-2xl flex items-center gap-2">
                      <span className="text-lg">🪙</span> {cartTotal}
                    </span>
                  </div>
                  
                  {coins < cartTotal && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold">
                      <AlertCircle className="h-4 w-4" />
                      Yana {cartTotal - coins} coin yetarli emas
                    </div>
                  )}

                  <Button 
                    className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20"
                    disabled={coins < cartTotal || isCheckingOut}
                    onClick={handleCheckout}
                  >
                    {isCheckingOut ? (
                      <div className="flex items-center gap-3">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        >
                          <Clock className="h-5 w-5" />
                        </motion.div>
                        Xarid qilinmoqda...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" /> Tasdiqlash
                      </div>
                    )}
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShopPage;
