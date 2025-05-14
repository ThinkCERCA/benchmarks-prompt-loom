<!-- ProgressIndicator.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  
  // Props
  export let currentView = 'selection';
  export let submitting = false;
  export let regenerating = false;
  export let isViewAccessible = (view) => true;
  
  // Event dispatcher
  const dispatch = createEventDispatcher();
  
  // Handle navigation click
  function navigateToView(view) {
    dispatch('navigate', { view });
  }
</script>

<div class="progress-indicator">
  <button 
    class="progress-step" 
    class:active={currentView === 'selection'}
    on:click={() => navigateToView('selection')}
    disabled={submitting || regenerating}
  >
    1. Select Topic & Grade
  </button>
  <button 
    class="progress-step" 
    class:active={currentView === 'results'}
    class:disabled={!isViewAccessible('results')}
    on:click={() => navigateToView('results')}
    disabled={!isViewAccessible('results')}
  >
    2. Choose Prompt
  </button>
  <button 
    class="progress-step" 
    class:active={currentView === 'workspace'}
    class:disabled={!isViewAccessible('workspace')}
    on:click={() => navigateToView('workspace')}
    disabled={!isViewAccessible('workspace')}
  >
    3. Workspace
  </button>
</div>

<style>
  .progress-indicator {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-bottom: 30px;
  }

  .progress-step {
    color: #9ca3af;
    font-size: 14px;
    position: relative;
    padding: 8px 16px;
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 6px;
  }

  .progress-step:hover:not(:disabled) {
    background: #f3f4f6;
    color: #6b7280;
  }

  .progress-step.active {
    color: #3b82f6;
    font-weight: 600;
  }

  .progress-step.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: #3b82f6;
  }

  .progress-step.disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .progress-step.disabled:hover {
    background: none;
    color: #9ca3af;
  }

  @media (max-width: 600px) {
    .progress-indicator {
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .progress-step.active::after {
      display: none;
    }
  }
</style>