import * as calendar from '../services/calendar.js';
import * as reminders from '../services/reminders.js';
import * as lists from '../services/lists.js';
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
      name: 'get_all_lists',
      description: 'Get the names of all shared lists for the family.',
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

    case 'create_list': {
      const list = await lists.createList(familyId, args.list_name);
      return JSON.stringify({ success: true, list_name: list.name });
    }

    case 'get_all_lists': {
      const allLists = await lists.getAllLists(familyId);
      return JSON.stringify({ lists: allLists.map((l) => l.name) });
    }

    default:
      return JSON.stringify({ error: `Unknown function: ${functionName}` });
  }
}
