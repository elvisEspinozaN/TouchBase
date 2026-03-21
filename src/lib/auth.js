import { getSupabaseClient } from "./supabase.js";

function getDefaultEmailRedirectTo() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return `${window.location.origin}/`;
}

function normalizeEmail(email) {
  if (typeof email !== "string" || email.trim() === "") {
    throw new Error("A valid email address is required.");
  }

  return email.trim();
}

function normalizePassword(password) {
  if (typeof password !== "string" || password.length < 6) {
    throw new Error("A password with at least 6 characters is required.");
  }

  return password;
}

export async function signUpWithEmailPassword(email, password, options = {}) {
  const supabase = getSupabaseClient();
  const redirectTo = options.emailRedirectTo ?? getDefaultEmailRedirectTo();
  const metadata = options.data ?? undefined;

  const { data, error } = await supabase.auth.signUp({
    email: normalizeEmail(email),
    password: normalizePassword(password),
    options: {
      ...(metadata ? { data: metadata } : {}),
      ...(redirectTo ? { emailRedirectTo: redirectTo } : {}),
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signInWithEmailPassword(email, password) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizeEmail(email),
    password: normalizePassword(password),
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signInWithMagicLink(email, options = {}) {
  const supabase = getSupabaseClient();
  const redirectTo = options.emailRedirectTo ?? getDefaultEmailRedirectTo();
  const shouldCreateUser = options.shouldCreateUser ?? true;

  const { data, error } = await supabase.auth.signInWithOtp({
    email: normalizeEmail(email),
    options: {
      shouldCreateUser,
      ...(redirectTo ? { emailRedirectTo: redirectTo } : {}),
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function exchangeCodeForSession(
  url = typeof window !== "undefined" ? window.location.href : undefined,
) {
  if (!url) {
    return { session: null, user: null, consumed: false };
  }

  const parsedUrl = new URL(url);
  const code = parsedUrl.searchParams.get("code");

  if (!code) {
    return { session: null, user: null, consumed: false };
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    throw error;
  }

  return {
    session: data.session,
    user: data.user,
    consumed: true,
  };
}

export async function getSession() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function getCurrentUser() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
}

export function onAuthStateChange(callback) {
  const supabase = getSupabaseClient();
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return data.subscription;
}

export async function signOut() {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}
