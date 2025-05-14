<script>
  import { fade } from 'svelte/transition';
  import { onMount, afterUpdate } from 'svelte';
  import SearchResult from '$lib/components/SearchResult.svelte';
  
  // Props from parent component
  export let selectedPromptCard;
  export let selectedTopic;
  export let customTopic;
  export let useCustomTopic;
  export let selectedGrades;
  export let additionalGuidance;
  
  // Local state for search functionality
  let query = '';
  let results = [];
  let loading = false;
  let error = null;
  
  // Modal state - set initial value to false
  let showChatGPTDialog = false;
  let promptText = '';
  
  // Add these for tracking changes
  let previousPromptCard = null;
  let previousTopic = '';
  let previousCustomTopic = '';
  let previousUseCustomTopic = false;
  
  // Function to format grade level display
  function formatGradeLevel(grades) {
    return grades.map(grade => {
      // Replace "grade8" with "8" to show just the number
      const gradeNumber = grade.toString().replace(/^grade/i, '');
      return `Grade ${gradeNumber}`;
    }).join(', ');
  }
  
  // Function to copy prompt to clipboard
  function copyPromptToClipboard() {
    const promptText = `${selectedPromptCard.title}\n\n${selectedPromptCard.description}`;
    
    // In a browser environment this would use the clipboard API
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(promptText)
        .then(() => {
          // Show success message (would need to add UI for this)
          console.log('Prompt copied to clipboard');
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  }
  
  // Function to copy text to clipboard
  function copyTextToClipboard(text) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => {
          console.log('Text copied to clipboard:', text);
        })
        .catch(err => {
          console.error('Failed to copy:', err);
        });
    }
  }
  
  // Function to generate ChatGPT prompt text
  function generateChatGPTPrompt() {
    const topic = useCustomTopic ? customTopic : selectedTopic;
    const gradeDisplay = formatGradeLevel(selectedGrades);
    
    // Create a well-formatted prompt with bullet points
    return `I need teaching resources about "${topic}" focusing on "${selectedPromptCard.title}" for ${gradeDisplay}.

Here's detailed information about my request:

• Main Topic: ${topic}
• Subtopic/Focus: ${selectedPromptCard.title}
• Grade Level: ${gradeDisplay}
• Prompt Description: ${selectedPromptCard.description}
${additionalGuidance ? `• Additional Guidance: ${additionalGuidance}` : ''}
${selectedPromptCard.objectives && selectedPromptCard.objectives.length > 0 ? 
  `• Learning Objectives: 
${selectedPromptCard.objectives.map(obj => `  - ${obj}`).join('\n')}` : ''}

Please suggest appropriate reading materials, lesson plans, or activities that would support teaching this topic.`;
  }
  
  // Function to handle ChatGPT button click
  function handleChatGPTClick() {
    // Generate the prompt
    promptText = generateChatGPTPrompt();
    
    // Copy to clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        navigator.clipboard.writeText(promptText);
        console.log('ChatGPT prompt copied to clipboard');
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
    
    // Show dialog
    showChatGPTDialog = true;
    console.log('ChatGPT dialog should be visible now:', showChatGPTDialog);
  }
  
  // Function to continue to ChatGPT
  function continueToGPT() {
    window.open('https://chat.openai.com/', '_blank');
    closeChatGPTDialog();
  }
  
  // Function to close dialog
  function closeChatGPTDialog() {
    showChatGPTDialog = false;
  }
  
  // Function to open Google search in new tab
  function openGoogleSearch() {
    const encodedQuery = encodeURIComponent(query);
    window.open(`https://www.google.com/search?q=${encodedQuery}`, '_blank');
  }
  
  // Search functionality
  async function handleSearch() {
    if (!query.trim()) return;
    
    loading = true;
    error = null;
    
    try {
      // Use the topic as initial search query if none provided
      const topic = useCustomTopic ? customTopic : selectedTopic;
      
      // Create a comprehensive search query using all the relevant information
      query = `articles, stories about ${topic} ${selectedPromptCard.title} for ${selectedGrades}`;
      
      console.log("Executing search with query:", query);
      console.log("Selected prompt card:", selectedPromptCard.title);
      console.log("Selected topic:", selectedTopic);
      console.log("Custom topic:", customTopic);
      console.log("Using custom topic:", useCustomTopic);
      console.log("Selected grades:", selectedGrades);
      console.log("Additional guidance:", additionalGuidance);

      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      results = data.items || [];
      
      if (results.length === 0) {
        error = 'No results found';
      }
    } catch (err) {
      console.error('Search error:', err);
      error = err.message || 'Failed to search for educational resources';
      results = [];
    } finally {
      loading = false;
    }
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }
  
  // Check if important props have changed
  function hasPromptSelectionChanged() {
    // Check if prompt card changed
    const promptCardChanged = 
      !previousPromptCard || 
      previousPromptCard.title !== selectedPromptCard.title;
    
    // Check if topic selection changed
    const topicChanged = 
      previousTopic !== selectedTopic || 
      previousCustomTopic !== customTopic ||
      previousUseCustomTopic !== useCustomTopic;
    
    return promptCardChanged || topicChanged;
  }
  
  // Update reference values
  function updatePreviousValues() {
    previousPromptCard = { ...selectedPromptCard };
    previousTopic = selectedTopic;
    previousCustomTopic = customTopic;
    previousUseCustomTopic = useCustomTopic;
  }
  
  // Add afterUpdate lifecycle hook to check for changes and trigger search
  afterUpdate(() => {
    if (hasPromptSelectionChanged()) {
      console.log('Prompt selection changed, redoing search');
      handleSearch();
      updatePreviousValues();
    }
  });
  
  // Initialize search with the selected topic on component mount
  onMount(() => {
    // Set initial query to the topic
    query = useCustomTopic ? customTopic : selectedTopic;
    // Execute search
    handleSearch();
    // Initialize previous values
    updatePreviousValues();
  });
</script>

<div class="workspace" transition:fade={{ duration: 300 }}>
  <div class="workspace-header">
    <h2>Argumentative Prompt Workspace</h2>
  </div>
  
  <div class="workspace-content">
    <div class="workspace-info">
      <div class="grade-badge">
        {formatGradeLevel(selectedGrades)}
      </div>
      
      <div class="info-section">
        <h3>Main Topic</h3>
        <p>{useCustomTopic ? customTopic : selectedTopic}</p>
        <button class="copy-button" on:click={() => copyTextToClipboard(useCustomTopic ? customTopic : selectedTopic)}>Copy</button>
      </div>
      
      <div class="info-section subtopic">
        <h3>Subtopic</h3>
        <p>{selectedPromptCard.title}</p>
        <button class="copy-button" on:click={() => copyTextToClipboard(selectedPromptCard.title)}>Copy</button>
      </div>
      
      <div class="info-section prompt-summary">
        <h3>Prompt Description</h3>
        <p class="prompt-text">{selectedPromptCard.description}</p>
        <button class="copy-button" on:click={() => copyTextToClipboard(selectedPromptCard.description)}>Copy</button>
        
        {#if selectedPromptCard.objectives && selectedPromptCard.objectives.length > 0}
          <div class="prompt-objectives">
            <h5>Learning Objectives</h5>
            <ul>
              {#each selectedPromptCard.objectives as objective}
                <li>{objective}</li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
      
      <div class="info-section guidance-section">
        <h3>Additional Guidance</h3>
        <p>{additionalGuidance ? additionalGuidance : 'No guidance provided'}</p>
        <button class="copy-button" on:click={() => copyTextToClipboard(additionalGuidance || 'No guidance provided')}>Copy</button>
      </div>
    </div>
    
    <!-- Search Panel with Results Display -->
    <div class="search-panel">
      <h2>Explore Potential Readings</h2>
      
      <!-- Search Query Display -->
      <div class="search-display-section">
        <div class="search-query-box">
          <div class="search-label">Search query:</div>
          <div class="search-text">{query}</div>
          <button class="copy-icon-button" on:click={() => copyTextToClipboard(query)} title="Copy search query">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>
        
        <div class="external-search-buttons">
          <button class="external-button google" on:click={openGoogleSearch}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Open in Google
          </button>
          
          <button class="external-button chatgpt" on:click={handleChatGPTClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Open in ChatGPT
          </button>
        </div>
      </div>

      <div class="development-notice">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>Reading results is a feature under development. Some functionality may be limited.</span>
      </div>
      
      <!-- ChatGPT Dialog Box (rendered inline instead of using a modal) -->
      {#if showChatGPTDialog}
        <div class="chatgpt-dialog" transition:fade={{ duration: 200 }}>
          <div class="dialog-header">
            <h3>ChatGPT Prompt Copied to Clipboard</h3>
            <button class="dialog-close" on:click={closeChatGPTDialog}>×</button>
          </div>
          
          <div class="dialog-content">
            <p>Your prompt has been copied to your clipboard.</p>
            <ol>
              <li>Click the "Open ChatGPT" button below</li>
              <li>When ChatGPT opens, click in the message input field</li>
              <li>Paste the prompt (Ctrl+V or Cmd+V)</li>
              <li>Press Enter to send</li>
            </ol>
            
            <div class="prompt-box">
              <div class="prompt-header">
                <span>Prompt Preview</span>
                <button class="copy-again-btn" on:click={() => copyTextToClipboard(promptText)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copy Again
                </button>
              </div>
              <pre class="prompt-preview">{promptText}</pre>
            </div>
            
            <div class="dialog-actions">
              <button class="dialog-btn secondary" on:click={closeChatGPTDialog}>Close</button>
              <button class="dialog-btn primary" on:click={continueToGPT}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                Open ChatGPT
              </button>
            </div>
          </div>
        </div>
      {/if}
      
      <!-- Loading state -->
      {#if loading}
        <div class="loading-results">
          <div class="spinner"></div>
          <p>Searching for educational resources...</p>
        </div>
      {/if}
      
      <!-- Error state -->
      {#if error && !loading}
        <div class="error-message">
          <p>{error}</p>
          <button class="secondary-button" on:click={handleSearch}>Try Again</button>
        </div>
      {/if}
      
      <!-- Results count -->
      {#if results.length > 0 && !loading}
        <div class="results-count">
          Found {results.length} resource{results.length !== 1 ? 's' : ''}
        </div>
      {/if}
      
      <!-- Results list -->
      {#if results.length > 0 && !loading}
        <div class="results-list">
          {#each results as result}
            <SearchResult {result} />
          {/each}
        </div>
      {:else if !loading && !error}
        <div class="empty-results">
          <p>No educational resources found for this prompt</p>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .workspace {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
    padding: 20px;
    min-height: 600px;
    box-sizing: border-box;
    max-width: 1000px;
    width: 100%;
    margin: 0 auto;
  }

  .workspace-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .workspace-header h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }

  .workspace-content {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 20px;
  }

  .workspace-info {
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: relative;
  }

  .grade-badge {
    background: #e1ecff;
    color: #1e40af;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 6px;
    display: inline-block;
    align-self: flex-start;
    border: 1px solid #b4d0ff;
  }

  .info-section {
    background: #f0f5ff;
    padding: 12px;
    border-radius: 8px;
    border-left: 3px solid #3b82f6;
    margin-bottom: 10px;
  }

  .info-section h3 {
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
  }

  .info-section p {
    margin: 0;
    font-size: 16px;
    color: #111827;
  }

  .info-section.prompt-summary {
    background: #f0f5ff;
    border-left: 3px solid #3b82f6;
    padding: 12px;
  }

  .info-section.prompt-summary h4 {
    color: #1e40af;
    margin: 0 0 6px 0;
    font-size: 18px;
    font-weight: 600;
  }

  .prompt-text {
    font-size: 16px;
    line-height: 1.4;
    color: #374151;
    margin-bottom: 10px;
  }

  .guidance-section {
    background: #f0f5ff;
    border-left: 3px solid #3b82f6;
    padding: 12px;
  }

  .guidance-section p {
    font-style: italic;
    color: #374151;
  }

  .prompt-objectives {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #d1ddf7;
  }

  .prompt-objectives h5 {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 4px 0;
    color: #3b4f7f;
  }

  .prompt-objectives ul {
    margin: 0;
    padding-left: 20px;
  }

  .prompt-objectives li {
    margin: 4px 0;
    font-size: 14px;
    color: #4b5563;
  }

  /* Search panel styling */
  .search-panel {
    background: #f9fafb;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
  }

  .search-panel h2 {
    margin: 0 0 15px 0;
    font-size: 20px;
    font-weight: 600;
    color: #111827;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 8px;
  }

  /* Search display section */
  .search-display-section {
    background: #ffffff;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .search-query-box {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    position: relative;
  }

  .search-label {
    font-weight: 600;
    color: #4b5563;
    font-size: 14px;
    flex-shrink: 0;
    min-width: 100px;
  }

  .search-text {
    flex-grow: 1;
    color: #111827;
    font-size: 14px;
    line-height: 1.5;
    word-break: break-word;
    padding-right: 30px; /* space for copy button */
  }

  .copy-icon-button {
    background: transparent;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 3px;
    border-radius: 4px;
    position: absolute;
    top: 0;
    right: 0;
    transition: all 0.2s;
  }

  .copy-icon-button:hover {
    color: #3b82f6;
    background: #f0f5ff;
  }

  .external-search-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .external-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    flex-grow: 1;
    justify-content: center;
  }

  .external-button.google {
    background: #f8fafd;
    color: #1a73e8;
    border: 1px solid #d2e3fc;
  }

  .external-button.google:hover {
    background: #f0f7ff;
    border-color: #1a73e8;
  }

  .external-button.chatgpt {
    background: #f6fef9;
    color: #10a37f;
    border: 1px solid #d1f0e5;
  }

  .external-button.chatgpt:hover {
    background: #edfcf5;
    border-color: #10a37f;
  }

  /* Development notice */
  .development-notice {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #fff8e6;
    border: 1px solid #feefc3;
    border-radius: 8px;
    padding: 12px 15px;
    margin-bottom: 16px;
    font-size: 14px;
    color: #b06000;
    line-height: 1.4;
  }

  .development-notice svg {
    flex-shrink: 0;
    color: #f59e0b;
  }

  /* ChatGPT Dialog (inline, not modal) */
  .chatgpt-dialog {
    background: white;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    overflow: hidden;
  }

  .dialog-header {
    background: #f8fafc;
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e5e7eb;
  }

  .dialog-header h3 {
    margin: 0;
    font-size: 16px;
    color: #111827;
  }

  .dialog-close {
    background: transparent;
    border: none;
    color: #6b7280;
    font-size: 22px;
    cursor: pointer;
    line-height: 1;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
  }

  .dialog-close:hover {
    background: #f3f4f6;
    color: #111827;
  }

  .dialog-content {
    padding: 16px;
  }

  .dialog-content p {
    margin-top: 0;
    margin-bottom: 12px;
    color: #4b5563;
  }

  .dialog-content ol {
    margin: 0 0 16px;
    padding-left: 24px;
  }

  .dialog-content li {
    margin-bottom: 8px;
    color: #4b5563;
  }

  .prompt-box {
    background: #f8fafc;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    margin-bottom: 16px;
  }

  .prompt-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid #e5e7eb;
  }

  .prompt-header span {
    font-size: 14px;
    font-weight: 500;
    color: #4b5563;
  }

  .copy-again-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 8px;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 12px;
    color: #475569;
    cursor: pointer;
  }

  .copy-again-btn:hover {
    background: #e2e8f0;
  }

  .prompt-preview {
    padding: 12px;
    margin: 0;
    max-height: 200px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 13px;
    line-height: 1.5;
    color: #334155;
  }

  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
  }

  .dialog-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  }

  .dialog-btn.primary {
    background: #10a37f;
    color: white;
    border: none;
  }

  .dialog-btn.primary:hover {
    background: #0e8c6d;
  }

  .dialog-btn.secondary {
    background: white;
    color: #4b5563;
    border: 1px solid #d1d5db;
  }

  .dialog-btn.secondary:hover {
    background: #f3f4f6;
  }

  .results-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
  height: 500px; /* Fixed height container */
  max-height: 500px;
  overflow-y: scroll; /* Always show scrollbar */
  padding: 15px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
}

/* Custom scrollbar styling for WebKit browsers */
.results-list::-webkit-scrollbar {
  width: 10px;
  background-color: #f5f5f5;
}

.results-list::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: #c1c1c1;
}

.results-list::-webkit-scrollbar-track {
  border-radius: 10px;
  background-color: #f5f5f5;
}

/* Firefox scrollbar */
@-moz-document url-prefix() {
  .results-list {
    scrollbar-width: thin;
    scrollbar-color: #c1c1c1 #f5f5f5;
  }
}
  .results-count {
    color: #4b5563;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 12px;
    background: #f3f4f6;
    padding: 8px 12px;
    border-radius: 6px;
    display: inline-block;
  }

  /* Empty and loading states */
  .empty-results {
    background: white;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    color: #6b7280;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    margin-bottom: 20px;
  }

  .loading-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    margin-bottom: 20px;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e5e7eb;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .loading-results p {
    color: #6b7280;
    font-size: 16px;
  }

  .error-message {
    background: #fee2e2;
    border: 1px solid #fca5a5;
    border-radius: 8px;
    padding: 15px;
    color: #b91c1c;
    text-align: center;
    margin-bottom: 20px;
  }

  .error-message p {
    margin-bottom: 10px;
  }

  .copy-button {
    margin-top: 6px;
    padding: 4px 10px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .copy-button:hover {
    background: #2563eb;
  }

  .secondary-button {
    padding: 8px 14px;
    background: white;
    color: #4b5563;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .secondary-button:hover {
    background: #f3f4f6;
  }

  /* Responsive adjustments */
  @media (max-width: 1024px) {
    .workspace-content {
      grid-template-columns: 1fr;
      gap: 15px;
    }
    
    .workspace-info {
      margin-bottom: 15px;
    }
  }

  @media (max-width: 768px) {
    .workspace {
      padding: 15px;
    }
    
    .workspace-header h2 {
      font-size: 20px;
    }
    
    .search-query-box {
      flex-direction: column;
    }
    
    .search-label {
      margin-bottom: 5px;
    }
    
    .external-search-buttons {
      flex-direction: column;
    }
    
    .external-button {
      width: 100%;
    }
  }
</style>