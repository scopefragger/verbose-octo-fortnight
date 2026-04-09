import * as calendar from '../services/calendar.js';
import * as reminders from '../services/reminders.js';
import * as lists from '../services/lists.js';
import * as countdowns from '../services/countdowns.js';
import * as points from '../services/points.js';
import * as meals from '../services/meals.js';
import * as themes from '../services/themes.js';
import { seedUKHolidays } from '../services/holidays.js';
import * as foodExpiry from '../services/foodExpiry.js';
import * as expenses from '../services/expenses.js';
import * as chores from '../services/chores.js';
import { formatForUser } from '../utils/time.js';
import { invalidateDashboardCache } from '../utils/cache.js';

/**
 * Tool definitions in OpenAI-compatible format (used by Groq).
 */
export const tools = [
  {
    type: 'function',
    function: {
      name: 'create_event',
      description: 'Create a new calendar event. The calendar is shared with the whole family.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Event title' },
          starts_at: { type: 'string', description: 'ISO 8601 datetime for when the event starts' },
          ends_at: { type: 'string', description: 'ISO 8601 datetime for when the event ends (optional)' },
          description: { type: 'string', description: 'Optional event description' },
          all_day: { type: 'boolean', description: 'Whether this is an all-day event' },
        },
        required: ['title', 'starts_at'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_events',
      description: 'List calendar events within a date range.',
      parameters: {
        type: 'object',
        properties: {
          start_date: { type: 'string', description: 'Start of range (ISO 8601 date or datetime)' },
          end_date: { type: 'string', description: 'End of range (ISO 8601 date or datetime)' },
        },
        required: ['start_date', 'end_date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_event',
      description: 'Delete a calendar event. You can specify the event by title and/or date — no ID needed. If both title and date are given, matches by both. If only one is given, matches by that.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Title or description of the event to delete (fuzzy match)' },
          date: { type: 'string', description: 'Date of the event in YYYY-MM-DD format' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_reminder',
      description: 'Set a personal reminder. The bot will send a Telegram message at the specified time. Can be one-off or recurring.',
      parameters: {
        type: 'object',
        properties: {
          message: { type: 'string', description: 'Reminder message text' },
          remind_at: { type: 'string', description: 'ISO 8601 datetime for when to send the first reminder' },
          recurrence: { type: 'string', enum: ['daily', 'weekdays', 'weekly', 'biweekly', 'monthly'], description: 'Optional recurrence pattern. Omit for one-off reminders.' },
        },
        required: ['message', 'remind_at'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_reminders',
      description: 'List all pending (unsent) reminders for the current user.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_reminder',
      description: 'Cancel a pending reminder by its ID.',
      parameters: {
        type: 'object',
        properties: {
          reminder_id: { type: 'string', description: 'UUID of the reminder to cancel' },
        },
        required: ['reminder_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_list',
      description: 'Get all items on a shared list (e.g. grocery, to-do).',
      parameters: {
        type: 'object',
        properties: {
          list_name: { type: 'string', description: 'Name of the list (e.g. "grocery", "to-do")' },
        },
        required: ['list_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_list_item',
      description: 'Add an item to a shared list. Creates the list if it does not exist.',
      parameters: {
        type: 'object',
        properties: {
          list_name: { type: 'string', description: 'Name of the list' },
          item_text: { type: 'string', description: 'Text of the item to add' },
        },
        required: ['list_name', 'item_text'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_list_item',
      description: 'Check off (mark as done) an item on a shared list.',
      parameters: {
        type: 'object',
        properties: {
          list_name: { type: 'string', description: 'Name of the list' },
          item_text: { type: 'string', description: 'Text of the item to check off (fuzzy match)' },
        },
        required: ['list_name', 'item_text'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'remove_list_item',
      description: 'Remove an item from a shared list entirely.',
      parameters: {
        type: 'object',
        properties: {
          list_name: { type: 'string', description: 'Name of the list' },
          item_text: { type: 'string', description: 'Text of the item to remove (fuzzy match)' },
        },
        required: ['list_name', 'item_text'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_list',
      description: 'Create a new empty shared list.',
      parameters: {
        type: 'object',
        properties: {
          list_name: { type: 'string', description: 'Name for the new list' },
        },
        required: ['list_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'clear_list',
      description: 'Remove ALL items from a shared list, clearing it completely.',
      parameters: {
        type: 'object',
        properties: {
          list_name: { type: 'string', description: 'Name of the list to clear' },
        },
        required: ['list_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_all_lists',
      description: 'Get the names of all shared lists for the family.',
      parameters: { type: 'object', properties: {} },
    },
  },
  // --- Countdown tools ---
  {
    type: 'function',
    function: {
      name: 'create_countdown',
      description: 'Create a countdown timer to a future date. Shows on the family dashboard with a fun background. Available backgrounds: fireworks, castle, stars, rainbow, beach, party.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'What the countdown is for (e.g. "Disney Holiday!")' },
          target_date: { type: 'string', description: 'Target date in YYYY-MM-DD format' },
          background: { type: 'string', description: 'Background theme: fireworks, castle, stars, rainbow, beach, or party. Defaults to fireworks.' },
        },
        required: ['title', 'target_date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_countdowns',
      description: 'List all active countdown timers for the family.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_countdown',
      description: 'Delete a countdown timer by its ID.',
      parameters: {
        type: 'object',
        properties: {
          countdown_id: { type: 'string', description: 'UUID of the countdown to delete' },
        },
        required: ['countdown_id'],
      },
    },
  },
  // --- Kid points tools ---
  {
    type: 'function',
    function: {
      name: 'adjust_points',
      description: 'Add or remove points for a child (Sam or Robyn). Use positive numbers to add, negative to remove. 20 points = 1 Mickey Head.',
      parameters: {
        type: 'object',
        properties: {
          kid_name: { type: 'string', description: 'Name of the child (e.g. "Sam" or "Robyn")' },
          change: { type: 'integer', description: 'Number of points to add (positive) or remove (negative)' },
          reason: { type: 'string', description: 'Why the points are being given or taken away' },
        },
        required: ['kid_name', 'change'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_points',
      description: 'Get the current points and Mickey Heads for all kids in the family.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_point_history',
      description: 'Get recent point history for a specific child.',
      parameters: {
        type: 'object',
        properties: {
          kid_name: { type: 'string', description: 'Name of the child' },
        },
        required: ['kid_name'],
      },
    },
  },
  // --- Meal planner tools ---
  {
    type: 'function',
    function: {
      name: 'set_meal',
      description: 'Set a meal for a specific date. Meal types: breakfast, lunch, dinner, snack. Replaces any existing meal in that slot.',
      parameters: {
        type: 'object',
        properties: {
          meal_date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
          meal_type: { type: 'string', description: 'One of: breakfast, lunch, dinner, snack' },
          title: { type: 'string', description: 'What the meal is (e.g. "Spaghetti Bolognese")' },
          notes: { type: 'string', description: 'Optional notes (e.g. "Use the leftover mince")' },
        },
        required: ['meal_date', 'meal_type', 'title'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_meals',
      description: 'Get meals planned for a specific date.',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
        },
        required: ['date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_weekly_meals',
      description: 'Get all meals planned for a week (7 days from start date).',
      parameters: {
        type: 'object',
        properties: {
          start_date: { type: 'string', description: 'Start date in YYYY-MM-DD format (defaults to today if not provided)' },
        },
        required: ['start_date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'remove_meal',
      description: 'Remove a planned meal from a specific date and meal slot.',
      parameters: {
        type: 'object',
        properties: {
          meal_date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
          meal_type: { type: 'string', description: 'One of: breakfast, lunch, dinner, snack' },
        },
        required: ['meal_date', 'meal_type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'clear_meals',
      description: 'Clear all planned meals for a specific date.',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
        },
        required: ['date'],
      },
    },
  },
  // --- Dashboard theme tools ---
  {
    type: 'function',
    function: {
      name: 'set_dashboard_theme',
      description: 'Change the family dashboard theme. Available themes include holidays (christmas, halloween, easter, valentines, bonfire, newyear, stpatricks, thanksgiving, summer) and Disney (frozen, starwars, princess, pixar, villains, mickey, moana, encanto). Use "default" to reset.',
      parameters: {
        type: 'object',
        properties: {
          theme: { type: 'string', description: 'Theme key (e.g. "christmas", "frozen", "default")' },
        },
        required: ['theme'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_dashboard_themes',
      description: 'List all available dashboard themes.',
      parameters: { type: 'object', properties: {} },
    },
  },
  // --- UK Holidays ---
  {
    type: 'function',
    function: {
      name: 'seed_uk_holidays',
      description: 'Add all UK bank holidays and notable dates (Christmas, Easter, Halloween, Bonfire Night, etc.) to the calendar for a given year.',
      parameters: {
        type: 'object',
        properties: {
          year: { type: 'integer', description: 'Year to seed holidays for (e.g. 2026). Defaults to current year.' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_food_item',
      description: 'Track a food item that needs to be eaten before it expires. Use when someone says they bought something perishable, or when food needs using up by a date.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Name of the food item (e.g. "chicken breast", "milk", "strawberries")' },
          expires_at: { type: 'string', description: 'Expiry/use-by date in YYYY-MM-DD format' },
          quantity: { type: 'string', description: 'Optional quantity (e.g. "2 packs", "500g", "1 bottle")' },
        },
        required: ['name', 'expires_at'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_food_items',
      description: 'List all tracked food items and their expiry dates, sorted by soonest expiring first.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'remove_food_item',
      description: 'Remove a food item from the expiry tracker (e.g. when it has been eaten or thrown away).',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Name of the food item to remove' },
        },
        required: ['name'],
      },
    },
  },
  // --- Budget & Expense tools ---
  {
    type: 'function',
    function: {
      name: 'log_expense',
      description: 'Log a family expense. Use when someone says they spent money, paid for something, or bought something for a specific amount.',
      parameters: {
        type: 'object',
        properties: {
          amount: { type: 'number', description: 'Amount spent (e.g. 45.50)' },
          category: { type: 'string', description: 'Expense category (e.g. groceries, utilities, eating out, kids, transport, entertainment)' },
          note: { type: 'string', description: 'Optional description of what was bought' },
          paid_by: { type: 'string', description: 'Optional name of who paid' },
          expense_date: { type: 'string', description: 'Date of the expense in YYYY-MM-DD format. Defaults to today if not provided.' },
        },
        required: ['amount', 'category'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_expenses',
      description: 'List family expenses, optionally filtered by month, year, and/or category.',
      parameters: {
        type: 'object',
        properties: {
          month: { type: 'number', description: 'Month number (1-12). Defaults to current month if omitted.' },
          year: { type: 'number', description: 'Year (e.g. 2026). Defaults to current year if omitted.' },
          category: { type: 'string', description: 'Optional category to filter by.' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_monthly_spend',
      description: 'Get a summary of spending per category for a given month, including budget limits and remaining amounts.',
      parameters: {
        type: 'object',
        properties: {
          month: { type: 'number', description: 'Month number (1-12). Defaults to current month.' },
          year: { type: 'number', description: 'Year. Defaults to current year.' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'set_budget',
      description: 'Set a monthly spending budget for a category. Creates or updates the limit for that category.',
      parameters: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Expense category to set budget for (e.g. groceries, utilities)' },
          monthly_limit: { type: 'number', description: 'Monthly spending limit for this category' },
        },
        required: ['category', 'monthly_limit'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_budgets',
      description: 'List all monthly budget limits set for the family.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_expense',
      description: 'Delete a logged expense by its ID.',
      parameters: {
        type: 'object',
        properties: {
          expense_id: { type: 'string', description: 'UUID of the expense to delete' },
        },
        required: ['expense_id'],
      },
    },
  },
  // --- Chore Rota tools ---
  {
    type: 'function',
    function: {
      name: 'add_chore',
      description: 'Add a new chore to the family rota. Use for tasks like cleaning, hoovering, putting the bins out, washing up, etc.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Name of the chore (e.g. "Hoover the living room", "Put the bins out")' },
          assigned_to: { type: 'string', description: 'Optional: name of the person responsible for this chore' },
          recurrence: { type: 'string', enum: ['once', 'daily', 'weekly', 'fortnightly'], description: 'How often the chore repeats. Defaults to once.' },
          next_due: { type: 'string', description: 'Date the chore is due in YYYY-MM-DD format. Defaults to today.' },
          points_reward: { type: 'number', description: 'Optional: number of kid points to award when this chore is completed' },
        },
        required: ['title'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_chores',
      description: 'List chores that are due. Optionally filter by person and/or due date.',
      parameters: {
        type: 'object',
        properties: {
          assigned_to: { type: 'string', description: 'Optional: filter by the person assigned to the chore' },
          due_by: { type: 'string', description: 'Optional: only show chores due on or before this date (YYYY-MM-DD). Defaults to today.' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'complete_chore',
      description: 'Mark a chore as done. For recurring chores, automatically schedules the next occurrence.',
      parameters: {
        type: 'object',
        properties: {
          chore_id: { type: 'string', description: 'UUID of the chore to mark as done' },
          completed_by: { type: 'string', description: 'Optional: name of the person who completed the chore' },
          award_points: { type: 'boolean', description: 'Optional: whether to award kid points for completing this chore (if points_reward > 0)' },
        },
        required: ['chore_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_chore',
      description: 'Delete a chore from the rota entirely.',
      parameters: {
        type: 'object',
        properties: {
          chore_id: { type: 'string', description: 'UUID of the chore to delete' },
        },
        required: ['chore_id'],
      },
    },
  },
];

/**
 * Dispatch a function call to the appropriate service.
 * Returns a JSON string result for Groq.
 */
export async function dispatch(functionName, args, context) {
  const { familyId, userId, timezone } = context;

  // Invalidate dashboard cache for any write operation
  const readOnlyFns = new Set(['list_events', 'list_reminders', 'get_list', 'get_all_lists', 'list_countdowns', 'get_points', 'get_point_history', 'get_meals', 'get_weekly_meals', 'list_dashboard_themes', 'list_food_items', 'list_expenses', 'get_monthly_spend', 'list_budgets', 'list_chores']);
  if (!readOnlyFns.has(functionName)) {
    invalidateDashboardCache();
  }

  switch (functionName) {
    case 'create_event': {
      const event = await calendar.createEvent(familyId, userId, args);
      return JSON.stringify({
        success: true,
        event: {
          id: event.id,
          title: event.title,
          starts_at: formatForUser(event.starts_at, timezone),
          ends_at: event.ends_at ? formatForUser(event.ends_at, timezone) : null,
        },
      });
    }

    case 'list_events': {
      const events = await calendar.listEvents(familyId, args.start_date, args.end_date);
      return JSON.stringify({
        events: events.map((e) => ({
          id: e.id,
          title: e.title,
          starts_at: formatForUser(e.starts_at, timezone),
          ends_at: e.ends_at ? formatForUser(e.ends_at, timezone) : null,
          all_day: e.all_day,
        })),
      });
    }

    case 'delete_event': {
      if (args.event_id) {
        // Legacy: delete by ID if provided
        const deleted = await calendar.deleteEvent(args.event_id, familyId);
        return JSON.stringify({ success: true, deleted_title: deleted?.title });
      }
      // Delete by title/date match
      const deleted = await calendar.findAndDeleteEvent(familyId, {
        title: args.title,
        date: args.date,
      });
      if (!deleted) {
        return JSON.stringify({ success: false, error: 'No matching event found. Try listing events first to see what\'s on the calendar.' });
      }
      return JSON.stringify({ success: true, deleted_title: deleted.title });
    }

    case 'create_reminder': {
      const reminder = await reminders.createReminder(userId, args);
      return JSON.stringify({
        success: true,
        reminder: {
          id: reminder.id,
          message: reminder.message,
          remind_at: formatForUser(reminder.remind_at, timezone),
        },
      });
    }

    case 'list_reminders': {
      const pending = await reminders.listReminders(userId);
      return JSON.stringify({
        reminders: pending.map((r) => ({
          id: r.id,
          message: r.message,
          remind_at: formatForUser(r.remind_at, timezone),
        })),
      });
    }

    case 'delete_reminder': {
      await reminders.deleteReminder(args.reminder_id, userId);
      return JSON.stringify({ success: true });
    }

    case 'get_list': {
      const { list, items } = await lists.getList(familyId, args.list_name);
      return JSON.stringify({
        list_name: list.name,
        items: items.map((i) => ({
          id: i.id,
          text: i.text,
          checked: i.checked,
        })),
      });
    }

    case 'add_list_item': {
      const { list, item } = await lists.addItem(familyId, args.list_name, args.item_text, userId);
      return JSON.stringify({ success: true, list_name: list.name, item: item.text });
    }

    case 'check_list_item': {
      const result = await lists.checkItem(familyId, args.list_name, args.item_text);
      if (!result) return JSON.stringify({ success: false, error: 'Item not found' });
      return JSON.stringify({ success: true, checked: result.item.text });
    }

    case 'remove_list_item': {
      const result = await lists.removeItem(familyId, args.list_name, args.item_text);
      if (!result) return JSON.stringify({ success: false, error: 'Item not found' });
      return JSON.stringify({ success: true, removed: result.item.text });
    }

    case 'clear_list': {
      const list = await lists.clearList(familyId, args.list_name);
      return JSON.stringify({ success: true, list_name: list.name, message: 'All items removed' });
    }

    case 'create_list': {
      const list = await lists.createList(familyId, args.list_name);
      return JSON.stringify({ success: true, list_name: list.name });
    }

    case 'get_all_lists': {
      const allLists = await lists.getAllLists(familyId);
      return JSON.stringify({ lists: allLists.map((l) => l.name) });
    }

    // --- Countdown dispatch ---
    case 'create_countdown': {
      const countdown = await countdowns.createCountdown(familyId, args);
      const daysUntil = Math.ceil(
        (new Date(countdown.target_date) - new Date()) / (1000 * 60 * 60 * 24)
      );
      return JSON.stringify({
        success: true,
        countdown: {
          id: countdown.id,
          title: countdown.title,
          target_date: countdown.target_date,
          background: countdown.background,
          days_until: daysUntil,
        },
      });
    }

    case 'list_countdowns': {
      const items = await countdowns.listCountdowns(familyId);
      return JSON.stringify({
        countdowns: items.map((c) => {
          const daysUntil = Math.ceil(
            (new Date(c.target_date) - new Date()) / (1000 * 60 * 60 * 24)
          );
          return {
            id: c.id,
            title: c.title,
            target_date: c.target_date,
            background: c.background,
            days_until: daysUntil,
          };
        }),
      });
    }

    case 'delete_countdown': {
      const deleted = await countdowns.deleteCountdown(args.countdown_id, familyId);
      return JSON.stringify({ success: true, deleted_title: deleted?.title });
    }

    // --- Kid points dispatch ---
    case 'adjust_points': {
      const result = await points.adjustPoints(
        familyId, args.kid_name, args.change, args.reason, userId
      );
      return JSON.stringify({ success: true, ...result });
    }

    case 'get_points': {
      const allPoints = await points.getAllPoints(familyId);
      return JSON.stringify({ kids: allPoints });
    }

    case 'get_point_history': {
      const history = await points.getPointHistory(familyId, args.kid_name);
      return JSON.stringify(history);
    }

    // --- Meal planner dispatch ---
    case 'set_meal': {
      const meal = await meals.setMeal(familyId, args, userId);
      return JSON.stringify({
        success: true,
        meal: {
          date: meal.meal_date,
          type: meal.meal_type,
          title: meal.title,
          notes: meal.notes,
        },
      });
    }

    case 'get_meals': {
      const dayMeals = await meals.getMealsForDate(familyId, args.date);
      return JSON.stringify({
        date: args.date,
        meals: dayMeals.map((m) => ({
          type: m.meal_type,
          title: m.title,
          notes: m.notes,
        })),
      });
    }

    case 'get_weekly_meals': {
      const endDate = new Date(args.start_date);
      endDate.setDate(endDate.getDate() + 6);
      const endStr = endDate.toISOString().split('T')[0];
      const weekMeals = await meals.getMealsForWeek(familyId, args.start_date, endStr);
      return JSON.stringify({
        start_date: args.start_date,
        end_date: endStr,
        meals: weekMeals.map((m) => ({
          date: m.meal_date,
          type: m.meal_type,
          title: m.title,
          notes: m.notes,
        })),
      });
    }

    case 'remove_meal': {
      const removed = await meals.removeMeal(familyId, args.meal_date, args.meal_type);
      return JSON.stringify({
        success: true,
        removed: removed ? removed.title : null,
      });
    }

    case 'clear_meals': {
      await meals.clearMealsForDate(familyId, args.date);
      return JSON.stringify({ success: true, date: args.date });
    }

    // --- Dashboard theme dispatch ---
    case 'set_dashboard_theme': {
      const result = await themes.setTheme(familyId, args.theme);
      return JSON.stringify({ success: true, ...result });
    }

    case 'list_dashboard_themes': {
      const available = themes.listThemes();
      return JSON.stringify(available);
    }

    case 'add_food_item': {
      const item = await foodExpiry.addFoodItem(familyId, args.name, args.expires_at, args.quantity || null, userId);
      const daysLeft = Math.ceil((new Date(args.expires_at + 'T23:59:59') - new Date()) / (1000 * 60 * 60 * 24));
      return JSON.stringify({
        success: true,
        item: item.name,
        expires_at: args.expires_at,
        quantity: args.quantity || null,
        days_left: daysLeft,
        message: `Added "${item.name}" — use by ${args.expires_at} (${daysLeft} day${daysLeft !== 1 ? 's' : ''} left)`,
      });
    }

    case 'list_food_items': {
      const items = await foodExpiry.getFoodItems(familyId);
      const now = new Date();
      const formatted = items.map(i => {
        const daysLeft = Math.ceil((new Date(i.expires_at + 'T23:59:59') - now) / (1000 * 60 * 60 * 24));
        let status = '';
        if (daysLeft < 0) status = '🚫 EXPIRED';
        else if (daysLeft === 0) status = '⚠️ Expires TODAY';
        else if (daysLeft <= 2) status = `🔴 ${daysLeft} day${daysLeft > 1 ? 's' : ''} left`;
        else status = `${daysLeft} days left`;
        return `${i.name}${i.quantity ? ` (${i.quantity})` : ''} — ${status} (${i.expires_at})`;
      });
      return JSON.stringify({
        items: formatted,
        count: items.length,
        message: items.length === 0 ? 'No food items being tracked.' : `${items.length} item(s) being tracked.`,
      });
    }

    case 'remove_food_item': {
      const removed = await foodExpiry.removeFoodItem(familyId, args.name);
      if (!removed) {
        return JSON.stringify({ success: false, message: `Couldn't find "${args.name}" in the food tracker.` });
      }
      return JSON.stringify({
        success: true,
        message: `Removed "${removed.name}" from the food tracker.`,
      });
    }

    case 'seed_uk_holidays': {
      const year = args.year || new Date().getFullYear();
      const results = await seedUKHolidays(familyId, userId, year);
      const created = results.filter(r => r.status === 'created').length;
      return JSON.stringify({
        success: true,
        year,
        created,
        holidays: results.map(r => `${r.title} (${r.date})`),
      });
    }

    // --- Budget & Expense dispatch ---
    case 'log_expense': {
      const expense = await expenses.addExpense(familyId, {
        amount: args.amount,
        category: args.category,
        note: args.note || null,
        paid_by: args.paid_by || null,
        expense_date: args.expense_date || null,
      }, userId);
      return JSON.stringify({
        success: true,
        expense: {
          id: expense.id,
          amount: expense.amount,
          category: expense.category,
          note: expense.note,
          paid_by: expense.paid_by,
          expense_date: expense.expense_date,
        },
        message: `Logged £${expense.amount} for ${expense.category}${expense.note ? ` (${expense.note})` : ''} on ${expense.expense_date}.`,
      });
    }

    case 'list_expenses': {
      const now = new Date();
      const month = args.month || (now.getMonth() + 1);
      const year = args.year || now.getFullYear();
      const items = await expenses.listExpenses(familyId, { month, year, category: args.category || undefined });
      const total = items.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      return JSON.stringify({
        expenses: items.map(e => ({
          id: e.id,
          amount: e.amount,
          category: e.category,
          note: e.note,
          paid_by: e.paid_by,
          expense_date: e.expense_date,
        })),
        total: Math.round(total * 100) / 100,
        count: items.length,
        period: `${year}-${String(month).padStart(2, '0')}`,
      });
    }

    case 'get_monthly_spend': {
      const now = new Date();
      const month = args.month || (now.getMonth() + 1);
      const year = args.year || now.getFullYear();
      const summary = await expenses.getMonthlySpend(familyId, month, year);
      const totalSpent = summary.reduce((sum, s) => sum + s.spent, 0);
      return JSON.stringify({
        period: `${year}-${String(month).padStart(2, '0')}`,
        categories: summary,
        total_spent: Math.round(totalSpent * 100) / 100,
      });
    }

    case 'set_budget': {
      const budget = await expenses.setBudget(familyId, {
        category: args.category,
        monthly_limit: args.monthly_limit,
      });
      return JSON.stringify({
        success: true,
        budget: {
          category: budget.category,
          monthly_limit: budget.monthly_limit,
        },
        message: `Budget for ${budget.category} set to £${budget.monthly_limit}/month.`,
      });
    }

    case 'list_budgets': {
      const budgetList = await expenses.listBudgets(familyId);
      return JSON.stringify({
        budgets: budgetList.map(b => ({
          category: b.category,
          monthly_limit: b.monthly_limit,
        })),
        count: budgetList.length,
      });
    }

    case 'delete_expense': {
      await expenses.deleteExpense(familyId, args.expense_id);
      return JSON.stringify({ success: true, deleted_id: args.expense_id });
    }

    // --- Chore Rota dispatch ---
    case 'add_chore': {
      const chore = await chores.addChore(familyId, {
        title: args.title,
        assigned_to: args.assigned_to || null,
        recurrence: args.recurrence || 'once',
        next_due: args.next_due || null,
        points_reward: args.points_reward || 0,
      });
      return JSON.stringify({
        success: true,
        chore: {
          id: chore.id,
          title: chore.title,
          assigned_to: chore.assigned_to,
          recurrence: chore.recurrence,
          next_due: chore.next_due,
          points_reward: chore.points_reward,
        },
        message: `Added chore "${chore.title}"${chore.assigned_to ? ` assigned to ${chore.assigned_to}` : ''} — due ${chore.next_due}.`,
      });
    }

    case 'list_chores': {
      const choreList = await chores.listChores(familyId, {
        assigned_to: args.assigned_to || undefined,
        due_by: args.due_by || undefined,
      });
      return JSON.stringify({
        chores: choreList.map(c => ({
          id: c.id,
          title: c.title,
          assigned_to: c.assigned_to,
          recurrence: c.recurrence,
          next_due: c.next_due,
          points_reward: c.points_reward,
        })),
        count: choreList.length,
        message: choreList.length === 0 ? 'No chores due.' : `${choreList.length} chore(s) due.`,
      });
    }

    case 'complete_chore': {
      const result = await chores.completeChore(familyId, args.chore_id, {
        completed_by: args.completed_by || null,
        award_points: args.award_points || false,
      });
      return JSON.stringify({
        success: true,
        chore_title: result.chore_title,
        completed_by: result.completed_by,
        points_awarded: result.points_awarded,
        message: `Marked "${result.chore_title}" as done${result.completed_by ? ` by ${result.completed_by}` : ''}${result.points_awarded > 0 ? ` — awarded ${result.points_awarded} points!` : ''}.`,
      });
    }

    case 'delete_chore': {
      await chores.deleteChore(familyId, args.chore_id);
      return JSON.stringify({ success: true, deleted_id: args.chore_id });
    }

    default:
      return JSON.stringify({ error: `Unknown function: ${functionName}` });
  }
}
