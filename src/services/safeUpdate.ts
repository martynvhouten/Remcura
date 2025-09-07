import { supabase } from '@/boot/supabase';

type TableName =
  | 'counting_sessions'
  | 'counting_entries'
  | 'stock_levels'
  | 'stock_movements'
  | 'order_lists'
  | 'order_list_items'
  | 'product_batches';

export async function safeUpdateByIdAndPractice<
  T extends Record<string, unknown>,
>(table: TableName, id: string, practiceId: string, updates: Partial<T>) {
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq('id', id)
    .eq('practice_id', practiceId)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as T;
}
