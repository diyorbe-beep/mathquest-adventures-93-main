import { ArrowLeft } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useCoinBalance, usePurchaseShopItem, useShopItems, useUserInventory } from '@/hooks/useShop';

const ShopPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: items, isLoading } = useShopItems();
  const { data: coins = 0 } = useCoinBalance();
  const { data: inventory } = useUserInventory();
  const purchase = usePurchaseShopItem();

  if (!user) return <Navigate to="/auth" replace />;

  const ownedMap = new Map((inventory ?? []).map((x) => [x.item_id, x.quantity]));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3 max-w-3xl">
          <div className="flex items-center gap-3">
            <button onClick={() => { navigate('/dashboard'); }} className="rounded-xl p-2 hover:bg-muted transition-colors active:scale-95">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-extrabold text-foreground">🛍️ Magazin</h1>
          </div>
          <div className="rounded-full bg-quest-yellow/10 px-3 py-1.5 text-sm font-black text-quest-yellow">
            🪙 {coins}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        {isLoading ? (
          <div className="animate-pulse text-center py-10 font-bold text-primary">Magazin yuklanmoqda...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(items ?? []).map((item: any) => {
              const owned = ownedMap.get(item.id) ?? 0;
              const canBuy = coins >= Number(item.price ?? 0);
              return (
                <div key={item.id} className="rounded-2xl bg-card p-4 shadow-sm border border-border">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-3xl">{item.icon ?? '🎁'}</p>
                      <h3 className="font-extrabold text-foreground mt-1">{item.name}</h3>
                      <p className="text-xs font-semibold text-muted-foreground mt-1">{item.description}</p>
                    </div>
                    <span className="rounded-full bg-quest-yellow/10 px-2.5 py-1 text-xs font-black text-quest-yellow">
                      🪙 {item.price}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground">Sizda: {owned} ta</p>
                    <button
                      onClick={async () => {
                        try {
                          const res = await purchase.mutateAsync(item.id);
                          toast.success(res.message || 'Sotib olindi');
                        } catch (e: any) {
                          toast.error(e.message || 'Sotib olishda xatolik');
                        }
                      }}
                      disabled={purchase.isPending || !canBuy}
                      className="rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-foreground shadow-md transition-all active:scale-[0.97] disabled:opacity-50"
                    >
                      {canBuy ? 'Sotib olish' : 'Coin yetarli emas'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ShopPage;
