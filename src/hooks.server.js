import { redirect } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  // Get the session from cookies
  const session = event.cookies.get('promptloom-session');
  
  // Skip authentication for login page and static assets
  if (event.url.pathname === '/login' || event.url.pathname.startsWith('/static')) {
    return resolve(event);
  }
  
  // Skip authentication for API routes if you want them to be public
  // Remove this if you want to protect your API routes as well
  if (event.url.pathname.startsWith('/api')) {
    return resolve(event);
  }
  
  // If no session exists, redirect to login
  if (!session) {
    throw redirect(303, '/login');
  }
  
  // Continue to the requested route
  return resolve(event);
}