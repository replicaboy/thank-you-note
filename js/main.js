// Main JS for Thank You page

// ==================== CONFETTI ANIMATION ====================
const confettiCanvas = document.getElementById("confetti-canvas");
const ctx = confettiCanvas.getContext("2d");
let confettiPieces = [];
let confettiAnimationId = null;

// Resize canvas to full viewport
function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

// Create individual confetti piece
function createConfettiPiece() {
  const colors = ["#ff6b9c", "#ffd166", "#06d6a0", "#4cc9f0", "#f4a261"];
  return {
    x: Math.random() * confettiCanvas.width,
    y: -10,
    size: 6 + Math.random() * 6,
    speedY: 2 + Math.random() * 3,
    speedX: -1 + Math.random() * 2,
    rotation: Math.random() * 2 * Math.PI,
    rotationSpeed: -0.1 + Math.random() * 0.2,
    color: colors[Math.floor(Math.random() * colors.length)]
  };
}

// Start confetti for a short burst (~3 seconds)
function startConfettiBurst() {
  const duration = 3000;
  const piecesCount = 120;

  confettiPieces = [];
  for (let i = 0; i < piecesCount; i++) {
    confettiPieces.push(createConfettiPiece());
  }

  const startTime = performance.now();

  if (confettiAnimationId) {
    cancelAnimationFrame(confettiAnimationId);
  }

  function animate(time) {
    const elapsed = time - startTime;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    confettiPieces.forEach((piece) => {
      piece.x += piece.speedX;
      piece.y += piece.speedY;
      piece.rotation += piece.rotationSpeed;

      if (piece.y > confettiCanvas.height + 10) {
        piece.y = -10;
      }

      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rotation);
      ctx.fillStyle = piece.color;
      ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
      ctx.restore();
    });

    if (elapsed < duration) {
      confettiAnimationId = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confettiPieces = [];
    }
  }

  confettiAnimationId = requestAnimationFrame(animate);

  // Optional: stop on interaction
  window.addEventListener(
    "click",
    () => {
      if (confettiAnimationId) {
        cancelAnimationFrame(confettiAnimationId);
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        confettiPieces = [];
      }
    },
    { once: true }
  );
}

// ==================== WISHER TOAST ====================
const wisherToast = document.getElementById("wisher-toast");

function showWisherToast(message) {
  if (!message) return;
  wisherToast.textContent = message;
  wisherToast.classList.add("visible");

  setTimeout(() => {
    wisherToast.classList.remove("visible");
  }, 1000000);
}

// ==================== LOCALSTORAGE FOR REPLIES ====================
const STORAGE_KEY = "thank_you_replies_v1";

function loadReplies() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

function saveReplies(replies) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(replies));
  } catch (e) {
    // Ignore storage errors
  }
}

// ==================== RENDER REPLIES ====================
const repliesList = document.getElementById("replies-list");

function formatTimeAgo(timestamp) {
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.round(diffMs / 60000);

  if (diffMins <= 0) return "Just now";
  if (diffMins === 1) return "1 min ago";
  if (diffMins < 60) return diffMins + " mins ago";

  const diffHours = Math.round(diffMins / 60);
  if (diffHours === 1) return "1 hour ago";
  if (diffHours < 24) return diffHours + " hours ago";

  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return "1 day ago";
  return diffDays + " days ago";
}

function renderReplies() {
  const replies = loadReplies();
  repliesList.innerHTML = "";

  if (!replies.length) {
    const empty = document.createElement("p");
    empty.textContent = "Sirf aapka message hi aapko visible hoga to jalldi se reply karein!! 😊";
    empty.className = "reply-empty";
    repliesList.appendChild(empty);
    return;
  }

  replies
    .slice()
    .reverse()
    .forEach((reply) => {
      const item = document.createElement("article");
      item.className = "reply-item";

      const header = document.createElement("div");
      header.className = "reply-item-header";

      const nameEl = document.createElement("span");
      nameEl.className = "reply-item-name";
      nameEl.textContent = reply.name;

      const timeEl = document.createElement("time");
      timeEl.className = "reply-item-time";
      timeEl.dateTime = new Date(reply.timestamp).toISOString();
      timeEl.textContent = formatTimeAgo(reply.timestamp);

      header.appendChild(nameEl);
      header.appendChild(timeEl);

      const messageEl = document.createElement("p");
      messageEl.className = "reply-item-message";
      messageEl.textContent = reply.message;

      item.appendChild(header);
      item.appendChild(messageEl);
      repliesList.appendChild(item);
    });
}

// ==================== SHARE BUTTON ====================
const shareBtn = document.getElementById("share-btn");
const shareTooltip = document.getElementById("share-tooltip");

function showShareTooltip(text) {
  shareTooltip.textContent = text;
  shareTooltip.style.opacity = "1";
  shareTooltip.style.transition = "opacity 160ms ease-out";

  setTimeout(() => {
    shareTooltip.style.opacity = "0";
  }, 1500);
}

// ==================== AUDIO TOGGLE ====================
const audio = document.getElementById("bg-audio");
const audioToggleBtn = document.getElementById("audio-toggle");
let audioEnabled = false;

function toggleAudio() {
  if (!audio) return;

  if (!audioEnabled) {
    audio
      .play()
      .then(() => {
        audioEnabled = true;
        audioToggleBtn.textContent = "🔊";
        audioToggleBtn.setAttribute("aria-pressed", "true");
      })
      .catch(() => {
        showShareTooltip("Autoplay blocked, tap again to play.");
      });
  } else {
    audio.pause();
    audioEnabled = false;
    audioToggleBtn.textContent = "🔈";
    audioToggleBtn.setAttribute("aria-pressed", "false");
  }
}

// ==================== INITIALIZATION ====================
window.addEventListener("DOMContentLoaded", () => {
  // Setup canvas
  resizeCanvas();
  
  // Start initial confetti
  startConfettiBurst();

  // Thanks button triggers confetti
  const thanksBtn = document.getElementById("thanks-btn");
  if (thanksBtn) {
    thanksBtn.addEventListener("click", () => {
      console.log("Confetti button clicked!");
      startConfettiBurst();
    });
  } else {
    console.error("Error: thanks-btn element not found in HTML!");
  }

  // Secret keyboard shortcut: T key for confetti
  window.addEventListener("keydown", (event) => {
    if (event.key === "t" || event.key === "T") {
      startConfettiBurst();
    }
  });

  // Wisher cards - hover/focus events
  const wisherCards = document.querySelectorAll(".wisher-card");
  wisherCards.forEach((card) => {
    const replyText = card.getAttribute("data-reply");

    card.addEventListener("mouseenter", () => {
      showWisherToast(replyText);
    });

    card.addEventListener("focus", () => {
      showWisherToast(replyText);
    });

    card.addEventListener("mouseleave", () => {
      wisherToast.classList.remove("visible");
    });

    card.addEventListener("blur", () => {
      wisherToast.classList.remove("visible");
    });
  });

  // Reply form submit
  const replyForm = document.getElementById("reply-form");
  if (replyForm) {
    replyForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const nameInput = document.getElementById("reply-name");
      const messageInput = document.getElementById("reply-message");

      const name = nameInput.value.trim();
      const message = messageInput.value.trim();

      if (!name || !message) return;

      const replies = loadReplies();
      replies.push({
        name,
        message,
        timestamp: Date.now()
      });
      saveReplies(replies);

      nameInput.value = "";
      messageInput.value = "";
      renderReplies();
      
      showShareTooltip("Message saved! ✅");
    });
  }

  // Show replies button
  const showRepliesBtn = document.getElementById("show-replies-btn");
  if (showRepliesBtn) {
    showRepliesBtn.addEventListener("click", () => {
      renderReplies();
    });
  }

  // Share button
  if (shareBtn) {
    shareBtn.addEventListener("click", () => {
      const url = window.location.href;

      if (navigator.share) {
        navigator
          .share({
            title: document.title,
            text: "Check out this little thank you note 💖",
            url: url
          })
          .catch(() => {
            // Ignore dismiss errors
          });
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(url)
          .then(() => {
            showShareTooltip("Link copied!");
          })
          .catch(() => {
            showShareTooltip("Copy failed, please copy manually.");
          });
      } else {
        showShareTooltip("Clipboard not supported on this browser.");
      }
    });
  }

  // Audio toggle button
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener("click", toggleAudio);
  }
});

// Handle window resize for canvas
window.addEventListener("resize", resizeCanvas);
