import { getAnthropicClient, readJsonBody, requireAuthenticatedUser, sendError, sendJson } from './_lib/server.js';

function parseJsonResponse(text) {
  const cleaned = text.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }

    throw new Error('Could not parse follow-up from response');
  }
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
    const contact = body.contact;

    if (!contact || typeof contact !== 'object') {
      return sendError(response, 400, 'contact is required.');
    }

    if (!contact.name || !contact.event) {
      return sendError(response, 400, 'contact.name and contact.event are required.');
    }

    const client = getAnthropicClient();
    const aiResponse = await client.messages.create({
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

    const text = aiResponse.content.find(block => block.type === 'text')?.text?.trim() ?? '';
    const draft = parseJsonResponse(text);

    return sendJson(response, 200, { draft });
  } catch (error) {
    console.error('generate-followup failed', error);
    return sendError(response, 500, error.message || 'Failed to generate follow-up.');
  }
}
