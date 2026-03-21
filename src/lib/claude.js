import Anthropic from '@anthropic-ai/sdk';

function getClient() {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Missing VITE_ANTHROPIC_API_KEY in .env');
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

export async function parseContact(rawText) {
  const client = getClient();
  const today = new Date().toISOString().split('T')[0];

  const response = await client.messages.create({
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
  "followUpDays": number (3 if not specified)
}

Recap: "${rawText}"`,
      },
    ],
  });

  const text = response.content.find(b => b.type === 'text')?.text || '';
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Could not parse contact from response');
  }
}

export async function generateFollowUp(contact) {
  const client = getClient();

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `Write a short, warm, personalized follow-up message for this contact. Return ONLY valid JSON with no markdown.

Contact:
- Name: ${contact.name}
- Role: ${contact.role}
- Met at: ${contact.event}
- Topics discussed: ${contact.topics?.join(', ')}
- Notes: ${contact.notes}

Return JSON: { "subject": "...", "body": "..." }
Subject should be friendly, 6-10 words.
Body should be 2-4 sentences, warm, specific to what you discussed.`,
      },
    ],
  });

  const text = response.content.find(b => b.type === 'text')?.text || '';
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Could not parse follow-up from response');
  }
}
