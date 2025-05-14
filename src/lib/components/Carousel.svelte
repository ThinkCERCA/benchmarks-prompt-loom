<!-- Carousel.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  
  // Props
  export let currentView = 'selection';
  export let canGoLeft = false;
  export let canGoRight = false;
  export let isAtEnd = false;
  export let getSlideIndex = () => 0;
  export let showLeftArrowTooltip = false;
  export let showRightArrowTooltip = false;
  export let showTooltip = false;
  export let getArrowTooltip = (direction) => '';
  export let submitting = false;
  export let regenerating = false;
  
  // Event dispatcher
  const dispatch = createEventDispatcher();
  
  // Handle navigation
  function handleNavigateLeft() {
    dispatch('navigateLeft');
  }
  
  function handleNavigateRight() {
    dispatch('navigateRight');
  }
</script>

<div class="carousel-container">
  <!-- Left Navigation Arrow -->
  <div class="left-nav-wrapper">
    <button 
      class="nav-arrow left-arrow" 
      class:disabled={!canGoLeft}
      on:click={handleNavigateLeft}
      on:mouseenter={() => !canGoLeft && (showLeftArrowTooltip = true)}
      on:mouseleave={() => showLeftArrowTooltip = false}
      disabled={!canGoLeft}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>
    {#if showLeftArrowTooltip && !canGoLeft}
      <div class="arrow-tooltip left" transition:fade={{ duration: 200 }}>
        {getArrowTooltip('left')}
      </div>
    {/if}
  </div>

  <!-- Content Area -->
  <div class="content-area">
    <div class="slides-wrapper">
      <div class="slides-track" style="transform: translateX(-{getSlideIndex() * 33.333}%)">
        <slot></slot>
      </div>
    </div>
  </div>

  <!-- Right Navigation Arrow -->
  <div class="right-nav-wrapper">
    <button 
      class="nav-arrow right-arrow" 
      class:disabled={!canGoRight || isAtEnd}
      on:click={handleNavigateRight}
      on:mouseenter={() => (!canGoRight || isAtEnd) && (showRightArrowTooltip = true)}
      on:mouseleave={() => showRightArrowTooltip = false}
      disabled={!canGoRight || isAtEnd}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
    {#if showRightArrowTooltip && (!canGoRight || isAtEnd)}
      <div class="arrow-tooltip right" transition:fade={{ duration: 200 }}>
        {getArrowTooltip('right')}
      </div>
    {/if}
    {#if showTooltip}
      <div class="tooltip" transition:fade={{ duration: 200 }}>
        Please submit your selection first
      </div>
    {/if}
  </div>
</div>

<style>
  .carousel-container {
    display: flex;
    align-items: center;
    position: relative;
    margin-bottom: 30px;
    width: 100%;
  }

  .content-area {
    flex: 1;
    margin: 0 60px;
    position: relative;
    overflow: hidden;
    padding-bottom: 10px;
  }

  .slides-wrapper {
    width: 100%;
    position: relative;
  }

  .slides-track {
    display: flex;
    transition: transform 0.5s ease-in-out;
    width: 300%;
  }

  .nav-arrow {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: none;
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .nav-arrow:hover:not(.disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .nav-arrow.disabled {
    opacity: 0.3;
    cursor: not-allowed;
    color: #999;
  }

  .left-nav-wrapper, .right-nav-wrapper {
    position: relative;
  }

  .arrow-tooltip {
    position: absolute;
    background: #333;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 10;
    pointer-events: none;
  }

  .arrow-tooltip.left {
    left: 60px;
    top: 50%;
    transform: translateY(-50%);
  }

  .arrow-tooltip.right {
    right: 60px;
    top: 50%;
    transform: translateY(-50%);
  }

  .arrow-tooltip::before {
    content: '';
    position: absolute;
    top: 50%;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
  }

  .arrow-tooltip.left::before {
    left: -6px;
    transform: translateY(-50%);
    border-right: 6px solid #333;
  }

  .arrow-tooltip.right::before {
    right: -6px;
    transform: translateY(-50%);
    border-left: 6px solid #333;
  }

  .tooltip {
    position: absolute;
    top: 60px;
    right: 0;
    background: #333;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 10;
  }

  .tooltip::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 20px;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid #333;
  }

  @media (max-width: 900px) {
    .nav-arrow {
      width: 40px;
      height: 40px;
    }
  }

  @media (max-width: 600px) {
    .nav-arrow {
      width: 36px;
      height: 36px;
    }
  }
</style>