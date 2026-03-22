import { getAnthropicClient, readJsonBody, requireAuthenticatedUser, sendError, sendJson } from './_lib/server.js';

function todayIsoDate() {
  return new Date().toISOString().split('T')[0];
}

function parseJsonResponse(text) {
  const cleaned = text.replace(/```json?\s*/gi, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      return JSON.parse(match[0]);
    }

    throw new Error('Could not parse contact from response');
  }
}

function normalizeParsedContacts(parsed, today) {
  const results = Array.isArray(parsed) ? parsed : [parsed];

  for (const result of results) {
    if (!result.name) {
      throw new Error('Could not parse contact — missing name');
    }

    if (!result.date) {
      result.date = today;
    }
  }

  return results;
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return sendError(response, 405, 'Method not allowed.');
  }

  try {
    const user = await requireAuthenticatedUser(request);
    if (!user) {
      return sendError(response, 401, 'Authentication required.');
    }

    const body = await readJsonBody(request);
    const rawText = typeof body.rawText === 'string' ? body.rawText.trim() : '';

    if (!rawText) {
      return sendError(response, 400, 'rawText is required.');
    }

    const today = todayIsoDate();
    const client = getAnthropicClient();
    const aiResponse = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Today's date is ${today}. Parse this networking recap into JSON. Return ONLY valid JSON with no markdown, no code fences.

Schema:
{
  "name": string,
  "role": string (job title and company if mentioned, else ""),
  "event": string (event name),
  "date": string (ISO date, infer from "last Friday", "yesterday", etc., or use today if unclear),
  "topics": string[] (2-5 key conversation topics),
  "notes": string (anything else worth remembering),
  "email": "",
  "followUpDays": number (3 if not specified),
  "lastContacted": string (ISO date of when user last spoke to this person, infer from "last talked 2 days ago", "spoke last week", etc., or use "date" value if not mentioned)
}

Recap: "${rawText}"`,
        },
      ],
    });

    const text = aiResponse.content.find(block => block.type === 'text')?.text?.trim() ?? '';
    const parsed = parseJsonResponse(text);
    const contacts = normalizeParsedContacts(parsed, today);

    return sendJson(response, 200, { contacts });
  } catch (error) {
    console.error('parse-contact failed', error);
    return sendError(response, 500, error.message || 'Failed to parse contact.');
  }
}
