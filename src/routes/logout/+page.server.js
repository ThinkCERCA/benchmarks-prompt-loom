import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export function load({ cookies }) {
  // Clear the session cookie
  cookies.set('promptloom-session', '', {
    path: '/',
    expires: new Date(0)
  });
  
  // Redirect to login page
  throw redirect(303, '/login');
}