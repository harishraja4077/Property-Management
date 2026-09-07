/* ============================================
   Stackly - Property Management JavaScript
   ============================================ */

// --- Email validation: only @gmail.com addresses are accepted ---
function isValidGmail(email) {
  if (typeof email !== 'string') return false;
  email = email.trim();
  if (email.length < 6) return false;
  // Must be a syntactically valid email that ends with @gmail.com
  var at = email.indexOf('@');
  var lastAt = email.lastIndexOf('@');
  if (at !== lastAt || at < 1) return false;
  var local = email.slice(0, at);
  var domain = email.slice(at + 1).toLowerCase();
  return domain === 'gmail.com' && /^[A-Za-z0-9._%+-]+$/.test(local);
}

// --- Password validation: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char ---
function isValidPassword(password) {
  if (typeof password !== 'string') return false;
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[^A-Za-z0-9]/.test(password)) return false;
  return true;
}

// --- Show an inline/submit error for an invalid email field ---
function showFieldError(input, message) {
  if (!input) return;
  input.style.borderColor = '#e74c3c';
  input.style.boxShadow = '0 0 0 4px rgba(231,76,60,0.15)';

  // Remove any existing error message for this input
  var wrapper = document.querySelector('[data-email-err-for="' + input.id + '"]');
  if (wrapper) wrapper.remove();

  // Create an error message element
  var err = document.createElement('div');
  err.setAttribute('data-email-err-for', input.id || ('input-' + Date.now()));
  err.style.color = '#e74c3c';
  err.style.fontSize = '0.8rem';
  err.style.marginTop = '6px';
  err.style.fontWeight = '500';
  err.textContent = message;
  input.parentNode.appendChild(err);

  // Clear error on input
  input.addEventListener('input', function clear() {
    input.style.borderColor = '';
    input.style.boxShadow = '';
    var e = document.querySelector('[data-email-err-for="' + input.id + '"]');
    if (e) e.remove();
    input.removeEventListener('input', clear);
  }, { once: false });
}

// --- Persist the logged-in user's session for the dashboards ---
function saveUserSession(email, role) {
  email = (email || '').trim();
  localStorage.setItem('stackly_user_email', email);
  localStorage.setItem('stackly_user_role', role || 'user');
  localStorage.setItem('stackly_user_initials', initialsFromEmail(email));
}

function initialsFromEmail(email) {
  if (!email) return 'U';
  var local = String(email).split('@')[0];
  var parts = local.split(/[._\-+]+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

document.addEventListener('DOMContentLoaded', function() {

  // --- Preloader ---
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', function() {
      setTimeout(function() {
        preloader.classList.add('hidden');
      }, 600);
    });
    setTimeout(function() {
      preloader.classList.add('hidden');
    }, 3000);
  }

  // --- Header Scroll ---
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 80) {
        header.classList.add('scrolled');
      } else if (!header.classList.contains('scrolled') && !document.querySelector('.page-hero')) {
        header.classList.remove('scrolled');
      }
    });
  }

  // --- Mobile Menu ---
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const navOverlay = document.getElementById('navOverlay');

  function openMenu() {
    if (menuToggle) menuToggle.classList.add('active');
    navLinks.classList.add('active');
    if (navOverlay) navOverlay.classList.add('active');
    document.body.classList.add('menu-open');
    document.documentElement.classList.add('menu-open');
  }

  function closeMenu() {
    if (menuToggle) menuToggle.classList.remove('active');
    navLinks.classList.remove('active');
    if (navOverlay) navOverlay.classList.remove('active');
    document.body.classList.remove('menu-open');
    document.documentElement.classList.remove('menu-open');
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function() {
      this.classList.contains('active') ? closeMenu() : openMenu();
    });

    if (navOverlay) {
      navOverlay.addEventListener('click', closeMenu);
    }

    navLinks.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', closeMenu);
    });
  }

  // --- Hero Slider ---
  const heroSlides = document.querySelectorAll('.hero-slide');
  const slideNavBtns = document.querySelectorAll('.hero-slide-nav button');
  let currentSlide = 0;
  let slideInterval;

  function goToSlide(index) {
    heroSlides.forEach(function(slide) { slide.classList.remove('active'); });
    slideNavBtns.forEach(function(btn) { btn.classList.remove('active'); });
    if (heroSlides[index]) heroSlides[index].classList.add('active');
    if (slideNavBtns[index]) slideNavBtns[index].classList.add('active');
    currentSlide = index;
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % heroSlides.length);
  }

  if (heroSlides.length > 0) {
    slideNavBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var slideIndex = parseInt(this.getAttribute('data-slide'));
        goToSlide(slideIndex);
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
      });
    });
    slideInterval = setInterval(nextSlide, 5000);
  }

  // --- Scroll Animations ---
  const animateElements = document.querySelectorAll('.animate-on-scroll');

  function checkScroll() {
    animateElements.forEach(function(el) {
      var rect = el.getBoundingClientRect();
      var windowHeight = window.innerHeight;
      if (rect.top < windowHeight * 0.88) {
        el.classList.add('visible');
      }
    });
  }

  window.addEventListener('scroll', checkScroll);
  checkScroll();

  // --- Counter Animation ---
  const counters = document.querySelectorAll('.counter');
  var countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    counters.forEach(function(counter) {
      var rect = counter.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85) {
        countersAnimated = true;
        var target = parseInt(counter.getAttribute('data-target'));
        var duration = 2000;
        var startTime = null;

        function updateCounter(timestamp) {
          if (!startTime) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          counter.textContent = Math.floor(eased * target).toLocaleString();
          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target.toLocaleString() + '+';
          }
        }
        requestAnimationFrame(updateCounter);
      }
    });
  }

  window.addEventListener('scroll', animateCounters);
  animateCounters();

  // --- Back to Top ---
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });

    backToTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Favorite Buttons ---
  var favBtns = document.querySelectorAll('.property-fav');
  favBtns.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.toggle('active');
      var icon = this.querySelector('i');
      if (this.classList.contains('active')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
      } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
      }
    });
  });

  // --- FAQ Accordion ---
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function(item) {
    var question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', function() {
        var isActive = item.classList.contains('active');
        faqItems.forEach(function(i) {
          i.classList.remove('active');
          var answer = i.querySelector('.faq-answer');
          if (answer) answer.style.maxHeight = '0';
        });
        if (!isActive) {
          item.classList.add('active');
          var answer = item.querySelector('.faq-answer');
          if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    }
  });

  // --- Blog Tabs ---
  var tabBtns = document.querySelectorAll('.tab-btn');
  var blogCards = document.querySelectorAll('.blog-card[data-category]');

  tabBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      tabBtns.forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      var tab = this.getAttribute('data-tab');

      blogCards.forEach(function(card) {
        if (tab === 'all' || card.getAttribute('data-category') === tab) {
          card.style.display = '';
          setTimeout(function() { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(function() { card.style.display = 'none'; }, 300);
        }
      });
    });
  });

  // --- Contact Form ---
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = this.querySelector('button[type="submit"]');
      var firstInvalid = null;

      // Validate all required fields
      var required = this.querySelectorAll('[required]');
      required.forEach(function(field) {
        var empty = field.type === 'checkbox'
          ? !field.checked
          : !(field.value && field.value.trim());
        if (empty) {
          showFieldError(field, 'This field is required.');
          if (!firstInvalid) firstInvalid = field;
        }
      });

      // Validate the contact email: must end with @gmail.com
      var emailInput = this.querySelector('input[type="email"]');
      if (emailInput && !isValidGmail(emailInput.value)) {
        if (!emailInput.value.trim()) {
          showFieldError(emailInput, 'Please enter your email address.');
        } else {
          showFieldError(emailInput, 'Please enter a valid Gmail address (must end with @gmail.com).');
        }
        if (!firstInvalid) firstInvalid = emailInput;
      }

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      btn.disabled = true;

      setTimeout(function() {
        window.location.href = '404.html';
      }, 800);
    });
  }

  // --- Smooth Scroll for Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Active Nav Link ---
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function(link) {
    var href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });

  // --- Password Toggle (Auth) ---
  document.querySelectorAll('.toggle-password').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var targetId = this.getAttribute('data-target');
      var input = document.getElementById(targetId);
      if (input) {
        var icon = this.querySelector('i');
        if (input.type === 'password') {
          input.type = 'text';
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
        } else {
          input.type = 'password';
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
        }
      }
    });
  });

  // --- Password Strength Meter (Sign Up) ---
  var signupPassword = document.getElementById('signupPassword');
  if (signupPassword) {
    var strengthBars = document.querySelectorAll('.password-strength .bar');
    var strengthText = document.getElementById('passwordStrengthText');

    signupPassword.addEventListener('input', function() {
      var val = this.value;
      var strength = 0;

      if (val.length >= 8) strength++;
      if (val.length >= 12) strength++;
      if (/[A-Z]/.test(val) && /[a-z]/.test(val)) strength++;
      if (/\d/.test(val) && /[^A-Za-z0-9]/.test(val)) strength++;

      var labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
      var colors = ['', '#e74c3c', '#f39c12', '#2ecc71', '#27ae60'];

      strengthBars.forEach(function(bar, index) {
        bar.classList.remove('active-weak', 'active-fair', 'active-good', 'active-strong');
        if (index < strength) {
          if (strength <= 1) bar.classList.add('active-weak');
          else if (strength === 2) bar.classList.add('active-fair');
          else if (strength === 3) bar.classList.add('active-good');
          else bar.classList.add('active-strong');
        }
      });

      if (strengthText) {
        if (val.length === 0) {
          strengthText.textContent = '';
        } else {
          strengthText.textContent = labels[strength] || '';
          strengthText.style.color = colors[strength] || '';
        }
      }
    });
  }

  // --- Login Form ---
  var loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = this.querySelector('button[type="submit"]');
      var firstInvalid = null;

      var emailInput = document.getElementById('loginEmail');
      var passInput = document.getElementById('loginPassword');
      var email = emailInput ? emailInput.value.trim() : '';

      // Validate required fields
      if (!passInput || !passInput.value || !passInput.value.trim()) {
        showFieldError(passInput, 'Please enter your password.');
        if (!firstInvalid) firstInvalid = passInput;
      } else if (!isValidPassword(passInput.value)) {
        showFieldError(passInput, 'Password must be at least 8 characters with 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.');
        if (!firstInvalid) firstInvalid = passInput;
      }

      if (!email) {
        showFieldError(emailInput, 'Please enter your email address.');
        if (!firstInvalid) firstInvalid = emailInput;
      } else if (!isValidGmail(email)) {
        showFieldError(emailInput, 'Please enter a valid Gmail address (must end with @gmail.com).');
        if (!firstInvalid) firstInvalid = emailInput;
      }

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
      btn.disabled = true;

      setTimeout(function() {
        btn.disabled = false;
        window.location.href = '404.html';
      }, 800);
    });
  }

  // --- Register Form ---
  var registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = this.querySelector('button[type="submit"]');
      var firstInvalid = null;

      var pass = document.getElementById('signupPassword');
      var confirm = document.getElementById('confirmPassword');

      // Validate required fields
      var required = this.querySelectorAll('[required]');
      required.forEach(function(field) {
        var empty = field.type === 'checkbox'
          ? !field.checked
          : !(field.value && field.value.trim());
        if (empty) {
          showFieldError(field, 'This field is required.');
          if (!firstInvalid) firstInvalid = field;
        }
      });

      if (pass && pass.value.trim() && !isValidPassword(pass.value)) {
        showFieldError(pass, 'Password must be at least 8 characters with 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.');
        if (!firstInvalid) firstInvalid = pass;
      }

      if (pass && pass.value && confirm && confirm.value && pass.value !== confirm.value) {
        var confirmInput = confirm.closest('.input-wrapper').querySelector('input');
        confirmInput.style.borderColor = '#e74c3c';
        confirmInput.style.boxShadow = '0 0 0 4px rgba(231,76,60,0.15)';
        showFieldError(confirmInput, 'Passwords do not match.');
        if (!firstInvalid) firstInvalid = confirmInput;
      }

      var regEmail = document.getElementById('registerEmail');
      var regEmailVal = regEmail ? regEmail.value.trim() : '';
      if (regEmailVal && !isValidGmail(regEmailVal)) {
        showFieldError(regEmail, 'Please enter a valid Gmail address (must end with @gmail.com).');
        if (!firstInvalid) firstInvalid = regEmail;
      }

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
      btn.disabled = true;

      setTimeout(function() {
        btn.disabled = false;
        window.location.href = '404.html';
      }, 800);
    });
  }

  // --- Confirm password re-validation ---
  var confirmPassword = document.getElementById('confirmPassword');
  if (confirmPassword) {
    confirmPassword.addEventListener('input', function() {
      this.style.borderColor = '';
      this.style.boxShadow = '';
    });
  }

  // --- Newsletter Forms ---
  document.querySelectorAll('.footer-newsletter-form').forEach(function(form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = this.querySelector('button');
      var input = this.querySelector('input');
      var btnOriginalText = btn.innerHTML;

      // Require a value before validating format
      if (!input || !input.value || !input.value.trim()) {
        showFieldError(input, 'Please enter your email address.');
        return;
      }

      // Require a valid @gmail.com address
      if (!isValidGmail(input.value)) {
        showFieldError(input, 'Please enter a valid Gmail address (must end with @gmail.com).');
        return;
      }

      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      btn.disabled = true;
      setTimeout(function() {
        btn.innerHTML = btnOriginalText;
        btn.disabled = false;
        window.location.href = '404.html';
      }, 800);
    });
  });

  // --- Gallery Lightbox ---
  var lightbox = document.getElementById('galleryLightbox');
  if (lightbox) {
    var lightboxImg = document.getElementById('lightboxImg');
    var galleryImgs = document.querySelectorAll('.gallery-item img');
    var galleryItems = document.querySelectorAll('.gallery-item');
    var currentIndex = 0;

    function openLightbox(index) {
      currentIndex = (index + galleryImgs.length) % galleryImgs.length;
      lightboxImg.src = galleryImgs[currentIndex].src;
      lightboxImg.alt = galleryImgs[currentIndex].alt || 'Gallery Image';
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    // Bind to the whole tile so clicks on the overlay/+ icon also open the lightbox
    galleryItems.forEach(function(item, i) {
      item.addEventListener('click', function() {
        openLightbox(i);
      });
    });

    document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
    document.getElementById('lightboxPrev').addEventListener('click', function() { openLightbox(currentIndex - 1); });
    document.getElementById('lightboxNext').addEventListener('click', function() { openLightbox(currentIndex + 1); });

    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function(e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') openLightbox(currentIndex - 1);
      if (e.key === 'ArrowRight') openLightbox(currentIndex + 1);
    });
  }

});
