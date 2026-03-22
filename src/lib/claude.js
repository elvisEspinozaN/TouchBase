import { getSession } from './auth.js';

async function callClaudeRoute(path, payload) {
  const session = await getSession();
  const accessToken = session?.access_token;

  if (!accessToken) {
    throw new Error('Sign in is required before using AI features.');
  }

  const response = await fetch(`/api/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  let result = {};
  try {
    result = await response.json();
  } catch {
    result = {};
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('AI routes are unavailable. Use `vercel dev` locally or test on a Vercel deployment.');
    }

    throw new Error(result.error || 'AI request failed.');
  }

  return result;
}

export async function parseContact(rawText) {
  const result = await callClaudeRoute('parse-contact', { rawText });
  return result.contacts ?? [];
}

export async function generateFollowUp(contact) {
  const result = await callClaudeRoute('generate-followup', { contact });
  return result.draft;
}
