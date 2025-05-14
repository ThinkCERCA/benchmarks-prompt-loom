<!-- src/routes/login/+page.svelte -->
<script>
  /** @type {import('./$types').ActionData} */
  export let form;
</script>

<div class="essay-recommender">
  <div class="header-container">
    <h1>Benchmarks Prompt Loom</h1>
  </div>

  <div class="login-container">
    <h2>Login</h2>
    <p>Please enter the shared password to continue</p>

    <form method="POST">
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required />
      </div>
      
      {#if form?.message}
        <p class="error">{form.message}</p>
      {/if}
      
      <button type="submit">Log in</button>
    </form>
    
    <div class="password-request">
      <p>Need access? <a href="mailto:eleblanc@thinkcerca.com?subject=Benchmarks%20Prompt%20Loom2%20Password%20Request&body=Hello,%0A%0AI'd%20like%20to%20request%20access%20to%20the%20PromptLoom2%20application.%0A%0AThank%20you.">Email the administrators</a> to request the password.</p>
    </div>
  </div>
</div>

<style>
  .essay-recommender {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #333;
  }

  .header-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 40px;
  }

  h1 {
    text-align: center;
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    color: #222;
  }

  h2 {
    font-size: 22px;
    margin-top: 0;
    margin-bottom: 10px;
    color: #222;
  }

  .login-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
    background: #ffffff;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
  }
  
  input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }

  input:focus {
    outline: none;
    border-color: #4a2c96;
    box-shadow: 0 0 0 2px rgba(74, 44, 150, 0.2);
  }
  
  button {
    width: 100%;
    padding: 12px;
    background-color: #4a2c96;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    transition: background-color 0.2s;
  }
  
  button:hover {
    background-color: #3a1f7a;
  }
  
  .error {
    color: #d32f2f;
    margin-bottom: 15px;
    font-size: 14px;
  }

  p {
    margin-bottom: 25px;
    color: #555;
  }
  
  .password-request {
    margin-top: 25px;
    padding-top: 15px;
    border-top: 1px solid #eee;
    text-align: center;
  }

  .password-request p {
    margin-bottom: 0;
    font-size: 14px;
  }

  a {
    color: #4a2c96;
    text-decoration: none;
    font-weight: 500;
  }

  a:hover {
    text-decoration: underline;
  }

  /* Media queries for responsive design */
  @media (max-width: 600px) {
    h1 {
      font-size: 24px;
    }
    
    .login-container {
      padding: 20px;
    }
  }
</style>