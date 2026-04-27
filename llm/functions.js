import * as calendar from '../services/calendar.js';
import * as reminders from '../services/reminders.js';
import * as lists from '../services/lists.js';
import * as countdowns from '../services/countdowns.js';
import * as points from '../services/points.js';
import * as meals from '../services/meals.js';
import * as themes from '../services/themes.js';
import { seedUKHolidays } from '../services/holidays.js';
import * as foodExpiry from '../services/foodExpiry.js';
import * as goals from '../services/goals.js';
import * as watchlist from '../services/watchlist.js';
import * as birthdays from '../services/birthdays.js';
import { upsertDay, getMonthStats } from '../services/officeCheckin.js';
import { upsertBinSchedule, getBinSchedule, getNextCollection } from '../services/binSchedule.js';
import * as foodLog from '../services/foodLog.js';
import * as flights from '../services/flights.js';
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
      name: 'update_event',
      description: 'Update an existing calendar event — change its title, time, or description. Call list_events first to find the event ID.',
      parameters: {
        type: 'object',
        properties: {
          event_id: { type: 'string', description: 'UUID of the event to update' },
          title: { type: 'string', description: 'New title (optional)' },
          starts_at: { type: 'string', description: 'New start datetime in ISO 8601 format (optional)' },
          ends_at: { type: 'string', description: 'New end datetime in ISO 8601 format (optional)' },
          description: { type: 'string', description: 'New description (optional)' },
          all_day: { type: 'boolean', description: 'Whether this is an all-day event (optional)' },
        },
        required: ['event_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_reminder',
      description: 'Set a personal reminder. The bot will send a WhatsApp message at the specified time. Can be one-off or recurring.',
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
      name: 'snooze_reminder',
      description: 'Push a reminder back to a later time. Use when someone says "remind me later", "snooze that", or "remind me at X instead". Call list_reminders first to find the reminder ID.',
      parameters: {
        type: 'object',
        properties: {
          reminder_id: { type: 'string', description: 'UUID of the reminder to snooze' },
          snooze_until: { type: 'string', description: 'New datetime in ISO 8601 format to send the reminder' },
        },
        required: ['reminder_id', 'snooze_until'],
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
      name: 'clear_checked_items',
      description: 'Remove only the ticked/checked items from a list, leaving unchecked items intact. Use after shopping when the family has bought everything they ticked off.',
      parameters: {
        type: 'object',
        properties: {
          list_name: { type: 'string', description: 'Name of the list to clean up (e.g. "shopping")' },
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
  {
    type: 'function',
    function: {
      name: 'update_countdown',
      description: 'Update a countdown — change its title, target date, or background. Call list_countdowns first to find the ID.',
      parameters: {
        type: 'object',
        properties: {
          countdown_id: { type: 'string', description: 'UUID of the countdown to update' },
          title: { type: 'string', description: 'New title (optional)' },
          target_date: { type: 'string', description: 'New target date in YYYY-MM-DD format (optional)' },
          background: { type: 'string', description: 'New background: fireworks, castle, stars, rainbow, beach, or party (optional)' },
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
  // --- Family Goals tools ---
  {
    type: 'function',
    function: {
      name: 'create_goal',
      description: 'Create a new family goal or challenge that the family can work towards together.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Short title for the goal (e.g. "Read 10 books this month")' },
          description: { type: 'string', description: 'Optional longer description of what the goal involves' },
          target_date: { type: 'string', description: 'Optional target/deadline date in YYYY-MM-DD format' },
        },
        required: ['title'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_goals',
      description: 'List the family\'s current goals and challenges. By default shows active goals only.',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['active', 'completed', 'cancelled'], description: 'Filter by status. Defaults to active.' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_goal',
      description: 'Update a family goal — change its title, description, target date, or mark it as completed/cancelled.',
      parameters: {
        type: 'object',
        properties: {
          goal_id: { type: 'string', description: 'UUID of the goal to update' },
          title: { type: 'string', description: 'New title (optional)' },
          description: { type: 'string', description: 'New description (optional)' },
          target_date: { type: 'string', description: 'New target date in YYYY-MM-DD (optional)' },
          status: { type: 'string', enum: ['active', 'completed', 'cancelled'], description: 'New status (optional)' },
        },
        required: ['goal_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_goal',
      description: 'Delete a family goal permanently.',
      parameters: {
        type: 'object',
        properties: {
          goal_id: { type: 'string', description: 'UUID of the goal to delete' },
        },
        required: ['goal_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_goal_progress',
      description: 'Log a progress update or milestone for a family goal.',
      parameters: {
        type: 'object',
        properties: {
          goal_id: { type: 'string', description: 'UUID of the goal' },
          note: { type: 'string', description: 'Progress note (e.g. "Finished book #3!")' },
        },
        required: ['goal_id', 'note'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_goal_progress',
      description: 'Get the progress history for a specific family goal.',
      parameters: {
        type: 'object',
        properties: {
          goal_id: { type: 'string', description: 'UUID of the goal' },
        },
        required: ['goal_id'],
      },
    },
  },
  // --- Watchlist tools ---
  {
    type: 'function',
    function: {
      name: 'get_watchlist',
      description: 'Get the family watchlist — movies and shows to watch. By default returns only unwatched items.',
      parameters: {
        type: 'object',
        properties: {
          include_watched: { type: 'boolean', description: 'Set to true to also include already-watched items. Defaults to false.' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_to_watchlist',
      description: 'Add a movie or TV show to the family watchlist.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Title of the movie or show' },
          type: { type: 'string', enum: ['movie', 'show'], description: 'Whether it is a movie or a TV show. Defaults to movie.' },
          platform: { type: 'string', description: 'Where to watch it (e.g. "Netflix", "Disney+", "Cinema"). Optional.' },
          notes: { type: 'string', description: 'Any extra notes (e.g. "Great for kids", "Sequel to X"). Optional.' },
        },
        required: ['title'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'mark_watched',
      description: 'Mark a watchlist item as watched. Call get_watchlist first to find the item ID.',
      parameters: {
        type: 'object',
        properties: {
          item_id: { type: 'string', description: 'UUID of the watchlist item to mark as watched' },
          rating: { type: 'integer', description: 'Optional star rating out of 5 (1–5)' },
        },
        required: ['item_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'remove_from_watchlist',
      description: 'Permanently remove an item from the watchlist. Use this when the family no longer wants to watch it. Call get_watchlist first to find the item ID.',
      parameters: {
        type: 'object',
        properties: {
          item_id: { type: 'string', description: 'UUID of the watchlist item to remove' },
        },
        required: ['item_id'],
      },
    },
  },
  // --- Birthday tools ---
  {
    type: 'function',
    function: {
      name: 'list_birthdays',
      description: 'List all family birthdays with how many days until the next one.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_birthday',
      description: 'Add a family birthday to track. The date should be the actual birth date (year included) so the age can be calculated.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Name of the person (e.g. "Grandma", "Sam")' },
          birth_date: { type: 'string', description: 'Date of birth in YYYY-MM-DD format (e.g. "1985-06-20")' },
          notes: { type: 'string', description: 'Optional notes (e.g. "Likes chocolate cake", "Call in the evening")' },
        },
        required: ['name', 'birth_date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_birthday',
      description: 'Update a birthday entry — fix a name, correct the date, or update notes. Call list_birthdays first to find the ID.',
      parameters: {
        type: 'object',
        properties: {
          birthday_id: { type: 'string', description: 'UUID of the birthday entry to update' },
          name: { type: 'string', description: 'New name (optional)' },
          birth_date: { type: 'string', description: 'Corrected date of birth in YYYY-MM-DD format (optional)' },
          notes: { type: 'string', description: 'Updated notes (optional)' },
        },
        required: ['birthday_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_birthday',
      description: 'Remove a birthday from tracking entirely. Call list_birthdays first to find the ID.',
      parameters: {
        type: 'object',
        properties: {
          birthday_id: { type: 'string', description: 'UUID of the birthday entry to delete' },
        },
        required: ['birthday_id'],
      },
    },
  },
  // --- Office check-in tools ---
  {
    type: 'function',
    function: {
      name: 'log_office_day',
      description: 'Log a work day as office, travel, or time-off. Only works for weekdays (Mon–Fri). Use this when someone says they are in the office, working from home/travel, or taking a day off.',
      parameters: {
        type: 'object',
        properties: {
          day_date: { type: 'string', description: 'Date in YYYY-MM-DD format. Defaults to today if not given.' },
          day_type: { type: 'string', enum: ['office', 'travel', 'time_off'], description: 'Type of day: office (going in), travel (working away), or time_off (holiday/sick/etc)' },
          confirmed: { type: 'boolean', description: 'Whether the day is confirmed as actually attended. Defaults to false (planned).' },
          parking_booked: { type: 'boolean', description: 'Whether parking is booked (for office days). Optional.' },
          destination: { type: 'string', description: 'Travel destination (for travel days). Optional.' },
          notes: { type: 'string', description: 'Any additional notes. Optional.' },
        },
        required: ['day_type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_office_stats',
      description: 'Get office attendance statistics for a month — how many days logged, percentage toward the 40% attendance target, and any booking issues.',
      parameters: {
        type: 'object',
        properties: {
          year: { type: 'integer', description: 'Year (e.g. 2026). Defaults to current year.' },
          month: { type: 'integer', description: 'Month number 1–12. Defaults to current month.' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Get the current weather and forecast for the family\'s location. Always call this when asked about weather, temperature, rain, or whether to bring an umbrella.',
      parameters: { type: 'object', properties: {} },
    },
  },
  // --- Bin collection tools ---
  {
    type: 'function',
    function: {
      name: 'setup_bin_schedule',
      description: 'Configure the family\'s bin collection schedule. Ask the user: what day bins are collected, which bin goes out on the next upcoming collection day (this becomes bins[0] with that date as reference_date), and what the other bin(s) are in rotation order.',
      parameters: {
        type: 'object',
        properties: {
          collection_day: { type: 'integer', description: 'Day of week: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday' },
          bins: {
            type: 'array',
            description: 'Bins in rotation order, starting with the one collected on reference_date',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'e.g. "General waste", "Recycling", "Garden waste"' },
                colour: { type: 'string', description: 'e.g. "black", "blue", "green"' },
                emoji: { type: 'string', description: 'e.g. "🗑️", "♻️", "🌿"' },
              },
              required: ['name', 'colour', 'emoji'],
            },
          },
          reference_date: { type: 'string', description: 'YYYY-MM-DD date when bins[0] is/was collected — anchors the rotation' },
        },
        required: ['collection_day', 'bins', 'reference_date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_next_bin',
      description: 'Get the next bin collection — which bin it is and how many days until collection. Always call this for live data rather than guessing.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'log_food',
      description: 'Log a food or drink item for the current user. Use this when someone says they ate or drank something. Estimate calories if not provided.',
      parameters: {
        type: 'object',
        properties: {
          food_name: { type: 'string',  description: 'Name of the food or drink (e.g. "Banana", "Chicken sandwich", "Latte")' },
          meal_type: { type: 'string',  enum: ['breakfast', 'lunch', 'dinner', 'snack'], description: 'Which meal this belongs to' },
          calories:  { type: 'number', description: 'Calories (kcal). Estimate if not provided. Must be a number.' },
          notes:     { type: 'string',  description: 'Optional notes (e.g. "homemade", "large portion")' },
          logged_at: { type: 'string',  description: 'Date in YYYY-MM-DD format. Omit for today.' },
        },
        required: ['food_name', 'meal_type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_daily_nutrition',
      description: 'Get the food log and calorie total for a specific date. Shows what has been eaten and total vs goal.',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Date in YYYY-MM-DD format. Omit for today.' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_food_log_entry',
      description: 'Remove a food log entry by its ID. Call get_daily_nutrition first to find the entry ID.',
      parameters: {
        type: 'object',
        properties: {
          entry_id: { type: 'string', description: 'UUID of the food log entry to delete' },
        },
        required: ['entry_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'track_flight',
      description: 'Register a flight to track. You will get a reminder 12 hours before departure. Requires the flight code (e.g. BA492) and departure date/time.',
      parameters: {
        type: 'object',
        properties: {
          flight_code: { type: 'string', description: 'IATA flight code, e.g. BA492 or AA1234' },
          departure_scheduled: { type: 'string', description: 'Departure date and time in ISO 8601 format' },
          arrival_scheduled: { type: 'string', description: 'Arrival date and time in ISO 8601 format (optional but recommended)' },
          airline_name: { type: 'string', description: 'Airline name, e.g. British Airways (optional)' },
          from_airport: { type: 'string', description: 'Departure airport IATA code, e.g. LHR (optional)' },
          to_airport: { type: 'string', description: 'Arrival airport IATA code, e.g. JFK (optional)' },
        },
        required: ['flight_code', 'departure_scheduled'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_flights',
      description: 'List your currently tracked flights.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'remove_flight',
      description: 'Stop tracking a flight. Call list_flights first to find the flight ID.',
      parameters: {
        type: 'object',
        properties: {
          flight_id: { type: 'string', description: 'The ID of the flight to stop tracking' },
        },
        required: ['flight_id'],
      },
    },
  },

];

/**
 * Tools that only read data — no cache invalidation needed on dispatch.
 * Must be kept in sync with the tools array above.
 */
export const readOnlyTools = new Set([
  'list_events', 'list_reminders', 'get_list', 'get_all_lists', 'list_countdowns',
  'get_points', 'get_point_history', 'get_meals', 'get_weekly_meals',
  'list_dashboard_themes', 'list_food_items', 'list_goals', 'get_goal_progress',
  'get_watchlist', 'list_birthdays', 'get_office_stats', 'get_weather',
  'get_next_bin', 'get_daily_nutrition', 'list_flights',
]);

/**
 * Destructive tools that require explicit user confirmation before execution.
 * The message handler intercepts these and requests confirmation first.
 */
export const confirmationRequiredTools = new Set([
  'delete_event',
  'clear_list',
  'delete_goal',
  'clear_meals',
]);

// Groq's LLM occasionally outputs numeric fields as quoted strings (e.g. "550" instead of 550).
// This helper coerces and validates before the value reaches the service or database.
function coercePositiveNumber(value, fieldName) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    throw new Error(`Invalid ${fieldName}: expected positive number, got ${JSON.stringify(value)}`);
  }
  return num;
}

/**
 * Dispatch a function call to the appropriate service.
 * Returns a JSON string result for Groq.
 */
export async function dispatch(functionName, args, context) {
  const { familyId, userId, timezone } = context;

  if (!readOnlyTools.has(functionName)) {
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

    case 'update_event': {
      const updated = await calendar.updateEvent(args.event_id, familyId, args);
      return JSON.stringify({
        success: true,
        event: {
          id: updated.id,
          title: updated.title,
          starts_at: formatForUser(updated.starts_at, timezone),
          ends_at: updated.ends_at ? formatForUser(updated.ends_at, timezone) : null,
        },
        message: `Updated "${updated.title}".`,
      });
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

    case 'snooze_reminder': {
      const snoozed = await reminders.snoozeReminder(args.reminder_id, userId, args.snooze_until);
      return JSON.stringify({
        success: true,
        reminder: {
          id: snoozed.id,
          message: snoozed.message,
          remind_at: formatForUser(snoozed.remind_at, timezone),
        },
        message: `Snoozed — will remind you at ${formatForUser(snoozed.remind_at, timezone)}.`,
      });
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

    case 'clear_checked_items': {
      const { list, removed } = await lists.clearCheckedItems(familyId, args.list_name);
      return JSON.stringify({
        success: true,
        list_name: list.name,
        removed,
        message: removed > 0
          ? `Removed ${removed} checked item${removed !== 1 ? 's' : ''} from the ${list.name} list.`
          : `No checked items to remove from the ${list.name} list.`,
      });
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

    case 'update_countdown': {
      const updated = await countdowns.updateCountdown(args.countdown_id, familyId, {
        title: args.title,
        target_date: args.target_date,
        background: args.background,
      });
      const daysUntil = Math.ceil((new Date(updated.target_date + 'T00:00:00') - new Date()) / (1000 * 60 * 60 * 24));
      return JSON.stringify({
        success: true,
        countdown: { id: updated.id, title: updated.title, target_date: updated.target_date, days_until: daysUntil },
        message: `Updated countdown "${updated.title}" — ${daysUntil} day${daysUntil !== 1 ? 's' : ''} to go.`,
      });
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

    // --- Family Goals dispatch ---
    case 'create_goal': {
      const goal = await goals.createGoal(familyId, args, userId);
      return JSON.stringify({
        success: true,
        goal: {
          id: goal.id,
          title: goal.title,
          description: goal.description,
          target_date: goal.target_date,
          status: goal.status,
        },
      });
    }

    case 'list_goals': {
      const items = await goals.listGoals(familyId, args.status || 'active');
      return JSON.stringify({
        goals: items.map(g => ({
          id: g.id,
          title: g.title,
          description: g.description,
          target_date: g.target_date,
          status: g.status,
          created_at: formatForUser(g.created_at, timezone),
        })),
        count: items.length,
      });
    }

    case 'update_goal': {
      const updated = await goals.updateGoal(args.goal_id, familyId, args);
      return JSON.stringify({
        success: true,
        goal: {
          id: updated.id,
          title: updated.title,
          status: updated.status,
          target_date: updated.target_date,
        },
      });
    }

    case 'delete_goal': {
      const deleted = await goals.deleteGoal(args.goal_id, familyId);
      return JSON.stringify({ success: true, deleted_title: deleted?.title });
    }

    case 'add_goal_progress': {
      const progress = await goals.addProgress(args.goal_id, args.note, userId);
      return JSON.stringify({
        success: true,
        progress: {
          id: progress.id,
          note: progress.note,
          created_at: formatForUser(progress.created_at, timezone),
        },
      });
    }

    case 'get_goal_progress': {
      const history = await goals.getProgress(args.goal_id);
      return JSON.stringify({
        progress: history.map(p => ({
          id: p.id,
          note: p.note,
          created_at: formatForUser(p.created_at, timezone),
        })),
        count: history.length,
      });
    }

    // --- Weather dispatch ---
    case 'get_weather': {
      const weatherUrl = 'https://api.open-meteo.com/v1/forecast?latitude=53.39&longitude=-3.02'
        + '&current=temperature_2m,weathercode,wind_speed_10m,relative_humidity_2m'
        + '&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max'
        + '&forecast_days=3&timezone=Europe%2FLondon';
      const res = await fetch(weatherUrl);
      if (!res.ok) return JSON.stringify({ error: 'Weather service unavailable' });
      const wd = await res.json();

      const wDesc = (code) => {
        if (code === 0) return 'Clear sky';
        if (code <= 3) return 'Partly cloudy';
        if (code <= 48) return 'Foggy';
        if (code <= 57) return 'Drizzle';
        if (code <= 65) return 'Rainy';
        if (code <= 77) return 'Snowy';
        if (code <= 82) return 'Rain showers';
        if (code <= 86) return 'Snow showers';
        return 'Thunderstorm';
      };
      const wEmoji = (code) => {
        if (code === 0) return '☀️';
        if (code <= 3) return '⛅';
        if (code <= 48) return '🌫️';
        if (code <= 57) return '🌦️';
        if (code <= 65) return '🌧️';
        if (code <= 77) return '🌨️';
        if (code <= 82) return '🌧️';
        if (code <= 86) return '❄️';
        return '⛈️';
      };

      const cur = wd.current;
      const daily = wd.daily;
      const days = daily.time.slice(0, 3).map((date, i) => ({
        date,
        description: wDesc(daily.weathercode[i]),
        emoji: wEmoji(daily.weathercode[i]),
        max: Math.round(daily.temperature_2m_max[i]),
        min: Math.round(daily.temperature_2m_min[i]),
        rain_mm: daily.precipitation_sum[i],
        rain_chance: daily.precipitation_probability_max[i],
      }));

      return JSON.stringify({
        current: {
          temp: Math.round(cur.temperature_2m),
          description: wDesc(cur.weathercode),
          emoji: wEmoji(cur.weathercode),
          wind_kmh: Math.round(cur.wind_speed_10m),
          humidity: cur.relative_humidity_2m,
        },
        forecast: days,
      });
    }

    // --- Watchlist dispatch ---
    case 'get_watchlist': {
      const items = await watchlist.getWatchlist(familyId, args.include_watched || false);
      const now = new Date();
      return JSON.stringify({
        items: items.map(i => ({
          id: i.id,
          title: i.title,
          type: i.type,
          platform: i.platform,
          watched: i.watched,
          rating: i.rating,
          notes: i.notes,
          watched_at: i.watched_at ? formatForUser(i.watched_at, timezone) : null,
        })),
        count: items.length,
      });
    }

    case 'add_to_watchlist': {
      const item = await watchlist.addToWatchlist(familyId, args, userId);
      return JSON.stringify({
        success: true,
        item: { id: item.id, title: item.title, type: item.type, platform: item.platform },
        message: `Added "${item.title}" to the watchlist.`,
      });
    }

    case 'mark_watched': {
      const item = await watchlist.markWatched(args.item_id, familyId, args.rating || null);
      return JSON.stringify({
        success: true,
        title: item.title,
        rating: item.rating,
        message: `Marked "${item.title}" as watched${item.rating ? ` (${item.rating}/5)` : ''}.`,
      });
    }

    case 'remove_from_watchlist': {
      await watchlist.removeFromWatchlist(args.item_id, familyId);
      return JSON.stringify({ success: true, message: 'Removed from watchlist.' });
    }

    // --- Birthday dispatch ---
    case 'list_birthdays': {
      const bdayList = await birthdays.getBirthdays(familyId);
      const now = new Date();
      const formatted = bdayList.map(b => {
        const [y, mo, d] = b.birth_date.split('-').map(Number);
        const thisYear = now.getFullYear();
        let nextBday = new Date(thisYear, mo - 1, d);
        if (nextBday < now) nextBday = new Date(thisYear + 1, mo - 1, d);
        const daysUntil = Math.ceil((nextBday - now) / (1000 * 60 * 60 * 24));
        const age = nextBday.getFullYear() - y;
        return { id: b.id, name: b.name, birth_date: b.birth_date, notes: b.notes, days_until: daysUntil, upcoming_age: age };
      });
      formatted.sort((a, b) => a.days_until - b.days_until);
      return JSON.stringify({ birthdays: formatted, count: formatted.length });
    }

    case 'add_birthday': {
      const bday = await birthdays.addBirthday(familyId, args);
      return JSON.stringify({
        success: true,
        birthday: { id: bday.id, name: bday.name, birth_date: bday.birth_date },
        message: `Added ${bday.name}'s birthday (${bday.birth_date}).`,
      });
    }

    case 'update_birthday': {
      const updated = await birthdays.updateBirthday(args.birthday_id, familyId, {
        name: args.name,
        birth_date: args.birth_date,
        notes: args.notes,
      });
      return JSON.stringify({
        success: true,
        birthday: { id: updated.id, name: updated.name, birth_date: updated.birth_date },
        message: `Updated ${updated.name}'s birthday.`,
      });
    }

    case 'delete_birthday': {
      await birthdays.removeBirthday(args.birthday_id, familyId);
      return JSON.stringify({ success: true, message: 'Birthday removed.' });
    }

    // --- Office check-in dispatch ---
    case 'log_office_day': {
      const dayDate = args.day_date || new Date().toLocaleDateString('en-CA', { timeZone: timezone });
      const row = await upsertDay(familyId, dayDate, {
        day_type: args.day_type,
        confirmed: args.confirmed ?? false,
        parking_booked: args.parking_booked ?? false,
        destination: args.destination ?? null,
        notes: args.notes ?? null,
      });
      const typeLabel = row.day_type === 'office' ? 'office' : row.day_type === 'travel' ? 'travel' : 'time off';
      return JSON.stringify({
        success: true,
        day_date: row.day_date,
        day_type: row.day_type,
        confirmed: row.confirmed,
        message: `Logged ${row.day_date} as ${typeLabel}.`,
      });
    }

    case 'get_office_stats': {
      const now = new Date();
      const yr = args.year || now.getFullYear();
      const mo = args.month || (now.getMonth() + 1);
      const stats = await getMonthStats(familyId, yr, mo);
      const monthName = new Date(yr, mo - 1, 1).toLocaleString('en-US', { month: 'long' });
      const targetIcon = stats.actualTargetMet ? '✅' : (stats.plannedTargetMet ? '🟡' : '❌');
      return JSON.stringify({
        month: `${monthName} ${yr}`,
        confirmed_days: stats.confirmedDays,
        planned_days: stats.plannedDays,
        eligible_days: stats.eligibleDays,
        actual_pct: stats.actualPct,
        planned_pct: stats.plannedPct,
        target_met: stats.actualTargetMet,
        target_icon: targetIcon,
        booking_issues: stats.bookingIssuesCount,
        pending_expenses: stats.pendingExpensesCount,
        summary: `${monthName} ${yr}: ${stats.confirmedDays}/${stats.eligibleDays} days confirmed (${stats.actualPct}%) ${targetIcon}`,
      });
    }

    // --- Bin collection dispatch ---
    case 'setup_bin_schedule': {
      const schedule = await upsertBinSchedule(familyId, {
        collection_day: args.collection_day,
        bins: args.bins,
        reference_date: args.reference_date,
      });
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const binList = schedule.bins.map((b, i) => `${i + 1}. ${b.emoji} ${b.name} (${b.colour})`).join(', ');
      return JSON.stringify({
        success: true,
        collection_day: dayNames[schedule.collection_day],
        bins: schedule.bins,
        reference_date: schedule.reference_date,
        message: `Bin schedule saved! Collecting every ${dayNames[schedule.collection_day]}, alternating: ${binList}. Starting with ${schedule.bins[0].name} on ${schedule.reference_date}.`,
      });
    }

    case 'get_next_bin': {
      const info = await getNextCollection(familyId);
      if (!info) {
        return JSON.stringify({ error: 'No bin schedule configured yet. Use setup_bin_schedule to set one up.' });
      }
      const whenStr = info.isToday ? 'today' : info.isTomorrow ? 'tomorrow' : `in ${info.daysUntil} days (${info.collectionDate})`;
      return JSON.stringify({
        bin: info.bin,
        collection_date: info.collectionDate,
        days_until: info.daysUntil,
        is_today: info.isToday,
        is_tomorrow: info.isTomorrow,
        message: `${info.bin.emoji} ${info.bin.name} bin — collected ${whenStr}.`,
      });
    }

    // --- Food Log dispatch ---
    case 'log_food': {
      if (args.calories !== undefined) args.calories = coercePositiveNumber(args.calories, 'calories');
      const date = args.logged_at || new Date().toLocaleDateString('en-CA', { timeZone: timezone });
      const entry = await foodLog.logFood(familyId, userId, { ...args, logged_at: date });
      const calNote = entry.calories ? ` (${entry.calories} kcal)` : '';
      return JSON.stringify({
        success: true,
        entry: { id: entry.id, food_name: entry.food_name, meal_type: entry.meal_type, calories: entry.calories, logged_at: entry.logged_at },
        message: `Logged ${entry.food_name}${calNote} as ${entry.meal_type} on ${entry.logged_at}.`,
      });
    }

    case 'get_daily_nutrition': {
      const date = args.date || new Date().toLocaleDateString('en-CA', { timeZone: timezone });
      const [entries, goal, weekly] = await Promise.all([
        foodLog.getDailyLog(familyId, userId, date),
        foodLog.getNutritionGoal(familyId, userId),
        foodLog.getWeeklyAverage(familyId, userId, date),
      ]);
      const total = entries.reduce((s, e) => s + (e.calories || 0), 0);
      const goalCal = goal?.daily_calories;
      const remaining = goalCal ? goalCal - total : null;
      const weeklyVsGoal = goalCal ? weekly.average_calories - goalCal : null;
      return JSON.stringify({
        date,
        entries: entries.map(e => ({ id: e.id, food_name: e.food_name, meal_type: e.meal_type, calories: e.calories, notes: e.notes })),
        total_calories: total,
        daily_goal: goalCal || null,
        calories_remaining: remaining,
        weekly_average_calories: weekly.average_calories,
        weekly_vs_goal: weeklyVsGoal,
        message: [
          remaining !== null
            ? `${total} kcal today — ${remaining >= 0 ? remaining + ' kcal remaining' : Math.abs(remaining) + ' kcal over goal'}.`
            : `${total} kcal logged today.`,
          `7-day average: ${weekly.average_calories} kcal/day${weeklyVsGoal !== null ? ` (${weeklyVsGoal >= 0 ? '+' : ''}${weeklyVsGoal} vs goal)` : ''}.`,
        ].join(' '),
      });
    }

    case 'delete_food_log_entry': {
      const deleted = await foodLog.deleteLogEntry(args.entry_id, familyId, userId);
      if (!deleted) return JSON.stringify({ success: false, error: 'Entry not found or does not belong to you.' });
      return JSON.stringify({ success: true, message: `Removed "${deleted.food_name}" from the log.` });
    }

    case 'track_flight': {
      const flight = await flights.trackFlight(familyId, userId, args);
      const dep = formatForUser(flight.departure_scheduled, timezone);
      const route = [flight.from_airport, flight.to_airport].filter(Boolean).join(' → ');
      return JSON.stringify({
        success: true,
        flight: { id: flight.id, flight_code: flight.flight_code, departure: dep, route: route || undefined },
        message: `Got it! I'll send you a reminder 12 hours before ${flight.flight_code} departs${route ? ` (${route})` : ''} on ${dep}.`,
      });
    }

    case 'list_flights': {
      const list = await flights.listFlights(familyId, userId);
      return JSON.stringify({
        flights: list.map(f => ({
          id: f.id,
          flight_code: f.flight_code,
          airline: f.airline_name || undefined,
          route: [f.from_airport, f.to_airport].filter(Boolean).join(' → ') || undefined,
          departure: formatForUser(f.departure_scheduled, timezone),
          arrival: f.arrival_scheduled ? formatForUser(f.arrival_scheduled, timezone) : undefined,
          reminder_sent: f.notified_12h,
        })),
      });
    }

    case 'remove_flight': {
      const removed = await flights.removeFlight(args.flight_id, familyId, userId);
      return JSON.stringify({ success: true, message: `Stopped tracking ${removed.flight_code}.` });
    }

    default:
      return JSON.stringify({ error: `Unknown function: ${functionName}` });
  }
}
