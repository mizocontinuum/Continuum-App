(function(){
  var form = document.getElementById("signupForm");
  var nameIn = document.getElementById("fullName");
  var emailIn = document.getElementById("signupEmail");
  var roleIn = document.getElementById("jobRole");
  var orgIn = document.getElementById("organization");
  var passIn = document.getElementById("signupPassword");
  var confIn = document.getElementById("confirmPassword");
  var termsIn = document.getElementById("termsCheck");
  var err = document.getElementById("signupError");
  var btn = document.getElementById("signupSubmitBtn");
  var strBar = document.getElementById("strengthBar");
  var strLbl = document.getElementById("passStrengthLabel");

  if(!form || !nameIn || !emailIn || !passIn) return;

  // Real-time Password Strength Check
  passIn.addEventListener("input", function(){
    var v = passIn.value;
    var score = 0;
    if(v.length >= 8) score++;
    if(/[A-Z]/.test(v)) score++;
    if(/[0-9]/.test(v)) score++;
    if(/[^A-Za-z0-9]/.test(v)) score++;

    if(v.length === 0){
      strBar.style.width = "0%";
      strLbl.textContent = "Min. 8 characters";
      strLbl.style.color = "var(--text-muted)";
    } else if(score <= 1){
      strBar.style.width = "25%";
      strBar.style.background = "#FF4D6D";
      strLbl.textContent = "Weak";
      strLbl.style.color = "#FF4D6D";
    } else if(score === 2){
      strBar.style.width = "50%";
      strBar.style.background = "#FFAA00";
      strLbl.textContent = "Fair";
      strLbl.style.color = "#FFAA00";
    } else if(score === 3){
      strBar.style.width = "75%";
      strBar.style.background = "#33B5FF";
      strLbl.textContent = "Good";
      strLbl.style.color = "#33B5FF";
    } else {
      strBar.style.width = "100%";
      strBar.style.background = "#00E676";
      strLbl.textContent = "Strong";
      strLbl.style.color = "#00E676";
    }
  });

  // Password Visibility Toggles
  var togglePass = document.getElementById("toggleSignupPass");
  if(togglePass){
    togglePass.onclick = function(){
      var isPw = passIn.type === "password";
      passIn.type = isPw ? "text" : "password";
      this.textContent = isPw ? "Hide" : "Show";
      this.setAttribute("aria-label", isPw ? "Hide password" : "Show password");
    };
  }
  var toggleConf = document.getElementById("toggleConfirmPass");
  if(toggleConf){
    toggleConf.onclick = function(){
      var isPw = confIn.type === "password";
      confIn.type = isPw ? "text" : "password";
      this.textContent = isPw ? "Hide" : "Show";
      this.setAttribute("aria-label", isPw ? "Hide password" : "Show password");
    };
  }

  // Clear errors on input
  [nameIn, emailIn, passIn, confIn].forEach(function(el){
    if(el) el.addEventListener("input", function(){
      if(err) err.textContent = "";
      el.removeAttribute("aria-invalid");
    });
  });

  // Handle Form Submission
  form.addEventListener("submit", function(e){
    e.preventDefault();
    if(err) err.textContent = "";

    var nameVal = nameIn.value.trim();
    var emailVal = emailIn.value.trim().toLowerCase();
    var passVal = passIn.value.trim();
    var confVal = confIn.value.trim();
    var roleVal = roleIn ? roleIn.value : "Student";
    var orgVal = orgIn ? orgIn.value.trim() : "";

    if(nameVal.length < 2){
      err.textContent = "Please provide your full legal name.";
      nameIn.setAttribute("aria-invalid", "true");
      nameIn.focus();
      return;
    }

    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)){
      err.textContent = "Please enter a valid work or personal email address.";
      emailIn.setAttribute("aria-invalid", "true");
      emailIn.focus();
      return;
    }

    if(passVal.length < 8){
      err.textContent = "Password must be at least 8 characters.";
      passIn.setAttribute("aria-invalid", "true");
      passIn.focus();
      return;
    }

    if(passVal !== confVal){
      err.textContent = "Passwords do not match.";
      confIn.setAttribute("aria-invalid", "true");
      confIn.focus();
      return;
    }

    if(termsIn && !termsIn.checked){
      err.textContent = "Please accept the Continuum Terms of Service to continue.";
      termsIn.focus();
      return;
    }

    btn.disabled = true;
    btn.classList.add("loading");
    var btnSpan = btn.querySelector("span");
    if(btnSpan) btnSpan.textContent = "Creating Account...";

    try {
      var registered = JSON.parse(localStorage.getItem("continuum_registered_users") || "[]");
      var existing = registered.find(function(u){ return u.email === emailVal; });
      if(existing){
        err.textContent = "An account with this email already exists. Please sign in.";
        btn.disabled = false;
        btn.classList.remove("loading");
        if(btnSpan) btnSpan.textContent = "Create Account";
        return;
      }

      registered.push({
        name: nameVal,
        email: emailVal,
        role: roleVal,
        organization: orgVal,
        password: passVal,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem("continuum_registered_users", JSON.stringify(registered));

      // Issue active session
      localStorage.setItem("continuum.session", JSON.stringify({
        id: "USR-" + Date.now(),
        name: nameVal,
        email: emailVal,
        role: roleVal
      }));
      localStorage.setItem("continuum_auth_user", "student");

      var toastEl = document.getElementById("signupToast");
      if(toastEl){
        toastEl.textContent = "Account created successfully! Welcome to Continuum Academy.";
        toastEl.className = "toast-msg show";
      }

      setTimeout(function(){
        window.location.href = "../home/";
      }, 1100);

    } catch(ex){
      console.error(ex);
      btn.disabled = false;
      btn.classList.remove("loading");
      if(btnSpan) btnSpan.textContent = "Create Account";
    }
  });

  
})();
