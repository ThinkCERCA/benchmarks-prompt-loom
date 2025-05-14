<!-- ResultsSection.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  
  // Props
  export let results = null;
  export let useCustomTopic = false;
  export let customTopic = '';
  export let selectedTopic = '';
  export let regenerating = false;
  export let customPrompt = '';
  
  // Event dispatcher
  const dispatch = createEventDispatcher();
  
  // Handlers
  function handleRegeneratePrompts() {
    dispatch('regeneratePrompts');
  }
  
  function handleSelectPrompt(promptCard) {
    dispatch('selectPrompt', { promptCard });
  }
  
  function handleCreateCustomPrompt() {
    dispatch('createCustomPrompt');
  }
  
  function handleCustomPromptChange(event) {
    customPrompt = event.target.value;
    dispatch('customPromptChange', { customPrompt });
  }
</script>

<div class="results-section">
  <div class="results-header">
    <h2>Argumentative Prompt Ideas for "{useCustomTopic ? customTopic : selectedTopic}"</h2>
    <button 
      class="regenerate-button" 
      on:click={handleRegeneratePrompts}
      disabled={regenerating}
    >
      {#if regenerating}
        <svg class="spin-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 6v6l4 2"></path>
        </svg>
        Generating...
      {:else}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 4v6h-6"></path>
          <path d="M1 20v-6h6"></path>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
          <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
        </svg>
        Generate New Ideas
      {/if}
    </button>
  </div>
  
  {#if results.subtopics && results.subtopics.length > 0}
    <div class="prompt-cards-grid">
      {#each results.subtopics as subtopic}
        <div 
          class="prompt-card" 
          role="button"
          tabindex="0"
          on:click={() => handleSelectPrompt(subtopic)}
          on:keypress={(e) => e.key === 'Enter' && handleSelectPrompt(subtopic)}
        >
          <h3>{subtopic.title}</h3>
          <p>{subtopic.description}</p>
          
          <button class="select-button" on:click|stopPropagation={() => handleSelectPrompt(subtopic)}>
            Select This Prompt
          </button>
        </div>
      {/each}
    </div>
  {:else}
    <div class="no-results">
      <p>No prompt cards available.</p>
    </div>
  {/if}
  
  <!-- Custom Prompt Creation Area -->
  <div class="custom-prompt-area">
    <h3>Create Your Own Prompt</h3>
    <textarea 
      class="custom-prompt-input" 
      placeholder="Write your own argumentative prompt here..." 
      value={customPrompt}
      on:input={handleCustomPromptChange}
      rows="3"
    ></textarea>
    <button 
      class="use-custom-prompt-button" 
      on:click={handleCreateCustomPrompt}
      disabled={!customPrompt.trim()}
    >
      Use This Prompt
    </button>
  </div>
</div>

<style>
  .results-section {
    padding: 20px;
    background: #f4f9f4;
    border-radius: 12px;
    min-height: 400px;
    box-sizing: border-box;
    max-width: 1000px;
    width: 100%;
    margin: 0 auto;
  }
  
  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .results-header h2 {
    font-size: 24px;
    font-weight: 600;
    color: #2d5a27;
    margin: 0;
  }
  
  .regenerate-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: #4caf50;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .regenerate-button:hover:not(:disabled) {
    background: #43a047;
  }
  
  .regenerate-button:disabled {
    background: #a5d6a7;
    cursor: not-allowed;
  }

  .spin-icon {
    animation: spin 1.5s linear infinite;
  }
  
  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
  
  .custom-prompt-area {
    background: white;
    padding: 15px;
    border-radius: 8px;
    margin-top: 60px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
  }
  
  .custom-prompt-area h3 {
    margin: 0 0 10px 0;
    font-size: 16px;
    font-weight: 600;
    color: #2d5a27;
  }
  
  .custom-prompt-input {
    width: 97%;
    padding: 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    resize: vertical;
    font-family: inherit;
    margin-bottom: 10px;
  }
  
  .use-custom-prompt-button {
    padding: 8px 16px;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;
  }
  
  .use-custom-prompt-button:hover:not(:disabled) {
    background: #4f46e5;
  }
  
  .use-custom-prompt-button:disabled {
    background: #c7d2fe;
    cursor: not-allowed;
  }
  
  .prompt-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    justify-items: center;
    margin: 0 auto;
    max-width: 95%;
  }
  
  .prompt-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
    width: 100%;
    max-width: 350px;
  }
  
  .prompt-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-color: #4287f5;
  }
  
  .prompt-card:focus {
    outline: none;
    border-color: #4287f5;
    box-shadow: 0 0 0 3px rgba(66, 135, 245, 0.3);
  }
  
  .prompt-card h3 {
    margin: 0 0 15px 0;
    font-size: 18px;
    font-weight: 600;
    color: #4287f5;
  }
  
  .prompt-card p {
    margin: 0 0 20px 0;
    color: #4a5568;
    line-height: 1.6;
  }
  
  .select-button {
    width: 100%;
    padding: 10px 16px;
    background: #4287f5;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;
    margin-top: 15px;
  }
  
  .select-button:hover {
    background: #3574e2;
  }
  
  .select-button:active {
    transform: translateY(1px);
  }
  
  .no-results {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    color: #718096;
  }
  
  @media (max-width: 900px) {
    .results-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
    
    .regenerate-button {
      align-self: flex-end;
    }
  }
</style>