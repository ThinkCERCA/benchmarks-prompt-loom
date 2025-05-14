# Benchmarks Prompt Loom

Benchmarks Prompt Loom is a SvelteKit-based application designed to help users explore educational topics, generate prompts, and analyze text complexity. The app provides a seamless user experience with features like topic selection, prompt generation, and workspace management.

## Features

- **Topic Explorer**: Browse and pin topics for prompt generation.
- **Prompt Generation**: Generate educational prompts based on selected topics and grade levels.
- **Text Complexity Analysis**: Analyze the complexity of generated prompts using word counts.
- **Workspace Management**: View and manage selected prompts in a dedicated workspace.
- **Password Protection**: Secure access to the app with a login system.

## Technologies Used

- **Frontend**: [SvelteKit](https://kit.svelte.dev/)
- **Backend**: SvelteKit server endpoints
- **Styling**: CSS with responsive design
- **API Integration**: Google Custom Search API and custom text analysis endpoints

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/benchmarks-prompt-loom.git
   cd benchmarks-prompt-loom
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file in the root directory and add the following environment variables:
   ```
   VITE_GOOGLE_API_KEY=your_google_api_key
   VITE_SEARCH_ENGINE_ID=your_search_engine_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open the app in your browser at http://localhost:5173.

## Usage

1. **Login**: Enter the password to access the app.
2. **Explore Topics**: Browse and pin topics using the Topic Explorer.
3. **Generate Prompts**: Select a topic and grade level, then generate prompts.
4. **Analyze Text**: Analyze the complexity of generated prompts.
5. **Manage Workspace**: View and manage selected prompts in the workspace.

## File Structure

```
src/
├── lib/
│   ├── components/       # Reusable Svelte components
│   └── data/             # Static data (e.g., topics)
├── routes/
│   ├── api/              # API endpoints
│   ├── login/            # Login page
│   ├── logout/           # Logout endpoint
│   └── +page.svelte      # Main application page
└── hooks.server.js       # Middleware for authentication
```

## API Endpoints

* `/api/search`: Fetches search results from Google Custom Search API.
* `/api/recommend`: Generates educational prompts based on user input.
* `/api/analyze-text`: Analyzes text complexity.

## Authentication

The app is password-protected. Users must log in with a valid password to access the app. Authentication is managed using cookies.

## Deployment

1. Build the app for production:
   ```bash
   npm run build
   ```

2. Preview the production build:
   ```bash
   npm run preview
   ```

3. Deploy the app to your preferred hosting platform (e.g., Vercel, Netlify).

## License

This project is licensed under the MIT License.

