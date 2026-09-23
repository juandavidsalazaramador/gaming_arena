/* ========================================================
   GAMING ARENA - LÓGICA DE LOGIN Y REGISTRO (HUS-01 & HUS-02)
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {
  setupPasswordToggles();
  setupLoginForm();
  setupRegisterForm();
});

// 1. Mostrar / Ocultar contraseñas
function setupPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.toggle-password');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = `
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path>
          </svg>
        `;
      } else {
        input.type = 'password';
        btn.innerHTML = `
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
        `;
      }
    });
  });
}

// 2. HUS-01: Formulario de Login
function setupLoginForm() {
  const loginForm = document.getElementById('form-login');
  if (!loginForm) return;

  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');

  // Validaciones en tiempo real
  emailInput.addEventListener('input', () => validateLoginEmail());
  passwordInput.addEventListener('input', () => validateLoginPassword());

  function validateLoginEmail() {
    const val = emailInput.value.trim();
    if (!val) {
      setFieldError(emailInput, 'login-email-error', 'El correo o GamerTag es obligatorio');
      return false;
    }
    // Si contiene @, validar formato de correo
    if (val.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setFieldError(emailInput, 'login-email-error', 'Ingresa un correo electrónico válido');
      return false;
    }
    setFieldSuccess(emailInput, 'login-email-error');
    return true;
  }

  function validateLoginPassword() {
    const val = passwordInput.value;
    if (!val) {
      setFieldError(passwordInput, 'login-password-error', 'La contraseña es obligatoria');
      return false;
    }
    if (val.length < 6) {
      setFieldError(passwordInput, 'login-password-error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    setFieldSuccess(passwordInput, 'login-password-error');
    return true;
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const isEmailValid = validateLoginEmail();
    const isPasswordValid = validateLoginPassword();

    if (!isEmailValid || !isPasswordValid) {
      showToast('Por favor corrige los errores del formulario', 'warning');
      return;
    }

    const emailOrTag = emailInput.value.trim();
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // Estado de carga visual gamer
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Iniciando sesión...</span> 🎮`;

    setTimeout(() => {
      // Simular login exitoso o recuperación de usuario
      const existingUser = AuthManager.getCurrentUser() || {
        gamerTag: emailOrTag.includes('@') ? emailOrTag.split('@')[0] : emailOrTag,
        fullName: 'Jugador Arena',
        email: emailOrTag.includes('@') ? emailOrTag : `${emailOrTag}@gamingarena.com`,
        tier: 'Rango Élite',
        coins: 1200
      };

      AuthManager.setCurrentUser(existingUser);
      showToast(`¡Bienvenido de vuelta, ${existingUser.gamerTag}!`, 'success');

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    }, 900);
  });
}

// 3. HUS-02: Formulario de Registro
function setupRegisterForm() {
  const registerForm = document.getElementById('form-register');
  if (!registerForm) return;

  const tagInput = document.getElementById('reg-gamertag');
  const nameInput = document.getElementById('reg-name');
  const emailInput = document.getElementById('reg-email');
  const passwordInput = document.getElementById('reg-password');
  const confirmPasswordInput = document.getElementById('reg-confirm-password');
  const termsInput = document.getElementById('reg-terms');

  // Indicador de fortaleza
  const strengthBar = document.getElementById('password-strength-progress');
  const strengthText = document.getElementById('password-strength-label');

  tagInput.addEventListener('input', validateTag);
  nameInput.addEventListener('input', validateName);
  emailInput.addEventListener('input', validateEmail);
  passwordInput.addEventListener('input', () => {
    validatePassword();
    checkPasswordMatch();
  });
  confirmPasswordInput.addEventListener('input', checkPasswordMatch);
  termsInput.addEventListener('change', validateTerms);

  function validateTag() {
    const val = tagInput.value.trim();
    if (!val) {
      setFieldError(tagInput, 'reg-tag-error', 'El GamerTag es obligatorio');
      return false;
    }
    if (val.length < 3) {
      setFieldError(tagInput, 'reg-tag-error', 'El GamerTag debe tener al menos 3 caracteres');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(val)) {
      setFieldError(tagInput, 'reg-tag-error', 'Solo letras, números y guiones bajos');
      return false;
    }
    setFieldSuccess(tagInput, 'reg-tag-error');
    return true;
  }

  function validateName() {
    const val = nameInput.value.trim();
    if (!val) {
      setFieldError(nameInput, 'reg-name-error', 'Tu nombre completo es obligatorio');
      return false;
    }
    if (val.length < 3) {
      setFieldError(nameInput, 'reg-name-error', 'Nombre demasiado corto');
      return false;
    }
    setFieldSuccess(nameInput, 'reg-name-error');
    return true;
  }

  function validateEmail() {
    const val = emailInput.value.trim();
    if (!val) {
      setFieldError(emailInput, 'reg-email-error', 'El correo es obligatorio');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setFieldError(emailInput, 'reg-email-error', 'Ingresa un formato de correo válido');
      return false;
    }
    setFieldSuccess(emailInput, 'reg-email-error');
    return true;
  }

  function validatePassword() {
    const val = passwordInput.value;
    if (!val) {
      setFieldError(passwordInput, 'reg-password-error', 'La contraseña es obligatoria');
      updateStrengthMeter(0, 'Sin contraseña');
      return false;
    }

    let score = 0;
    if (val.length >= 6) score += 25;
    if (val.length >= 10) score += 25;
    if (/[A-Z]/.test(val)) score += 25;
    if (/[0-9]/.test(val) || /[^A-Za-z0-9]/.test(val)) score += 25;

    let label = 'Débil';
    let color = '#ef4444';

    if (score <= 25) {
      label = 'Débil (mínimo 6 car.)';
      color = '#ef4444';
    } else if (score <= 50) {
      label = 'Regular';
      color = '#f59e0b';
    } else if (score <= 75) {
      label = 'Buena';
      color = '#00f0ff';
    } else {
      label = '¡Excelente! 🔥';
      color = '#10b981';
    }

    updateStrengthMeter(score, label, color);

    if (val.length < 6) {
      setFieldError(passwordInput, 'reg-password-error', 'Mínimo 6 caracteres');
      return false;
    }

    setFieldSuccess(passwordInput, 'reg-password-error');
    return true;
  }

  function updateStrengthMeter(percent, text, color) {
    if (strengthBar) {
      strengthBar.style.width = `${percent}%`;
      strengthBar.style.backgroundColor = color || '#ef4444';
    }
    if (strengthText) {
      strengthText.textContent = text;
      strengthText.style.color = color || 'var(--text-muted)';
    }
  }

  function checkPasswordMatch() {
    const pass = passwordInput.value;
    const confirm = confirmPasswordInput.value;

    if (!confirm) {
      setFieldError(confirmPasswordInput, 'reg-confirm-error', 'Confirma tu contraseña');
      return false;
    }

    if (pass !== confirm) {
      setFieldError(confirmPasswordInput, 'reg-confirm-error', 'Las contraseñas no coinciden');
      return false;
    }

    setFieldSuccess(confirmPasswordInput, 'reg-confirm-error');
    return true;
  }

  function validateTerms() {
    if (!termsInput.checked) {
      showToast('Debes aceptar los términos y condiciones', 'warning');
      return false;
    }
    return true;
  }

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const isTagValid = validateTag();
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPassValid = validatePassword();
    const isMatchValid = checkPasswordMatch();
    const isTermsValid = validateTerms();

    if (!isTagValid || !isNameValid || !isEmailValid || !isPassValid || !isMatchValid || !isTermsValid) {
      showToast('Revisa los campos marcados en rojo', 'error');
      return;
    }

    const submitBtn = registerForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Creando tu cuenta gamer...</span> 🎮`;

    setTimeout(() => {
      // Guardar usuario registrado
      const newUser = {
        gamerTag: tagInput.value.trim(),
        fullName: nameInput.value.trim(),
        email: emailInput.value.trim(),
        tier: 'Rango Novato',
        coins: 500 // Bonificación de bienvenida
      };

      AuthManager.setCurrentUser(newUser);
      showToast('¡Cuenta creada con éxito! Tienes 500 Arena Coins de bienvenida 🪙', 'success');

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1200);
    }, 1000);
  });
}

// Helpers visuales de validación
function setFieldError(inputElement, errorElementId, message) {
  inputElement.classList.add('is-invalid');
  inputElement.classList.remove('is-valid');
  const errEl = document.getElementById(errorElementId);
  if (errEl) {
    errEl.textContent = message;
    errEl.style.display = 'block';
  }
}

function setFieldSuccess(inputElement, errorElementId) {
  inputElement.classList.remove('is-invalid');
  inputElement.classList.add('is-valid');
  const errEl = document.getElementById(errorElementId);
  if (errEl) {
    errEl.textContent = '';
    errEl.style.display = 'none';
  }
}
