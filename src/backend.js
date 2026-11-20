import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && key ? createClient(url, key, { auth: { flowType: 'pkce' } }) : null;
export const documentBucket = 'citizen-documents';

export function authCallback(recovery = false) {
  return window.location.origin + '/auth/callback' + (recovery ? '?intent=recovery' : '');
}

export async function isGitHubEnabled() {
  const response = await fetch(new URL('/auth/v1/settings', url), { headers: { apikey: key } });
  if (!response.ok) throw new Error('Authentication settings are unavailable');
  const settings = await response.json();
  return settings.external?.github === true;
}

export async function voiceHeaders() {
  if (!supabase) return {};
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ? { Authorization: 'Bearer ' + data.session.access_token } : {};
}

export function useAccount() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);
  const callbackUrl = new URL(window.location.href);
  const params = callbackUrl.searchParams;
  const hash = new URLSearchParams(callbackUrl.hash.slice(1));
  return {
    user: session?.user, loading, configured: Boolean(supabase),
    recovery: callbackUrl.pathname === '/auth/callback' && params.get('intent') === 'recovery',
    callbackError: params.get('error_code') || hash.get('error_code') || params.get('error') || hash.get('error'),
  };
}

export function dataOrThrow({ data, error }) {
  if (error) throw error;
  return data;
}

export function asDateInput(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function ageOn(birth, date = asDateInput()) {
  if (!birth || birth > date) return undefined;
  const yearDifference = Number(date.slice(0, 4)) - Number(birth.slice(0, 4));
  return yearDifference - Number(date.slice(5) < birth.slice(5));
}

export function memberFacts(member) {
  const facts = { ...member.facts };
  const age = ageOn(member.birth_date);
  if (age !== undefined) facts.age = age;
  const aadhaarBirth = facts.aadhaarAge === true;
  delete facts.aadhaarAge;
  if (aadhaarBirth && age !== undefined) facts.aadhaarAge = age;
  return facts;
}

export function memberMilestones(member, today = asDateInput()) {
  const birth = member.birth_date;
  if (!birth) return [];
  return [
    { age: 18, scheme: 'pmsby' },
    ...(member.facts?.aadhaarAge === true ? [{ age: 70, scheme: 'vay-vandana' }] : []),
  ].map(({ age, scheme }) => {
    const year = Number(birth.slice(0, 4)) + age;
    const date = birth.slice(5) === '02-29' && new Date(year, 1, 29).getMonth() !== 1 ? year + '-03-01' : year + birth.slice(4);
    return { age, scheme, date, member };
  }).filter(({ date }) => date >= today && Number(date.slice(0, 4)) <= Number(today.slice(0, 4)) + 3);
}
