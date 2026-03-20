import * as calendar from '../services/calendar.js';
import * as reminders from '../services/reminders.js';
import * as lists from '../services/lists.js';
import * as countdowns from '../services/countdowns.js';
import * as points from '../services/points.js';
import * as meals from '../services/meals.js';
import * as themes from '../services/themes.js';
import { formatForUser } from '../utils/time.js';

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
      description: 'Delete a calendar event by its ID.',
      parameters: {
        type: 'object',
        properties: {
          event_id: { type: 'string', description: 'UUID of the event to delete' },
        },
        required: ['event_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_reminder',
      description: 'Set a personal reminder. The bot will send a Telegram message at the specified time.',
      parameters: {
        type: 'object',
        properties: {
          message: { type: 'string', description: 'Reminder message text' },
          remind_at: { type: 'string', description: 'ISO 8601 datetime for when to send the reminder' },
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
];

/**
 * Dispatch a function call to the appropriate service.
 * Returns a JSON string result for Groq.
 */
export async function dispatch(functionName, args, context) {
  const { familyId, userId, timezone } = context;

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
      const deleted = await calendar.deleteEvent(args.event_id, familyId);
      return JSON.stringify({ success: true, deleted_title: deleted?.title });
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

    default:
      return JSON.stringify({ error: `Unknown function: ${functionName}` });
  }
}
