import { redirect } from '@sveltejs/kit';
import { SHARED_PASSWORD } from '$env/static/private';

/** @type {import('./$types').Actions} */
export const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const password = data.get('password');
    
    // Check against the shared password (stored in .env)
    if (password === SHARED_PASSWORD) {
      // Set a session cookie
      cookies.set('promptloom-session', 'authenticated', {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
      
      // Redirect to home page after successful login
      throw redirect(303, '/');
    }
    
    // Invalid password
    return {
      success: false,
      message: 'Invalid password'
    };
  }
};
