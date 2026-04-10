import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  XCircle,
  ShoppingBag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MarketplaceService } from '@/services/marketplaceService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';

const OrdersPage = () => {
  const navigate = useNavigate();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['marketplace_orders'],
    queryFn: () => MarketplaceService.getUserOrders()
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'processing': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'shipped': return <Truck className="h-4 w-4 text-orange-500" />;
      case 'delivered': return <Package className="h-4 w-4 text-primary" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'To\'langan';
      case 'processing': return 'Tayyorlanmoqda';
      case 'shipped': return 'Yo\'lda';
      case 'delivered': return 'Yetkazildi';
      case 'cancelled': return 'Bekor qilindi';
      default: return 'Kutilmoqda';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center gap-4 px-4 max-w-3xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate('/shop')} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold tracking-tight">Buyurtmalarim</h1>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse border" />
            ))}
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
            <ShoppingBag className="h-16 w-16 mb-4" />
            <h3 className="text-xl font-bold">Buyurtmalar mavjud emas</h3>
            <p className="text-sm text-muted-foreground mt-2">Hali hech narsa sotib olmadingiz</p>
            <Button className="mt-6 rounded-xl" onClick={() => navigate('/shop')}>
              Magazinga o'tish
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-md"
              >
                <div className="p-5 border-b bg-muted/30 flex items-center justify-between flex-wrap gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Buyurtma #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {format(new Date(order.created_at), 'd-MMMM, HH:mm', { locale: uz })}
                    </p>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-2 py-1 px-3 rounded-full bg-background">
                    {getStatusIcon(order.status)}
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>

                <div className="p-5">
                  <div className="space-y-4">
                    {order.order_items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">
                          {item.shop_items?.icon || '📦'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm line-clamp-1">
                            {item.shop_items?.name || 'O\'chirilgan mahsulot'}
                          </h4>
                          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                            {item.quantity} ta • 🪙 {item.unit_price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-5 border-t flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Umumiy summa:</span>
                    <span className="font-black text-xl flex items-center gap-1">
                      <span className="text-base">🪙</span> {order.total_amount}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrdersPage;
