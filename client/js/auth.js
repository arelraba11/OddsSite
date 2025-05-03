document.addEventListener("DOMContentLoaded", () => {
    // === Grab elements ===
    const registerBtn = document.getElementById("register-btn");
    const loginBtn = document.getElementById("login-btn");
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");
  
    // === Toggle between register and login forms ===
    registerBtn.addEventListener("click", () => {
      registerForm.classList.remove("hidden"); // show register form
      loginForm.classList.add("hidden");       // hide login form
      registerBtn.classList.add("active");     // style selected tab
      loginBtn.classList.remove("active");
    });
  
    loginBtn.addEventListener("click", () => {
      loginForm.classList.remove("hidden");    // show login form
      registerForm.classList.add("hidden");    // hide register form
      loginBtn.classList.add("active");        // style selected tab
      registerBtn.classList.remove("active");
    });
  
    // === Handle registration form submission ===
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // prevent page reload
  
      // Get values from input fields
      const username = registerForm.username.value;
      const email = registerForm.email.value;
      const password = registerForm.password.value;
  
      try {
        // Send POST request to backend
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });
  
        const data = await res.json();
  
        if (res.ok) {
          // Save JWT token to localStorage and redirect
          localStorage.setItem("token", data.token);
          window.location.href = "/sports";
        } else {
          alert(data.message || "Registration failed");
        }
      } catch (err) {
        console.error("Register error:", err);
        alert("Error registering user.");
      }
    });
  
    // === Handle login form submission ===
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // prevent page reload
  
      // Get values from input fields
      const email = loginForm.email.value;
      const password = loginForm.password.value;
  
      try {
        // Send POST request to backend
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
  
        const data = await res.json();
  
        if (res.ok) {
          // Save JWT token to localStorage and redirect
          localStorage.setItem("token", data.token);
          window.location.href = "/sports";
        } else {
          alert(data.message || "Login failed");
        }
      } catch (err) {
        console.error("Login error:", err);
        alert("Error logging in.");
      }
    });
  });