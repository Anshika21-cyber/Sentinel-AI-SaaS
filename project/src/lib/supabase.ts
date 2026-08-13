import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const supabasePublishableKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) || '';

const MISSING_MSG =
	'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your .env file.';

let supabaseClient: SupabaseClient | null = null;

if (!supabaseUrl || !supabasePublishableKey) {
	// eslint-disable-next-line no-console
	console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY is not set');
} else {
	supabaseClient = createClient(supabaseUrl, supabasePublishableKey);
}

// Provide a safe stub when Supabase isn't configured so the app doesn't crash.
const makeNotConfiguredError = (methodName = '') => ({ error: new Error(MISSING_MSG + (methodName ? ` (${methodName})` : '')) });

const stub = {
	auth: {
		getSession: async () => ({ data: { session: null }, error: new Error(MISSING_MSG) }),
		getUser: async () => ({ data: { user: null }, error: new Error(MISSING_MSG) }),
		signInWithPassword: async () => ({ error: new Error(MISSING_MSG) }),
		signUp: async () => ({ error: new Error(MISSING_MSG) }),
		signOut: async () => ({ error: new Error(MISSING_MSG) }),
		onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
	},
	from: (_: string) => ({
		select: async () => makeNotConfiguredError('select'),
		insert: async () => makeNotConfiguredError('insert'),
		update: async () => makeNotConfiguredError('update'),
		delete: async () => makeNotConfiguredError('delete'),
		order: function () { return this; },
		ilike: function () { return this; },
		gte: function () { return this; },
	}),
	storage: {
		from: (_: string) => ({
			upload: async () => makeNotConfiguredError('storage.upload'),
			getPublicUrl: (_p: string) => ({ publicUrl: '' }),
		}),
	},
} as any;

export const supabase: SupabaseClient = (supabaseClient ?? (stub as unknown)) as SupabaseClient;

// --- Auth helper wrappers ---
export async function signInWithEmail(email: string, password: string) {
	return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail({ email, password, full_name }: { email: string; password: string; full_name?: string }) {
	const res = await supabase.auth.signUp({ email, password });

	// If sign up immediately returns a user (email confirmed flows depending on Supabase settings), create profile
	const user = res.data?.user ?? null;
	if (user) {
		try {
			await supabase.from('profiles').upsert({ id: user.id, full_name: full_name ?? '', email, role: 'user', trust_score: 50 });
		} catch (e) {
			// eslint-disable-next-line no-console
			console.warn('Failed to create profile after signUp:', e);
		}
	}

	return res;
}

export async function signOut() {
	return supabase.auth.signOut();
}

export function onAuthStateChange(cb: (event: string, session: any) => void) {
	return supabase.auth.onAuthStateChange(cb);
}

export async function getProfile(userId: string) {
	return supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
}

// Community report helpers (small convenience wrappers)
export async function fetchCommunityReports() {
	return supabase.from('community_reports').select('*').order('created_at', { ascending: false });
}

export async function insertCommunityReport(payload: any) {
	return supabase.from('community_reports').insert([payload]);
}

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

// Guarded update: only verification_status may change. RLS restricts this to
// users whose profile role is 'admin' (see "CommunityReports: admin update verification").
export async function updateReportVerificationStatus(id: string, status: VerificationStatus) {
	return supabase
		.from('community_reports')
		.update({ verification_status: status })
		.eq('id', id);
}

export async function uploadReportPhoto(filePath: string, file: File) {
	return supabase.storage.from('report-photos').upload(filePath, file, { contentType: file.type, upsert: true });
}

export function getReportPublicUrl(filePath: string) {
	return supabase.storage.from('report-photos').getPublicUrl(filePath);
}
