import { useState } from 'react';
import { useShop } from '@/hooks/useShop';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star, Trophy } from 'lucide-react';
import { toast } from 'sonner';

const ShopPage = () => {
  const { 
    shopItems, 
    userInventory, 
    userStats, 
    itemsLoading, 
    inventoryLoading, 
    purchaseMutation,
    getItemQuantity,
    canAfford 
  } = useShop();

  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter items by category
  const filteredItems = selectedCategory === 'all' 
    ? shopItems 
    : shopItems.filter(item => item.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'Barchasi', icon: '🛍️' },
    { id: 'hearts', name: 'Yuraklar', icon: '❤️' },
    { id: 'boost', name: 'Tezlashtirish', icon: '⚡' },
    { id: 'avatar', name: 'Avatarkar', icon: '👤' },
    { id: 'hint', name: 'Maslahat', icon: '💡' },
  ];

  const handlePurchase = async (itemId: string, price: number) => {
    if (!canAfford(price)) {
      toast.error('Coinlar yetarli emas!');
      return;
    }

    try {
      await purchaseMutation.mutateAsync({ itemId, quantity: 1 });
      toast.success('Xarid muvaffaqiyatli!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (itemsLoading || inventoryLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-2xl font-bold animate-pulse text-primary">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black text-center mb-8">🛍️ Magazin</h1>
          
          {/* User Stats */}
          {userStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="rounded-2xl bg-card p-6 text-center shadow-lg">
                <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{userStats.hearts}</div>
                <div className="text-sm text-muted-foreground">Yuraklar</div>
              </div>
              
              <div className="rounded-2xl bg-card p-6 text-center shadow-lg">
                <div className="text-4xl font-bold text-yellow-500 mb-2">🪙</div>
                <div className="text-2xl font-bold text-foreground">{userStats.coins}</div>
                <div className="text-sm text-muted-foreground">Tangalar</div>
              </div>
              
              <div className="rounded-2xl bg-card p-6 text-center shadow-lg">
                <Trophy className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{userStats.level}</div>
                <div className="text-sm text-muted-foreground">Daraja</div>
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>

          {/* Shop Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => {
              const ownedQuantity = getItemQuantity(item.id);
              const canPurchase = canAfford(item.price);
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`rounded-2xl bg-card p-6 shadow-lg border-2 ${
                    !canPurchase ? 'border-gray-200 opacity-60' : 'border-border hover:border-primary/20'
                  }`}
                >
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">{item.icon}</div>
                    <h3 className="font-bold text-foreground mb-2">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-foreground">{item.price}</div>
                      <div className="text-sm text-muted-foreground">tanga</div>
                    </div>
                    
                    {ownedQuantity > 0 && (
                      <div className="text-sm font-semibold text-green-600">
                        Sizda: {ownedQuantity} ta
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handlePurchase(item.id, item.price)}
                    disabled={!canPurchase || purchaseMutation.isPending}
                    className={`w-full py-3 rounded-xl font-bold transition-all ${
                      canPurchase && !purchaseMutation.isPending
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    {purchaseMutation.isPending ? (
                      <span>Xaridamoqda...</span>
                    ) : ownedQuantity > 0 ? (
                      <span>Qo'shish ({ownedQuantity} ta)</span>
                    ) : canPurchase ? (
                      <span>Sotib olish ({item.price} tanga)</span>
                    ) : (
                      <span>Yetarli tangalar kerak</span>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ShopPage;
