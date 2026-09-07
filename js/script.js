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
  const navClose = document.getElementById('navClose');

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

    if (navClose) {
      navClose.addEventListener('click', closeMenu);
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
      var originalText = btn.innerHTML;
      var firstInvalid = null;

      // Validate all required fields
      var required = this.querySelectorAll('[required]');
      required.forEach(function(field) {
        if (!field.value.trim()) {
          showFieldError(field, 'This field is required.');
          if (!firstInvalid) firstInvalid = field;
        }
      });

      // Validate the contact email: must end with @gmail.com
      var emailInput = this.querySelector('input[type="email"]');
      if (emailInput && !isValidGmail(emailInput.value)) {
        showFieldError(emailInput, 'Please enter a valid Gmail address (must end with @gmail.com).');
        if (!firstInvalid) firstInvalid = emailInput;
      }

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      // Compose a real email to the Stackly team via the visitor's mail client
      var firstName = this.querySelector('[name="firstName"]');
      var lastName = this.querySelector('[name="lastName"]');
      var phone = this.querySelector('[name="phone"]');
      var subject = this.querySelector('[name="subject"]');
      var message = this.querySelector('[name="message"]');

      var mailSubject = encodeURIComponent('[Contact Inquiry] ' + subject.value);
      var mailBody = encodeURIComponent(
        'Name: ' + firstName.value.trim() + ' ' + lastName.value.trim() + '\n' +
        'Phone: ' + (phone.value.trim() || 'Not provided') + '\n' +
        'Email: ' + emailInput.value.trim() + '\n\n' +
        message.value.trim()
      );
      window.location.href = 'mailto:thestackly@gmail.com?subject=' + mailSubject + '&body=' + mailBody;

      btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
      btn.style.background = '#27ae60';
      btn.style.color = '#fff';

      setTimeout(function() {
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.style.color = '';
        contactForm.reset();
      }, 3000);
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
      var originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
      btn.disabled = true;

      var emailInput = document.getElementById('loginEmail');
      var email = emailInput ? emailInput.value.trim() : '';
      if (!isValidGmail(email)) {
        showFieldError(emailInput, 'Please enter a valid Gmail address (must end with @gmail.com).');
        btn.innerHTML = originalText;
        btn.disabled = false;
        return;
      }

      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
      btn.disabled = true;

      setTimeout(function() {
        btn.innerHTML = '<i class="fas fa-check"></i> Welcome Back!';
        btn.style.background = '#27ae60';
        btn.style.color = '#fff';
        setTimeout(function() {
          // Persist the logged-in user's email/role/initials
          saveUserSession(email, window.selectedRole === 'admin' ? 'admin' : 'user');
          window.location.href = (window.selectedRole === 'admin') ? 'admindashboard.html' : 'userdashboard.html';
        }, 1200);
      }, 1500);
    });
  }

  // --- Register Form ---
  var registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = this.querySelector('button[type="submit"]');
      var originalText = btn.innerHTML;

      var pass = document.getElementById('signupPassword');
      var confirm = document.getElementById('confirmPassword');

      if (pass && confirm && pass.value !== confirm.value) {
        var confirmInput = confirm.closest('.input-wrapper').querySelector('input');
        confirmInput.style.borderColor = '#e74c3c';
        confirmInput.style.boxShadow = '0 0 0 4px rgba(231,76,60,0.15)';
        return;
      }

      var regEmail = document.getElementById('registerEmail');
      var regEmailVal = regEmail ? regEmail.value.trim() : '';
      if (!isValidGmail(regEmailVal)) {
        showFieldError(regEmail, 'Please enter a valid Gmail address (must end with @gmail.com).');
        btn.innerHTML = originalText;
        btn.disabled = false;
        return;
      }

      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
      btn.disabled = true;

      setTimeout(function() {
        btn.innerHTML = '<i class="fas fa-check"></i> Account Created!';
        btn.style.background = '#27ae60';
        btn.style.color = '#fff';
        setTimeout(function() {
          // Persist the registered user's email/role/initials
          saveUserSession(regEmailVal, window.selectedRole === 'admin' ? 'admin' : 'user');
          window.location.href = (window.selectedRole === 'admin') ? 'admindashboard.html' : 'userdashboard.html';
        }, 1200);
      }, 1500);
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

      // Require a valid @gmail.com address
      if (!isValidGmail(input ? input.value : '')) {
        showFieldError(input, 'Please enter a valid Gmail address (must end with @gmail.com).');
        return;
      }

      var originalHtml = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i>';
      btn.style.background = '#27ae60';
      input.value = '';
      setTimeout(function() {
        btn.innerHTML = originalHtml;
        btn.style.background = '';
      }, 2000);
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
