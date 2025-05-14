<!-- components/TopicExplorer.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { topics } from '$lib/data/topics.js';
  
  // Props
  export let recommendedTopics = [];
  export let pinnedTopics = [];
  export let selectedTopic = '';
  export let error = '';
  
  // Local state
  let searchTerm = '';
  let customTopic = '';
  let showDropdown = false;
  let searchedTopics = []; // Array to hold up to three searched topics
  let highlightedIndex = -1; // Track the currently highlighted dropdown item
  let dropdownError = ''; // Track error for searched topics

  // Create event dispatcher
  const dispatch = createEventDispatcher();
  
  // Handle search term input and manage dropdown
  function handleSearchFocus() {
    showDropdown = true;
  }
  
  function handleSearchBlur() {
    // Small delay to allow for click events on the dropdown items
    setTimeout(() => {
      showDropdown = false;
    }, 200);
  }
  
  function handleSearchChange(e) {
    searchTerm = e.target.value;
    showDropdown = true; // Keep dropdown open
    highlightedIndex = -1; // Reset the highlighted index
  }
  
  function handleSearchKeydown(e) {
    if (showDropdown && filteredTopics.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlightedIndex = (highlightedIndex + 1) % filteredTopics.length;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlightedIndex = (highlightedIndex - 1 + filteredTopics.length) % filteredTopics.length;
      } else if (e.key === 'Enter' && highlightedIndex >= 0) {
        e.preventDefault();
        selectFromDropdown(filteredTopics[highlightedIndex]);
      }
    }
  }
  
  // Select a topic from the dropdown  
  function selectFromDropdown(topic) {
    if (searchedTopics.length >= 3) {
      // Update to show error directly in the component
      dropdownError = 'You can add up to 3 topics. Please delete one before adding another.';
      // Show the error for 3 seconds then clear it
      setTimeout(() => (dropdownError = ''), 3000);
      return;
    }
    
    if (!searchedTopics.includes(topic)) {
      searchedTopics = [...searchedTopics, topic]; // Add the topic to the list
    }
    searchTerm = ''; // Clear the search term
    // Don't close the dropdown to allow for selecting multiple topics
    // showDropdown = false; // Keep dropdown open
  }

  // Function to delete a specific searched topic
  function deleteSearchedTopic(topic) {
    searchedTopics = searchedTopics.filter(t => t !== topic); // Remove the topic from the list
  }

  // Handle custom topic input
  function handleCustomTopicChange(e) {
    customTopic = e.target.value;
  }
  
  // Set to use custom topic
  function setUseCustomTopic() {
    if (customTopic.trim()) {
      dispatch('customTopic', { topic: customTopic });
    }
  }

  // Select topic
  function selectTopic(topic) {
    dispatch('selectTopic', { topic });
  }
  
  // Toggle pin topic
  function togglePinTopic(topic) {
    dispatch('pinTopic', { topic });
  }
  
  // Delete topic
  function deleteTopic(topic) {
    dispatch('deleteTopic', { topic });
  }

  // Refresh topics
  function refreshTopics() {
    dispatch('refreshTopics');
  }

  // Select searched topic
  function selectSearchedTopic(topic) {
    dispatch('selectTopic', { topic });
  }

  // Filter topics for dropdown search
  $: filteredTopics = searchTerm 
    ? sortFilteredTopics(topics.filter(topic => {
        // Check if any word in the topic starts with the search term
        const words = topic.toLowerCase().split(' ');
        const searchLower = searchTerm.toLowerCase();
        
        return words.some(word => word.startsWith(searchLower));
      }), searchTerm)
    : topics; // Show all topics when no search term
    
  // Custom sort function to prioritize first-word matches
  function sortFilteredTopics(topics, searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    
    // Separate topics into those where first word starts with search term and others
    const firstWordMatches = [];
    const otherMatches = [];
    
    topics.forEach(topic => {
      const firstWord = topic.toLowerCase().split(' ')[0];
      if (firstWord.startsWith(searchLower)) {
        firstWordMatches.push(topic);
      } else {
        otherMatches.push(topic);
      }
    });
    
    // Sort each group alphabetically
    firstWordMatches.sort();
    otherMatches.sort();
    
    // Combine the groups with first-word matches first
    return [...firstWordMatches, ...otherMatches];
  }
  
  // CRITICAL FIX: Use recommendedTopics directly without reordering based on pinned status
  $: displayedTopics = searchTerm.length === 0
    ? recommendedTopics // Use recommendedTopics directly without reordering
    : filteredTopics.slice(0, 10);
</script>

<div class="topics-container">
  <h2>Explore Topics</h2>
  <h3 class="section-title">TOPIC SEARCH</h3>

  <div class="explore-container">
    <div class="action-help">
      <div class="action-item">
        <span class="action-icon">🔍</span> 
        <span>Click on search field to browse all topics</span>
      </div>
    </div>
    <div class="search-and-refresh">
      <div class="search-input-container">
        <input 
          type="text" 
          placeholder="Type here to search for topic ideas..." 
          value={searchTerm}
          on:input={handleSearchChange}
          on:focus={handleSearchFocus}
          on:blur={handleSearchBlur}
          on:keydown={handleSearchKeydown}
        />
        {#if showDropdown}
          <div class="search-dropdown">
            {#if searchTerm.length === 0}
              <!-- Show browse by letter and random selections when no search term -->
              <div class="dropdown-section-header">Browse by First Letter</div>
              <div class="alphabet-filters">
                {#each 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('') as letter}
                  <button 
                    class="alphabet-filter-btn"
                    on:mousedown={(e) => {
                      e.preventDefault(); // Prevent dropdown from closing
                      searchTerm = letter;
                    }}
                  >
                    {letter}
                  </button>
                {/each}
              </div>
              
              <div class="dropdown-section-header">Random Selections</div>
              {#each [...topics].sort(() => Math.random() - 0.5).slice(0, 5) as topic, i}
                <div 
                  class="dropdown-item {highlightedIndex === i ? 'highlighted' : ''} {searchedTopics.includes(topic) ? 'selected' : ''}"
                  on:mousedown={() => selectFromDropdown(topic)}
                >
                  <span>{topic}</span>
                  {#if pinnedTopics.includes(topic)}
                    <span class="dropdown-pin-icon">📌</span>
                  {/if}
                </div>
              {/each}
              
              <div class="dropdown-section-header">All Topics ({topics.length})</div>
              {#each topics as topic, i}
                <div 
                  class="dropdown-item {highlightedIndex === i + 5 ? 'highlighted' : ''} {searchedTopics.includes(topic) ? 'selected' : ''}"
                  on:mousedown={() => selectFromDropdown(topic)}
                >
                  <span>{topic}</span>
                  {#if pinnedTopics.includes(topic)}
                    <span class="dropdown-pin-icon">📌</span>
                  {/if}
                </div>
              {/each}
            {:else if filteredTopics.length > 0}
              <!-- Show filtered results when searching -->
              {#each filteredTopics.slice(0, 20) as topic, i}
                <div 
                  class="dropdown-item {highlightedIndex === i ? 'highlighted' : ''} {searchedTopics.includes(topic) ? 'selected' : ''}"
                  on:mousedown={() => selectFromDropdown(topic)}
                >
                  <span>{topic}</span>
                  {#if pinnedTopics.includes(topic)}
                    <span class="dropdown-pin-icon">📌</span>
                  {/if}
                </div>
              {/each}
            {:else}
              <!-- No results found message -->
              <div class="dropdown-no-results">No matching topics found</div>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <!-- Error message for searched topics -->
    {#if dropdownError}
      <div class="dropdown-error">
        {dropdownError}
      </div>
    {/if}

    <!-- Display the searched topics -->
    {#if searchedTopics.length > 0}
      <div class="searched-topics-container">
        {#each searchedTopics as topic}
          <div 
            class="searched-topic-card {selectedTopic === topic ? 'selected' : ''}" 
            on:click={() => selectSearchedTopic(topic)}
          >
            <span class="searched-topic-text">{topic}</span>
            <button 
              class="delete-button" 
              on:click={(e) => { e.stopPropagation(); deleteSearchedTopic(topic); }} 
              title="Delete this topic"
            >
              <span class="delete-icon">×</span>
            </button>
          </div>
        {/each}
      </div>
    {/if}
     
    
    <!-- Notification area -->
    <div class="notification-area">
      {#if error}
        <div class="notification-message">
          {error}
        </div>
      {/if}
    </div>
  </div>
  
  <div class="topic-section">
    <div class="header-and-refresh">
      <h3 class="section-title">TOPIC IDEAS</h3>
      <button class="refresh-button" on:click={refreshTopics} title="Show new topics">
        <span class="refresh-icon">⟳</span>
        <span class="refresh-text">New Ideas</span>
      </button>
    </div>
    <div class="action-item">
      <span class="action-icon">📌</span> 
      <span>Pin topics you like to save them</span>
    </div>

    <div class="topic-cards-container">
      <!-- CRITICAL FIX: Preserve the exact order from recommendedTopics without any reordering -->
      {#each displayedTopics as topic, index}
        <div 
          class="topic-card-wrapper {selectedTopic === topic ? 'selected' : ''}" 
          on:click={() => selectTopic(topic)}
        >
          <div class="topic-card">
            <span class="topic-text">{topic}</span>
          </div>
          <div class="topic-actions">
            <button 
              class="pin-button {pinnedTopics.includes(topic) ? 'pinned' : ''}"
              on:click={(e) => { e.stopPropagation(); togglePinTopic(topic); }}
              title={pinnedTopics.includes(topic) ? "Unpin this topic" : "Pin this topic"}
            >
              <span class="pin-icon">📌</span>
            </button>
            <button 
              class="delete-button"
              on:click={(e) => { e.stopPropagation(); deleteTopic(topic); }}
              title="Delete this topic"
            >
              <span class="delete-icon">×</span>
            </button>
          </div>
        </div>
      {/each}
    </div>
  </div>
  
  <div class="custom-topic-section">
    <h3 class="section-title">ADD YOUR OWN TOPIC</h3>
    <div class="custom-input-container">
      <input 
        type="text" 
        class="custom-topic-input"
        placeholder="Type your own topic here..." 
        bind:value={customTopic}
        on:input={handleCustomTopicChange}
      />
      {#if customTopic}
        <button 
          class="use-custom-button"
          on:click={setUseCustomTopic}
          title="Use this as your topic"
        >
          Use This Topic
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .topics-container {
    flex: 3;
    background-color: #f8f9fa;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
    max-width: 100%;
  }
  
  h2 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #1a1a1a;
  }
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #222;
  }
  
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #5f6368;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .explore-container {
    margin-bottom: 20px;
  }
  
  .header-and-refresh {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .search-and-refresh {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
  }
  
  .search-input-container {
    position: relative;
    flex: 1;
  }
  
  .search-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 10;
    background-color: white;
    border-radius: 8px;
    max-height: 400px;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    margin-top: 5px;
    border: 1px solid #e0e0e0;
    max-width: 100%; /* ensures it doesn't overflow its container */
    width: 100%;     /* make it match the input width */
    box-sizing: border-box; /* padding included in width */
  }
  
  .dropdown-section-header {
    font-weight: 600;
    padding: 10px 16px;
    background-color: #f1f3f4;
    color: #5f6368;
    font-size: 14px;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .alphabet-filters {
    display: flex;
    flex-wrap: wrap;
    padding: 10px;
    gap: 5px;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .alphabet-filter-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    background-color: #f1f3f4;
    border: 1px solid #dadce0;
    cursor: pointer;
    font-weight: 600;
    color: #1a73e8;
  }
  
  .alphabet-filter-btn:hover {
    background-color: #e8f0fe;
    border-color: #1a73e8;
  }
  
  .dropdown-item {
    padding: 12px 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .dropdown-item:hover {
    background-color: #f5f9ff;
  }
  
  .dropdown-item.selected {
    background-color: #e3f2fd;
    color: #1976d2;
    font-weight: 500;
  }
  
  .dropdown-item.pinned {
    background-color: #f1f9ee;
  }
  
  .dropdown-item.selected.pinned {
    background-color: #e1f5e0;
  }
  
  .dropdown-item.highlighted {
    background-color: #e3f2fd;
    color: #1976d2;
  }
  
  .dropdown-pin-icon {
    padding: 15px;
    text-align: center;
    color: #888;
    font-style: italic;
  }
  
  .dropdown-no-results {
    padding: 15px;
    text-align: center;
    color: #888;
    font-style: italic;
  }
  
  .dropdown-error {
    margin-top: 8px;
    padding: 8px 12px;
    background-color: #fff2f0;
    color: #e53935;
    border-radius: 6px;
    font-size: 14px;
    border: 1px solid #ffcdd2;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .search-input-container input {
    width: 100%;
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid #dde0e4;
    font-size: 16px;
    background-color: white;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.04);
    box-sizing: border-box;
  }
  
  .search-input-container input:focus {
    outline: none;
    border-color: #4c84ff;
    box-shadow: 0 0 0 3px rgba(76, 132, 255, 0.1);
  }
  
  .refresh-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 44px;
    padding: 0 16px;
    border-radius: 8px;
    border: 1px solid #dadce0;
    background-color: #e8f0fe;
    color: #4285f4;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  }
  
  .refresh-button:hover {
    background-color: #d2e3fc;
    border-color: #a8c7fa;
  }
  
  .refresh-icon {
    font-size: 26px;
  }

  .refresh-text {
    white-space: nowrap;
    display: inline; /* Ensure text is always visible */
  }
  
  .action-help {
    display: flex;
    gap: 15px;
    margin: 12px 0;
    font-size: 14px;
    color: #666;
  }
  
  .action-item {
    padding-bottom: 1.5vh;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .action-icon {
    font-size: 16px;
  }
  
  .topic-cards-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .topic-card-wrapper {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: white;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    transition: all 0.2s ease;
    cursor: pointer;
  }
  
  .topic-card-wrapper:hover {
    box-shadow: 0 3px 8px rgba(0,0,0,0.15);
  }
  
  .topic-card {
    flex: 1;
    cursor: pointer;
    border: none;
    background: none;
    box-shadow: none;
    padding: 0;
    margin: 0;
    text-align: left;
    min-width: auto;
  }
  
  .topic-actions {
    display: flex;
    gap: 5px;
  }
  
  .pin-button, .delete-button {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: #f1f3f4;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #5f6368;
  }
  
  .pin-button:hover {
    background-color: #e8eaed;
    transform: scale(1.1);
  }
  
  .delete-button:hover {
    background-color: #fce8e6;
    color: #d93025;
    transform: scale(1.1);
  }
  
  .pin-button.pinned {
    background-color: #e6f4ea;
    color: #0f9d58;
    border: 2px solid #0b8043; /* Dark green border */
  }
  
  .delete-icon, .pin-icon {
    font-size: 16px;
  }
  
  .custom-topic-section {
    margin-top: 30px;
    padding-top: 15px;
    border-top: 1px solid #dadce0;
  }
  
  .custom-input-container {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  
  .custom-topic-input {
    flex: 1;
    padding: 12px 15px;
    border-radius: 8px;
    border: 1px solid #dadce0;
    background-color: white;
    transition: all 0.2s ease;
    font-size: 14px;
  }
  
  .custom-topic-input:focus {
    outline: none;
    border-color: #1a73e8;
    box-shadow: 0 0 0 1px rgba(26, 115, 232, 0.15);
  }
  
  .use-custom-button {
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid #dadce0;
    background-color: #fff;
    color: #1a73e8;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .use-custom-button:hover {
    background-color: #f6fafe;
    border-color: #1a73e8;
  }
  
  .use-custom-button.selected {
    background-color: #e8f0fe;
    color: #1a73e8;
    border-color: #1a73e8;
  }
  
  .searched-topics-container {
    margin-top: 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .searched-topic-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: white;
    border-radius: 8px;
    padding: 10px 15px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .searched-topic-card:hover {
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  }

  .searched-topic-card.selected {
    border: 2px solid #1a73e8;
  }

  .searched-topic-card.selected .searched-topic-text {
    font-weight: bold;
    color: #1a73e8;
  }

  .searched-topic-text {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    margin-right: 10px; /* Add more space between the text and the "X" button */
  }

  .notification-area {
    height: 30px; /* Reserve space for the notification */
    margin-top: 10px;
  }

  .notification-message {
    background-color: #fff2f0;
    color: #e53935;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 14px;
    border: 1px solid #ffcdd2;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* Selected state styling */
  .selected {
    border: 2px solid #1a73e8; /* Blue outline for the card */
  }

  .selected .topic-text {
    font-weight: bold;
    color: #1a73e8; /* Blue bold text */
  }

  /* For smaller screens */
  @media (max-width: 900px) {
    .topics-container {
      max-width: 100%; /* Ensure containers take full width */
    }

    .topic-cards-container {
      grid-template-columns: repeat(1, 1fr); /* Single column for topics */
    }
  }
  
  @media (max-width: 600px) {
    .search-and-refresh {
      flex-direction: column; /* Stack search and refresh button */
      align-items: stretch; /* Ensure full width */
      gap: 10px; /* Add spacing between elements */
    }

    .search-input-container {
      width: 100%; /* Ensure search container takes full width */
    }

    .refresh-button {
      width: 100%; /* Full width for mobile */
      justify-content: center;
    }

    .refresh-text {
      display: inline; /* Ensure text is always visible */
    }

    .header-and-refresh {
      flex-direction: column; /* Stack header and button */
      align-items: stretch; /* Full width for button */
      gap: 10px;
    }

    .refresh-button {
      width: 100%; /* Full width for mobile */
    }
  }
</style>