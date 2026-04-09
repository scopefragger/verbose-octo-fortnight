import { supabase } from '../db/supabase.js';

/**
 * Add an expense for a family.
 */
export async function addExpense(familyId, { amount, category, note, paid_by, expense_date }, userId) {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      family_id: familyId,
      amount,
      category,
      note: note || null,
      paid_by: paid_by || null,
      expense_date: expense_date || new Date().toISOString().split('T')[0],
      created_by: userId || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * List expenses for a family, optionally filtered by month/year and/or category.
 */
export async function listExpenses(familyId, { month, year, category } = {}) {
  let query = supabase
    .from('expenses')
    .select('id, amount, category, note, paid_by, expense_date, created_at')
    .eq('family_id', familyId)
    .order('expense_date', { ascending: false });

  if (month && year) {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = new Date(year, month, 0).toISOString().split('T')[0]; // last day of month
    query = query.gte('expense_date', start).lte('expense_date', end);
  } else if (year) {
    query = query.gte('expense_date', `${year}-01-01`).lte('expense_date', `${year}-12-31`);
  }

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) {
    if (error.code === 'PGRST205') return [];
    throw error;
  }
  return data || [];
}

/**
 * Get monthly spend per category for the given month/year.
 * Joins with budgets to include limit and remaining.
 */
export async function getMonthlySpend(familyId, month, year) {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const end = new Date(year, month, 0).toISOString().split('T')[0];

  const [expensesRes, budgetsRes] = await Promise.all([
    supabase
      .from('expenses')
      .select('category, amount')
      .eq('family_id', familyId)
      .gte('expense_date', start)
      .lte('expense_date', end),
    supabase
      .from('budgets')
      .select('category, monthly_limit')
      .eq('family_id', familyId),
  ]);

  if (expensesRes.error) {
    if (expensesRes.error.code === 'PGRST205') return [];
    throw expensesRes.error;
  }
  if (budgetsRes.error) {
    if (budgetsRes.error.code === 'PGRST205') {
      // no budgets table yet — just aggregate expenses
    } else {
      throw budgetsRes.error;
    }
  }

  const expenses = expensesRes.data || [];
  const budgets = budgetsRes.data || [];

  // Aggregate spend per category
  const spendMap = {};
  for (const e of expenses) {
    spendMap[e.category] = (spendMap[e.category] || 0) + parseFloat(e.amount);
  }

  // Build budget map
  const budgetMap = {};
  for (const b of budgets) {
    budgetMap[b.category] = parseFloat(b.monthly_limit);
  }

  // Combine: include all categories that have spend or a budget
  const allCategories = new Set([...Object.keys(spendMap), ...Object.keys(budgetMap)]);
  const result = [];
  for (const category of allCategories) {
    const spent = spendMap[category] || 0;
    const limit = budgetMap[category] || null;
    result.push({
      category,
      spent: Math.round(spent * 100) / 100,
      limit,
      remaining: limit !== null ? Math.round((limit - spent) * 100) / 100 : null,
    });
  }

  return result.sort((a, b) => a.category.localeCompare(b.category));
}

/**
 * Set (upsert) a monthly budget for a category.
 */
export async function setBudget(familyId, { category, monthly_limit }) {
  const { data, error } = await supabase
    .from('budgets')
    .upsert(
      { family_id: familyId, category, monthly_limit },
      { onConflict: 'family_id,category' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * List all budgets for a family.
 */
export async function listBudgets(familyId) {
  const { data, error } = await supabase
    .from('budgets')
    .select('id, category, monthly_limit, created_at')
    .eq('family_id', familyId)
    .order('category', { ascending: true });
  if (error) {
    if (error.code === 'PGRST205') return [];
    throw error;
  }
  return data || [];
}

/**
 * Delete an expense by ID, scoped to a family.
 */
export async function deleteExpense(familyId, expenseId) {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId)
    .eq('family_id', familyId);
  if (error) throw error;
  return { deleted: true };
}
