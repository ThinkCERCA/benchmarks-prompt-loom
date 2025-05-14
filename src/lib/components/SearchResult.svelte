<!-- $lib/components/SearchResult.svelte -->
<script>
  import { onMount } from 'svelte';
  
  // Props
  export let result = {};
  
  let analyzing = false;
  let analysisResult = null;
  let analysisError = null;
  let addedToReadingList = false;
  
  /**
   * Analyze the text complexity in depth using the analyze-text endpoint
   */
  async function analyzeTextComplexity() {
    if (analyzing) return;
    
    analyzing = true;
    analysisError = null;
    
    try {
      const response = await fetch('/api/analyze-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: result.link,
          gradeLevel: result.gradeLevel || 'grade8' // Default to grade 8 if not specified
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      analysisResult = await response.json();
    } catch (err) {
      console.error('Failed to analyze text:', err);
      analysisError = err.message || 'Failed to analyze text complexity';
    } finally {
      analyzing = false;
    }
  }
  
  // Convert a Lexile range into a verbal description
  function getLexileDescription(lexileRange) {
    if (!lexileRange) return "Unknown";
    
    const [min, max] = lexileRange.split('-').map(Number);
    const avg = (min + max) / 2;
    
    if (avg < 500) return "Early Reader";
    if (avg < 800) return "Elementary School";
    if (avg < 1000) return "Middle School";
    if (avg < 1200) return "High School";
    return "Advanced/College Level";
  }
  
  // Get a CSS class based on suitability
  function getSuitabilityClass(suitable) {
    if (suitable === 'suitable') return 'suitable';
    if (suitable === 'may need excerpting') return 'caution';
    return 'unsuitable';
  }
  
  // Add result to reading list
  function addToReadingList() {
    // In a real app, this would save to backend or state management
    addedToReadingList = true;
    console.log('Added to reading list:', result.title);
  }
</script>

<div class="result-card">
  <a href={result.link} target="_blank" rel="noopener noreferrer" class="result-title">
    {result.title}
  </a>
  <p class="result-link">{result.link}</p>
  
  <!-- Text complexity metrics (if available) -->
  {#if result.estimatedWordCount}
    <div class="text-metrics">
      <div class="metric-row">
        <div class="metric {getSuitabilityClass(result.lengthSuitability)}">
          <span class="label">Est. Words:</span>
          <span class="value">{result.estimatedWordCount}</span>
          <span class="badge">{result.lengthSuitability}</span>
        </div>
        
        <div class="metric {result.isComplexityAppropriate ? 'suitable' : 'caution'}">
          <span class="label">Lexile:</span>
          <span class="value">{result.estimatedLexileLevel}</span>
          <span class="badge">{getLexileDescription(result.estimatedLexileLevel)}</span>
        </div>
        
        <div class="metric">
          <span class="label">Grade:</span>
          <span class="value">{result.gradeLevel || "Not specified"}</span>
        </div>
      </div>
    </div>
  {/if}
  
  <p class="result-snippet">{result.snippet}</p>
  
  <!-- Analysis results (if available) -->
  {#if analysisResult}
    <div class="analysis-results">
      <h4>Detailed Text Analysis</h4>
      
      <div class="metrics-grid">
        <div class="analysis-metric">
          <span class="metric-label">Word Count:</span>
          <span class="metric-value">{analysisResult.estimatedWordCount}</span>
        </div>
        
        <div class="analysis-metric">
          <span class="metric-label">Lexile Level:</span>
          <span class="metric-value">{analysisResult.estimatedLexileLevel}</span>
        </div>
        
        <div class="analysis-metric">
          <span class="metric-label">Target Lexile:</span>
          <span class="metric-value">{analysisResult.lexileRange}</span>
        </div>
        
        <div class="analysis-metric">
          <span class="metric-label">Length Appropriate:</span>
          <span class="metric-value {analysisResult.isLengthAppropriate ? 'suitable-text' : 'unsuitable-text'}">
            {analysisResult.isLengthAppropriate ? 'Yes' : 'No'}
          </span>
        </div>
        
        <div class="analysis-metric">
          <span class="metric-label">Complexity Appropriate:</span>
          <span class="metric-value {analysisResult.isComplexityAppropriate ? 'suitable-text' : 'unsuitable-text'}">
            {analysisResult.isComplexityAppropriate ? 'Yes' : 'No'}
          </span>
        </div>
        
        <div class="analysis-metric">
          <span class="metric-label">Recommended Grade:</span>
          <span class="metric-value">{analysisResult.recommendedGradeLevel}</span>
        </div>
      </div>
      
      {#if analysisResult.rationale}
        <div class="rationale">
          <strong>Rationale:</strong> {analysisResult.rationale}
        </div>
      {/if}
    </div>
  {/if}
  
  {#if analysisError}
    <div class="analysis-error">
      Failed to analyze text: {analysisError}
    </div>
  {/if}
  
  
    
</div>

<style>
  .result-card {
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #dfe1e5;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    transition: box-shadow 0.2s;
    background-color: white;
    margin-bottom: 20px;
  }
  
  .result-card:hover {
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
  
  .result-title {
    color: #1a0dab;
    font-size: 18px;
    text-decoration: none;
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  .result-title:hover {
    text-decoration: underline;
  }
  
  .result-link {
    color: #006621;
    font-size: 14px;
    margin-bottom: 10px;
    word-break: break-all;
  }
  
  .result-snippet {
    color: #4d5156;
    font-size: 14px;
    line-height: 1.6;
    margin: 15px 0;
  }
  
  .text-metrics {
    margin: 12px 0;
  }
  
  .metric-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .metric {
    display: inline-flex;
    align-items: center;
    font-size: 13px;
    padding: 6px 10px;
    border-radius: 6px;
    background-color: #f8f9fa;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
  
  .label {
    font-weight: 600;
    margin-right: 5px;
    color: #444;
  }
  
  .value {
    color: #1a73e8;
  }
  
  .badge {
    background-color: #e8eaed;
    padding: 2px 6px;
    border-radius: 12px;
    margin-left: 6px;
    font-size: 11px;
    color: #444;
  }
  
  .suitable {
    background-color: #e6f4ea;
    border-left: 3px solid #137333;
  }
  
  .suitable .badge {
    background-color: #d2e7d9;
    color: #137333;
  }
  
  .caution {
    background-color: #fef7e0;
    border-left: 3px solid #b06000;
  }
  
  .caution .badge {
    background-color: #feefc3;
    color: #b06000;
  }
  
  .unsuitable {
    background-color: #fce8e6;
    border-left: 3px solid #c5221f;
  }
  
  .unsuitable .badge {
    background-color: #fad2cf;
    color: #c5221f;
  }
  
  .analysis-results {
    background-color: #f8f9fa;
    border: 1px solid #dadce0;
    border-radius: 8px;
    padding: 15px;
    margin: 15px 0;
  }
  
  h4 {
    margin-top: 0;
    margin-bottom: 12px;
    color: #202124;
    font-size: 16px;
  }
  
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
    margin-bottom: 15px;
  }
  
  .analysis-metric {
    background-color: white;
    padding: 8px 12px;
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
  
  .metric-label {
    display: block;
    font-size: 12px;
    color: #5f6368;
    margin-bottom: 4px;
  }
  
  .metric-value {
    font-size: 14px;
    font-weight: 500;
    color: #202124;
  }
  
  .suitable-text {
    color: #137333;
  }
  
  .unsuitable-text {
    color: #c5221f;
  }
  
  .rationale {
    background-color: white;
    padding: 10px;
    border-radius: 6px;
    font-size: 13px;
    line-height: 1.5;
    color: #3c4043;
  }
  
  .analysis-error {
    color: #c5221f;
    font-size: 14px;
    background-color: #fce8e6;
    padding: 10px;
    border-radius: 6px;
    margin: 10px 0;
  }
  
  .actions {
    display: flex;
    gap: 10px;
    margin-top: 15px;
    flex-wrap: wrap;
  }
  
  .action-btn {
    padding: 8px 12px;
    font-size: 13px;
    border-radius: 4px;
    background-color: #f8f9fa;
    color: #3c4043;
    border: 1px solid #dadce0;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .action-btn:hover:not(:disabled) {
    background-color: #f1f3f4;
  }
  
  .action-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .analyze {
    color: #1a73e8;
  }
  
  .save {
    color: #34a853;
  }
  
  .excerpt {
    color: #ea4335;
  }
</style>