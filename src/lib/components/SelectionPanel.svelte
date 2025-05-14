<!-- components/SelectionPanel.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  
  // Props
  export let selectedTopic = '';
  export let customTopic = '';
  export let useCustomTopic = false;
  export let selectedGrades = [];
  export let submitting = false;
  export let submissionError = '';
  export let animateSelection = false;
  export let additionalGuidance = '';

  // Available grade levels
  const gradeOptions = [
    { id: 'grade3', label: '3' },
    { id: 'grade4', label: '4' },
    { id: 'grade5', label: '5' },
    { id: 'grade6', label: '6' },
    { id: 'grade7', label: '7' },
    { id: 'grade8', label: '8' },
    { id: 'grade9', label: '9' },
    { id: 'grade10', label: '10' },
    { id: 'grade11', label: '11' },
    { id: 'grade12', label: '12' }
  ];

  const dispatch = createEventDispatcher();

  // Handle grade selection
  function selectGrade(gradeId) {
    dispatch('gradeSelection', { gradeId });
  }

  // Handle submit button click
  function handleSubmit() {
    dispatch('submit');
  }

  // Handle guidance text changes
  function handleGuidanceChange(e) {
    dispatch('guidanceChange', { guidance: e.target.value });
  }
</script>

<div class="selection-container">
  <div class="current-selection">
    <h2>Your Selection</h2>
    <!-- Using the reactively bound animateSelection value -->
    <div class="selected-topic-display {animateSelection ? 'green-glow-animation' : ''}">
      {#if selectedTopic}
        <div class="chosen-topic">
          <span class="topic-label">Topic:</span>
          <span class="topic-value">{selectedTopic}</span>
        </div>
      {:else if useCustomTopic && customTopic}
        <div class="chosen-topic">
          <span class="topic-label">Topic:</span>
          <span class="topic-value custom-value">{customTopic}</span>
        </div>
      {:else}
        <div class="select-prompt">
          <span>👈 Choose a topic from the left</span>
        </div>
      {/if}
    </div>
  </div>
  
  <!-- Additional guidance input -->
  <div class="additional-guidance">
    <h3>Additional Guidance (optional)</h3>
    <textarea 
      placeholder="Provide additional details or narrow down your topic..." 
      value={additionalGuidance}
      on:input={handleGuidanceChange}
      class="guidance-textarea"
      maxlength="150"
    ></textarea>
    <div class="character-count">
      {additionalGuidance.length}/150 characters
    </div>
  </div>
  
  <div class="grade-selector">
    <h2>Grade Level</h2>
    <div class="grade-buttons">
      {#each gradeOptions as grade}
        <button 
          class="grade-button {selectedGrades.includes(grade.id) ? 'selected' : ''}"
          on:click={() => selectGrade(grade.id)}
        >
          {grade.label}
        </button>
      {/each}
    </div>
  </div>
  
  <button 
    class="submit-button {(selectedTopic || (useCustomTopic && customTopic)) && selectedGrades.length > 0 ? 'ready' : ''}" 
    on:click={handleSubmit}
    disabled={submitting || (!selectedTopic && !(useCustomTopic && customTopic)) || selectedGrades.length === 0}
  >
    {#if submitting}
      <span class="loading-spinner"></span> Getting Ideas...
    {:else if (selectedTopic || (useCustomTopic && customTopic)) && selectedGrades.length > 0}
      Get Essay Ideas
    {:else}
      Select topic and grade
    {/if}
  </button>

  <!-- Error message for submission failures -->
  {#if submissionError}
    <div class="submission-error-message">
      {submissionError}
    </div>
  {/if}
</div>

<style>
  .selection-container {
    flex: 2;
    background-color: #f8f9fa;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
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
  
  .selected-topic-display {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    min-height: 60px;
    display: flex;
    align-items: center;
    border: 1px solid #dadce0;
    margin-bottom: 30px;
  }

  /* Green glow animation */
  .green-glow-animation {
    animation: greenGlow 1.5s ease-in-out;
    animation-fill-mode: forwards;
  }

  @keyframes greenGlow {
    0% {
      box-shadow: 0 0 0 rgba(0, 200, 0, 0);
      border-color: #dadce0;
    }
    15% {
      box-shadow: 0 0 20px rgba(0, 200, 0, 0.9);
      border-color: rgba(0, 200, 0, 0.9);
    }
    50% {
      box-shadow: 0 0 15px rgba(0, 200, 0, 0.7);
      border-color: rgba(0, 200, 0, 0.7);
    }
    100% {
      box-shadow: 0 0 0 rgba(0, 200, 0, 0);
      border-color: #dadce0;
    }
  }
  
  .chosen-topic {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }
  
  .topic-label {
    font-weight: 500;
    color: #5f6368;
    font-size: 15px;
  }
  
  .topic-value {
    font-weight: 600;
    font-size: 18px;
    color: #202124;
  }
  
  .custom-value {
    color: #1a73e8;
  }
  
  .select-prompt {
    color: #9aa0a6;
    font-style: italic;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
  }
  
  /* Additional guidance styles */
  .additional-guidance {
    margin-top: 20px;
    margin-bottom: 20px;
  }

  .guidance-textarea {
    width: 100%;
    min-height: 80px;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #dadce0;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    background-color: white;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    box-sizing: border-box;
  }

  .guidance-textarea:focus {
    outline: none;
    border-color: #1a73e8;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.2);
  }

  /* Character count */
  .character-count {
    margin-top: 5px;
    font-size: 12px;
    color: #666;
    text-align: right;
  }
  
  /* Grade selector styles */
  .grade-selector {
    margin-bottom: 20px;
  }
  
  .grade-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }
  
  .grade-button {
    padding: 10px 0;
    width: 60px;
    border-radius: 4px;
    background-color: white;
    border: 1px solid #dadce0;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 16px;
    font-weight: 500;
    color: #5f6368;
  }
  
  .grade-button:hover {
    background-color: #f6fafe;
    border-color: #1a73e8;
  }
  
  .grade-button.selected {
    background-color: #1a73e8;
    border-color: #1a73e8;
    color: white;
  }
  
  /* Submit button styles */
  .submit-button {
    width: 100%;
    padding: 14px;
    border-radius: 4px;
    border: none;
    background-color: #f1f3f4;
    color: #5f6368;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .submit-button.ready {
    background-color: #1a73e8;
    color: white;
  }
  
  .submit-button.ready:hover {
    background-color: #1765cc;
  }
  
  .loading-spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .submission-error-message {
    margin-top: 10px;
    padding: 10px 15px;
    background-color: #fff2f0;
    color: #e53935;
    border: 1px solid #ffcdd2;
    border-radius: 8px;
    font-size: 14px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
  
  /* Media query for smaller screens */
  @media (max-width: 600px) {
    .grade-buttons {
      grid-template-columns: repeat(3, 1fr); /* Further reduce grid columns */
    }
  }
</style>