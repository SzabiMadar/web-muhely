import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient, isSupabaseConfigured } from './lib/server/supabase';

const PUBLIC_PREFIXES = ['/login', '/_astro', '/favicon', '/@', '/node_modules'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  context.locals.isSupabaseConfigured = isSupabaseConfigured();

  const supabase = createSupabaseServerClient(context.cookies, context.request);
  context.locals.supabase = supabase;

  const { data } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };
  context.locals.user = data.user;

  const isPublic = PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!context.locals.user && !isPublic) {
    const next = encodeURIComponent(pathname + context.url.search);
    return context.redirect(`/login?next=${next}`);
  }

  if (context.locals.user && pathname === '/login') {
    return context.redirect('/dashboard');
  }

  return next();
});
