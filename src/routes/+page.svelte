<!-- Main component (+page.svelte) -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  import { topics } from '$lib/data/topics.js';
  import TopicExplorer from '$lib/components/TopicExplorer.svelte';
  import SelectionPanel from '$lib/components/SelectionPanel.svelte';
  import ResultsSection from '$lib/components/ResultsSection.svelte';
  import WorkspaceView from '$lib/components/WorkspaceSection.svelte';
  import ProgressIndicator from '$lib/components/ProgressIndicator.svelte';
  import Carousel from '$lib/components/Carousel.svelte';
  import { browser } from '$app/environment';

  // Create reactive variables
  let recommendedTopics = [];
  let selectedTopic = '';
  let pinnedTopics = [];
  let customTopic = '';
  let useCustomTopic = false;
  let selectedGrades = [];
  let submitting = false;
  let regenerating = false;
  let results = null;
  let error = '';
  let submissionError = '';
  let additionalGuidance = '';
  let customPrompt = '';

  // Track suggested prompts to avoid duplicates
  let suggestedPrompts = [];

  // Animation control variables
  let animateSelection = false;
  let animationTimeout = null;

  // Carousel control
  let currentView = 'selection'; // 'selection', 'results', or 'workspace'
  let showTooltip = false;
  let showLeftArrowTooltip = false;
  let showRightArrowTooltip = false;

  // Workspace variables
  let selectedPromptCard = null;

  // Get random topics from the full list, keeping any pinned topics
  // This maintains a stable order and doesn't reorder based on pin status
  function getRandomTopics() {
    const availableTopics = topics.filter(topic => !pinnedTopics.includes(topic));
    const numNewTopics = Math.max(0, 4 - pinnedTopics.length);
    const shuffled = [...availableTopics].sort(() => 0.5 - Math.random());
    const newTopics = shuffled.slice(0, numNewTopics);
    
    // Create a balanced array with 4 topics total
    // Don't put pinned topics first - just create a new array of 4 total topics
    return numNewTopics === 4 ? newTopics : 
           [...newTopics, ...pinnedTopics].slice(0, 4);
  }

  // Initialize on component mount
  onMount(() => {
    recommendedTopics = getRandomTopics();
    // Add event listener for keyboard navigation
    if (browser) {
      window.addEventListener('keydown', handleKeyNavigation);
    }
  });

  // Cleanup on component destroy
  onDestroy(() => {
    if (browser) {
      window.removeEventListener('keydown', handleKeyNavigation);
    }
  });

  // Handle keyboard navigation
  function handleKeyNavigation(event) {
    // Ignore if user is typing in an input field or textarea
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    // Prevent navigation during server requests
    if (submitting || regenerating) {
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        if (canGoLeft) {
          navigateLeft();
        }
        break;
      case 'ArrowRight':
        if (canGoRight && !isAtEnd) {
          navigateRight();
        }
        break;
    }
  }

  // Updated refreshTopicRecommendations function to add topics back to a total of 4
  function refreshTopicRecommendations() {
    // Calculate how many new topics we need to add to reach 4 total
    const currentTopicsCount = recommendedTopics.length;
    const numTopicsToAdd = Math.max(0, 4 - currentTopicsCount);
    
    // If we already have 4 or more topics, just shuffle the unpinned ones
    if (numTopicsToAdd <= 0) {
      // Find which topics are not pinned
      const unpinnedTopics = recommendedTopics.filter(topic => !pinnedTopics.includes(topic));
      
      // Get available topics not already in recommendedTopics
      const availableTopics = topics.filter(topic => 
        !recommendedTopics.includes(topic) && !pinnedTopics.includes(topic)
      );
      
      // Create shuffled replacement topics
      const shuffled = [...availableTopics].sort(() => 0.5 - Math.random());
      
      // Replace unpinned topics with new ones, keeping the same positions
      let newTopics = [];
      let replacementIndex = 0;
      
      for (let i = 0; i < recommendedTopics.length; i++) {
        const topic = recommendedTopics[i];
        if (pinnedTopics.includes(topic)) {
          // Keep pinned topics
          newTopics.push(topic);
        } else if (replacementIndex < shuffled.length) {
          // Replace unpinned topics with new ones
          newTopics.push(shuffled[replacementIndex]);
          replacementIndex++;
        } else {
          // If we run out of new topics, keep the old ones
          newTopics.push(topic);
        }
      }
      
      recommendedTopics = newTopics;
    } 
    // We need to add new topics to reach 4 total
    else {
      // Get available topics not already in recommendedTopics
      const availableTopics = topics.filter(topic => 
        !recommendedTopics.includes(topic) && !pinnedTopics.includes(topic)
      );
      
      // Shuffle and select the needed number of new topics
      const shuffled = [...availableTopics].sort(() => 0.5 - Math.random());
      const newTopics = shuffled.slice(0, numTopicsToAdd);
      
      // Add the new topics to the end of recommendedTopics
      recommendedTopics = [...recommendedTopics, ...newTopics];
    }
    
    console.log(`Refreshed topics: ${recommendedTopics.join(', ')}`);
  }

  // Function to trigger animation
  function triggerAnimation() {
    if (animationTimeout) clearTimeout(animationTimeout);
    animateSelection = false;
    setTimeout(() => {
      animateSelection = true;
      animationTimeout = setTimeout(() => (animateSelection = false), 1500);
    }, 0);
  }

  // Submit the form to get recommendations
  async function submitSelection() {
    const finalTopic = useCustomTopic ? customTopic : selectedTopic;
    if (!finalTopic || selectedGrades.length === 0) {
      error = 'Please select a topic and grade level';
      return;
    }
    error = '';
    submissionError = '';
    submitting = true;
    
    // Clear tooltips when submitting
    showLeftArrowTooltip = false;
    showRightArrowTooltip = false;
    showTooltip = false;
    
    try {
      const payload = { topic: finalTopic, grades: selectedGrades, guidance: additionalGuidance };
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to get recommendations');
      results = await response.json();
      
      // Track the suggested prompts to avoid duplicates
      if (results && results.subtopics) {
        suggestedPrompts = [...results.subtopics.map(subtopic => subtopic.title)];
      }
      
      console.log('API Response:', results); // Debug log
      // Automatically switch to results view when data is loaded
      currentView = 'results';
    } catch (err) {
      console.error('API Error:', err); // Debug log
      submissionError = err.message;
      
      // Show an error message to the user
      results = { 
        subtopics: [{
          title: "Error Generating Prompts",
          description: `There was a problem generating prompts: ${err.message}. Please try again or select a different topic.`
        }]
      };
      
      currentView = 'results';
    } finally {
      submitting = false;
      // Clear tooltips when submitting is done
      showLeftArrowTooltip = false;
      showRightArrowTooltip = false;
      showTooltip = false;
    }
  }

  // Function to regenerate prompt ideas making a real API call
  async function regeneratePrompts() {
    if (regenerating) return;
    
    const finalTopic = useCustomTopic ? customTopic : selectedTopic;
    if (!finalTopic || selectedGrades.length === 0) return;
    
    regenerating = true;
    
    try {
      // Create payload with exclusion list to avoid duplicates
      const payload = {
        topic: finalTopic,
        grades: selectedGrades,
        guidance: additionalGuidance,
        exclude: suggestedPrompts // Pass previously suggested prompts to avoid duplicates
      };
      
      console.log('Regenerating prompts with:', payload);
      
      // Make a real API call to generate new prompts
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      // Get the new prompts
      const newResults = await response.json();
      
      // Track the new prompts to avoid future duplicates
      if (newResults && newResults.subtopics) {
        const newPromptTitles = newResults.subtopics.map(subtopic => subtopic.title);
        suggestedPrompts = [...suggestedPrompts, ...newPromptTitles];
        
        // Update the results with new subtopics
        results = newResults;
      } else {
        throw new Error('Invalid response format from API');
      }
      
    } catch (err) {
      console.error('Regeneration Error:', err);
      
      // Create a simple error message for the user
      results = { 
        subtopics: [{
          title: "Error Generating Prompts",
          description: `There was a problem generating new prompts: ${err.message}. Please try again or select a different topic.`
        }]
      };
    } finally {
      regenerating = false;
    }
  }

  // Handle topic selection from child components
  function handleTopicSelection(event) {
    const topic = event.detail.topic;
    if (selectedTopic === topic) {
      return; // Do nothing if the topic is already selected
    }
    selectedTopic = topic;
    useCustomTopic = false;
    triggerAnimation();
  }

  // Handle custom topic selection
  function handleCustomTopicSelection(event) {
    customTopic = event.detail.topic;
    if (customTopic.trim()) {
      useCustomTopic = true;
      selectedTopic = '';
      triggerAnimation();
    }
  }

  // Handle pin toggle from child component
  function handlePinToggle(event) {
    const topic = event.detail.topic;
    if (pinnedTopics.includes(topic)) {
      pinnedTopics = pinnedTopics.filter(t => t !== topic);
    } else {
      if (pinnedTopics.length < 5) {
        pinnedTopics = [...pinnedTopics, topic];
      } else {
        error = 'You can pin up to 5 topics. Unpin some to add new ones.';
        setTimeout(() => (error = ''), 3000);
      }
    }
  }

  // Updated handleTopicDeletion function that removes topics without replacing them
  function handleTopicDeletion(event) {
    const topic = event.detail.topic;
    
    // Update pinnedTopics array if the deleted topic was pinned
    if (pinnedTopics.includes(topic)) {
      pinnedTopics = pinnedTopics.filter(t => t !== topic);
    }
    
    // Update selectedTopic if it was the deleted topic
    if (selectedTopic === topic) {
      selectedTopic = '';
    }
    
    // Simply remove the topic without replacing it
    recommendedTopics = recommendedTopics.filter(t => t !== topic);
    
    // No need to add any new topics - just remove this one
    console.log(`Deleted topic: ${topic}`);
    console.log(`Current recommendedTopics: ${recommendedTopics.join(', ')}`);
  }

  // Handle grade selection from child component
  function handleGradeSelection(event) {
    const gradeId = event.detail.gradeId;
    if (selectedGrades.includes(gradeId)) {
      selectedGrades = selectedGrades.filter(id => id !== gradeId);
    } else {
      selectedGrades = [gradeId];
    }
  }

  // Handle additional guidance changes
  function handleGuidanceChange(event) {
    additionalGuidance = event.detail.guidance;
  }

  // Handle prompt card selection
  function handlePromptCardSelection(promptCard) {
    selectedPromptCard = promptCard;
    currentView = 'workspace';
    clearAllTooltips();
  }

  // Create and use a custom prompt
  function handleCreateCustomPrompt() {
    if (!customPrompt.trim()) {
      return;
    }
    
    // Create a custom prompt card with the user's input
    selectedPromptCard = {
      title: "Custom Prompt",
      description: customPrompt,
      objectives: [],
      reading_materials: []
    };
    
    // Navigate to workspace with the custom prompt
    currentView = 'workspace';
    clearAllTooltips();
  }

  // Clear all tooltips
  function clearAllTooltips() {
    showTooltip = false;
    showLeftArrowTooltip = false;
    showRightArrowTooltip = false;
  }

  // Navigation functions
  function goToSelection() {
    currentView = 'selection';
    clearAllTooltips();
  }

  function goToResults() {
    if (results) {
      currentView = 'results';
      clearAllTooltips();
    } else {
      showTooltip = true;
      setTimeout(() => showTooltip = false, 2000);
    }
  }

  function goToWorkspace() {
    if (selectedPromptCard) {
      currentView = 'workspace';
      clearAllTooltips();
    }
  }

  // Get slide index for transform calculation
  function getSlideIndex() {
    switch (currentView) {
      case 'selection': return 0;
      case 'results': return 1;
      case 'workspace': return 2;
      default: return 0;
    }
  }

  // Get navigation button states
  $: canGoLeft = currentView !== 'selection' && !submitting && !regenerating;
  $: canGoRight = ((currentView === 'selection' && results) || 
                  (currentView === 'results' && selectedPromptCard)) && 
                  !submitting && !regenerating;
  $: isAtEnd = currentView === 'workspace';

  // Navigation with context awareness
  function navigateLeft() {
    if (submitting || regenerating) return;
    
    if (currentView === 'results') {
      currentView = 'selection';
    } else if (currentView === 'workspace') {
      currentView = 'results';
    }
    clearAllTooltips();
  }

  function navigateRight() {
    if (submitting || regenerating) return;
    
    if (currentView === 'selection' && results) {
      currentView = 'results';
      clearAllTooltips();
    } else if (currentView === 'results' && selectedPromptCard) {
      currentView = 'workspace';
      clearAllTooltips();
    } else if (currentView === 'selection' && !results) {
      showTooltip = true;
      setTimeout(() => showTooltip = false, 2000);
    }
  }

  // Progress indicator navigation
  function navigateToView(view) {
    if (submitting || regenerating) return;
    
    if (view === 'selection') {
      currentView = 'selection';
      clearAllTooltips();
    } else if (view === 'results') {
      if (results) {
        currentView = 'results';
        clearAllTooltips();
      } else {
        showTooltip = true;
        setTimeout(() => showTooltip = false, 2000);
      }
    } else if (view === 'workspace') {
      if (selectedPromptCard) {
        currentView = 'workspace';
        clearAllTooltips();
      }
    }
  }

  // Check if view is accessible
  function isViewAccessible(view) {
    if (submitting || regenerating) return false;
    if (view === 'selection') return true;
    if (view === 'results') return !!results;
    if (view === 'workspace') return !!selectedPromptCard;
    return false;
  }

  // Get disabled tooltip text
  function getArrowTooltip(direction) {
    if (submitting) return 'Please wait...';
    if (regenerating) return 'Generating new prompts...';
    
    if (direction === 'left') {
      if (currentView === 'selection') return 'Already at the beginning';
      return '';
    }
    
    if (direction === 'right') {
      if (isAtEnd) return 'Already at the end';
      if (currentView === 'selection' && !results) return 'Please submit your selection first';
      if (currentView === 'results' && !selectedPromptCard) return 'Please select a prompt first';
      return '';
    }
    
    return '';
  }

  // Clear tooltips when submitting state changes
  $: if (!submitting && !regenerating) {
    clearAllTooltips();
  }
  // Logout function
  function handleLogout() {
    window.location.href = '/logout';
  }

</script>

<div class="essay-recommender">
  <div class="header-container">
    <h1>Benchmarks Prompt Loom</h1>
    <button class="logout-button" on:click={handleLogout}>
      Logout
    </button>
  </div>

  <!-- Progress Indicator Component -->
  <ProgressIndicator 
    {currentView}
    {submitting}
    {regenerating}
    {isViewAccessible}
    on:navigate={e => navigateToView(e.detail.view)}
  />

  <!-- Carousel Component -->
  <Carousel
    {currentView}
    {canGoLeft}
    {canGoRight}
    {isAtEnd}
    {getSlideIndex}
    {showLeftArrowTooltip}
    {showRightArrowTooltip}
    {showTooltip}
    {getArrowTooltip}
    {submitting}
    {regenerating}
    on:navigateLeft={() => navigateLeft()}
    on:navigateRight={() => navigateRight()}
  >
    <!-- Selection View (Slide 1) -->
    <div class="slide">
      <div class="slide-content">
        <div class="recommender-container">
          <!-- Topic Explorer Side -->
          <TopicExplorer 
            {recommendedTopics}
            {pinnedTopics}
            {selectedTopic}
            {error}
            on:refreshTopics={refreshTopicRecommendations}
            on:selectTopic={handleTopicSelection}
            on:pinTopic={handlePinToggle}
            on:deleteTopic={handleTopicDeletion}
            on:customTopic={handleCustomTopicSelection}
          />
          
          <!-- Selection Panel Side -->
          <SelectionPanel
            {selectedTopic}
            {customTopic}
            {useCustomTopic}
            {selectedGrades}
            {submitting}
            {submissionError}
            {animateSelection}
            {additionalGuidance}
            on:gradeSelection={handleGradeSelection}
            on:guidanceChange={handleGuidanceChange}
            on:submit={submitSelection}
          />
        </div>
      </div>
    </div>
    
    <!-- Results View (Slide 2) -->
    <div class="slide">
      <div class="slide-content">
        {#if results}
          <ResultsSection
            {results}
            {useCustomTopic}
            {customTopic}
            {selectedTopic}
            {regenerating}
            customPrompt={customPrompt}
            on:regeneratePrompts={regeneratePrompts}
            on:selectPrompt={e => handlePromptCardSelection(e.detail.promptCard)}
            on:createCustomPrompt={handleCreateCustomPrompt}
            on:customPromptChange={e => customPrompt = e.detail.customPrompt}
          />
        {:else}
          <div class="empty-results">
            Please complete your selection to see results
          </div>
        {/if}
      </div>
    </div>

    <!-- Workspace View (Slide 3) -->
    <div class="slide">
      <div class="slide-content">
        {#if selectedPromptCard}
          <WorkspaceView
            {selectedPromptCard}
            {selectedTopic}
            {customTopic}
            {useCustomTopic}
            {selectedGrades}
            {additionalGuidance}
          />
        {:else}
          <div class="empty-results">
            Please select a prompt card to view details
          </div>
        {/if}
      </div>
    </div>
  </Carousel>
</div>

<style>
:global(html) {
    zoom: 85%;
    -moz-transform: scale(0.8);
    -moz-transform-origin: 0 0;
  }
  
  .essay-recommender {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #333;
  }

  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    color: #222;
  }

  .logout-button {
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .logout-button:hover {
    background-color: #d32f2f;
  }

  .recommender-container {
    display: flex;
    gap: 20px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
    padding: 20px;
    box-sizing: border-box;
    max-width: 1000px;
    width: 100%;
    margin: 0 auto;
    min-height: 500px;
  }

  .empty-results {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 500px;
    background: #f8f9fa;
    border-radius: 12px;
    color: #666;
    font-size: 18px;
  }

  .slide {
    width: 33.333%;
    flex-shrink: 0;
    box-sizing: border-box;
    padding: 0 20px 20px;
  }

  .slide-content {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
  }

  /* Media queries for responsive design */
  @media (max-width: 900px) {
    .recommender-container {
      flex-direction: column;
      gap: 15px;
    }
  }

  @media (max-width: 600px) {
    h1 {
      font-size: 24px;
    }
  }
</style>