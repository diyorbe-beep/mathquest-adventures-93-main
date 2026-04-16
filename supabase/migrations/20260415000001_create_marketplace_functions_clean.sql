-- Create marketplace order processing function (clean version)
-- This function handles secure, atomic marketplace transactions

-- ============================================================
-- 1. Create idempotent orders table for duplicate prevention
-- ============================================================

CREATE TABLE IF NOT EXISTS public.idempotent_orders (
    idempotency_key text PRIMARY KEY,
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.idempotent_orders ENABLE ROW LEVEL SECURITY;

-- Policy for idempotent orders
CREATE POLICY "Users can view their own idempotent orders" ON public.idempotent_orders
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = idempotent_orders.order_id
        AND o.user_id = auth.uid()
    )
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_idempotent_orders_key 
ON public.idempotent_orders(idempotency_key);

CREATE INDEX IF NOT EXISTS idx_idempotent_orders_created 
ON public.idempotent_orders(created_at);

-- ============================================================
-- 2. Create marketplace order processing function
-- ============================================================

CREATE OR REPLACE FUNCTION public.process_marketplace_order(
    p_items jsonb DEFAULT '[]'::jsonb,
    p_idempotency_key text DEFAULT NULL
)
RETURNS TABLE (
    success boolean,
    order_id uuid,
    message text,
    total_amount bigint,
    new_balance bigint,
    items_processed jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_order_id uuid := gen_random_uuid();
    v_total_cost bigint := 0;
    v_current_coins bigint;
    v_item_record record;
    v_item_quantity integer;
    v_item_price bigint;
    v_item_stock integer;
    v_idempotent_order uuid;
    v_error_message text;
    v_items_processed jsonb := '[]'::jsonb;
BEGIN
    -- Validate user
    IF v_user_id IS NULL THEN
        RETURN QUERY SELECT false, NULL, 'Autentifikatsiya xatosi', 0, 0, '[]'::jsonb;
        RETURN;
    END IF;

    -- Check idempotency
    IF p_idempotency_key IS NOT NULL THEN
        SELECT order_id INTO v_idempotent_order
        FROM public.idempotent_orders
        WHERE idempotency_key = p_idempotency_key
        AND created_at > now() - interval '24 hours'
        LIMIT 1;
        
        IF v_idempotent_order IS NOT NULL THEN
            RETURN QUERY SELECT true, v_idempotent_order, 'Buyurtma allaqachon qayta ishlangan', 0, 0, '[]'::jsonb;
            RETURN;
        END IF;
    END IF;

    -- Get current user coins
    SELECT coins INTO v_current_coins
    FROM public.profiles
    WHERE user_id = v_user_id
    FOR UPDATE;

    IF v_current_coins IS NULL THEN
        RETURN QUERY SELECT false, NULL, 'Foydalanuvchi profili topilmadi', 0, 0, '[]'::jsonb;
        RETURN;
    END IF;

    -- Process each item
    FOR v_item_record IN 
        SELECT * FROM jsonb_to_recordset(p_items) AS x(item_id uuid, quantity integer)
    LOOP
        v_item_quantity := v_item_record.quantity;
        
        -- Validate item
        SELECT si.price, si.stock, si.is_active
        INTO v_item_price, v_item_stock, v_item_record.is_active
        FROM public.shop_items si
        WHERE si.id = v_item_record.item_id
        AND si.is_active = true
        FOR UPDATE;
        
        -- Check if item exists and is active
        IF v_item_price IS NULL THEN
            v_error_message := 'Mahsulot topilmadi yoki faol emas: ' || v_item_record.item_id;
            RETURN QUERY SELECT false, NULL, v_error_message, 0, 0, '[]'::jsonb;
            RETURN;
        END IF;
        
        -- Check stock
        IF v_item_stock < v_item_quantity THEN
            v_error_message := 'Mahsulot zaxirasi yetarli emas: ' || v_item_record.item_id;
            RETURN QUERY SELECT false, NULL, v_error_message, 0, 0, '[]'::jsonb;
            RETURN;
        END IF;
        
        -- Calculate cost
        v_total_cost := v_total_cost + (v_item_price * v_item_quantity);
        
        -- Add to processed items
        v_items_processed := v_items_processed || jsonb_build_object(
            'item_id', v_item_record.item_id,
            'quantity', v_item_quantity,
            'price', v_item_price,
            'subtotal', v_item_price * v_item_quantity
        );
    END LOOP;

    -- Check if user has enough coins
    IF v_current_coins < v_total_cost THEN
        v_error_message := 'Tangalar yetarli emas. Kerak: ' || v_total_cost || ', Bor: ' || v_current_coins;
        RETURN QUERY SELECT false, NULL, v_error_message, 0, v_current_coins, v_items_processed;
        RETURN;
    END IF;

    -- Create order
    INSERT INTO public.orders (
        id,
        user_id,
        total_amount,
        status,
        created_at
    ) VALUES (
        v_order_id,
        v_user_id,
        v_total_cost,
        'completed',
        now()
    );

    -- Process order items and update stock
    FOR v_item_record IN 
        SELECT * FROM jsonb_to_recordset(p_items) AS x(item_id uuid, quantity integer)
    LOOP
        v_item_quantity := v_item_record.quantity;
        
        -- Get item details for order item
        SELECT si.price, si.name, si.icon
        INTO v_item_price, v_item_record.name, v_item_record.icon
        FROM public.shop_items si
        WHERE si.id = v_item_record.item_id;
        
        -- Create order item
        INSERT INTO public.order_items (
            order_id,
            item_id,
            quantity,
            price_at_time,
            created_at
        ) VALUES (
            v_order_id,
            v_item_record.item_id,
            v_item_quantity,
            v_item_price,
            now()
        );
        
        -- Update stock
        UPDATE public.shop_items
        SET stock = stock - v_item_quantity
        WHERE id = v_item_record.item_id;
        
        -- Add to user inventory (if applicable)
        INSERT INTO public.user_inventory (
            user_id,
            item_id,
            quantity,
            acquired_from,
            created_at
        ) VALUES (
            v_user_id,
            v_item_record.item_id,
            v_item_quantity,
            'purchase',
            now()
        )
        ON CONFLICT (user_id, item_id) DO UPDATE SET
            quantity = user_inventory.quantity + EXCLUDED.quantity,
            updated_at = now();
    END LOOP;

    -- Deduct coins
    UPDATE public.profiles
    SET coins = coins - v_total_cost
    WHERE user_id = v_user_id;

    -- Log coin transaction
    INSERT INTO public.coin_logs (
        user_id,
        change,
        new_balance,
        source,
        lesson_id,
        created_at
    ) VALUES (
        v_user_id,
        -v_total_cost,
        v_current_coins - v_total_cost,
        'shop_purchase',
        NULL,
        now()
    );

    -- Record idempotency
    IF p_idempotency_key IS NOT NULL THEN
        INSERT INTO public.idempotent_orders (
            idempotency_key,
            order_id,
            created_at
        ) VALUES (
            p_idempotency_key,
            v_order_id,
            now()
        );
    END IF;

    -- Log activity
    INSERT INTO public.activity_logs (
        user_id,
        action,
        metadata,
        created_at
    ) VALUES (
        v_user_id,
        'shop_purchase',
        jsonb_build_object(
            'order_id', v_order_id,
            'total_amount', v_total_cost,
            'items_count', (SELECT COUNT(*) FROM jsonb_to_recordset(p_items))
        ),
        now()
    );

    -- Return success
    RETURN QUERY SELECT true, v_order_id, 'Xarid muvaffaqiyatli yakunlandi', v_total_cost, v_current_coins - v_total_cost, v_items_processed;
    RETURN;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log error
        INSERT INTO public.activity_logs (
            user_id,
            action,
            metadata,
            created_at
        ) VALUES (
            v_user_id,
            'shop_purchase_error',
            jsonb_build_object(
                'error_message', SQLERRM,
                'error_detail', SQLSTATE
            ),
            now()
        );
        
        RETURN QUERY SELECT false, NULL, 'Xatolik yuz berdi: ' || SQLERRM, 0, 0, '[]'::jsonb;
        RETURN;
END;
$$;

-- ============================================================
-- 3. Create cleanup function for old idempotent records
-- ============================================================

CREATE OR REPLACE FUNCTION public.cleanup_old_idempotent_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.idempotent_orders
    WHERE created_at < now() - interval '24 hours';
END;
$$;

-- ============================================================
-- 4. Grant necessary permissions
-- ============================================================

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.process_marketplace_order TO authenticated;
GRANT SELECT ON public.idempotent_orders TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_idempotent_orders TO authenticated;

-- ============================================================
-- Migration Summary
-- ============================================================
-- Created secure marketplace order processing
-- Added idempotency protection
-- Implemented atomic transactions
-- Added comprehensive error handling
-- Created audit logging
