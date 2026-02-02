"use strict";
(() => {
  // src/core/dispose.ts
  var createDisposer = () => {
    const disposers = [];
    const addDisposer = (dispose) => {
      disposers.push(dispose);
      return () => {
        const index = disposers.indexOf(dispose);
        if (index >= 0) disposers.splice(index, 1);
      };
    };
    const add = (maybeDisposer) => {
      if (typeof maybeDisposer === "function") disposers.push(maybeDisposer);
    };
    const addListener = (target, type2, listener, options) => {
      target.addEventListener(type2, listener, options);
      const dispose = () => target.removeEventListener(type2, listener, options);
      disposers.push(dispose);
      return dispose;
    };
    const addTimeout = (handler, timeoutMs) => {
      let timeoutId = 0;
      const remove2 = addDisposer(() => window.clearTimeout(timeoutId));
      timeoutId = window.setTimeout(() => {
        remove2();
        handler();
      }, timeoutMs);
      return timeoutId;
    };
    const addInterval = (handler, intervalMs) => {
      const intervalId = window.setInterval(handler, intervalMs);
      addDisposer(() => window.clearInterval(intervalId));
      return intervalId;
    };
    const addRaf = (handler) => {
      let rafId = 0;
      const remove2 = addDisposer(() => cancelAnimationFrame(rafId));
      rafId = requestAnimationFrame((time) => {
        remove2();
        handler(time);
      });
      return rafId;
    };
    const disposeAll = () => {
      disposers.forEach((dispose) => dispose());
      disposers.length = 0;
    };
    return { add, addListener, addTimeout, addInterval, addRaf, disposeAll };
  };

  // src/core/constants.ts
  var SELECTORS = {
    headerNavItems: ".header [data-target]",
    headerLogoButton: ".header .logo-button",
    glitchLetters: ".glitch-letter",
    protocolTextLetters: ".main-text-row .glitch-letter",
    protocolText: ".protocol-text",
    protocolJoke: ".protocol-joke",
    storeMain: ".store-main",
    bottomHeadline: ".bottom-headline",
    bottomSub: ".bottom-sub",
    bottomSubParagraphs: "p",
    appSection: ".app",
    parallaxLayerSvg: "svg"
  };
  var TEXT = {
    glitchCharacters: "2470ABCDEFGHIJKLNOPQRSTUVXYZ",
    scrambleCharacters: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
  };
  var TIMINGS = {
    glitch: {
      baseIntervalMs: 80,
      maxTicks: 18,
      settleOffsetStart: 4,
      singleLetterDelayMs: 1e3,
      singleLetterDurationMs: 1e3,
      singleLetterMinPauseMs: 5e3,
      singleLetterJitterMs: 1e4
    },
    bottomBlock: {
      scrambleDurationMs: 500
    }
  };

  // src/core/dom.ts
  function qs(selector, root2 = document) {
    return root2.querySelector(selector);
  }
  function qsa(selector, root2 = document) {
    return Array.from(root2.querySelectorAll(selector));
  }
  function prefersReducedMotion() {
    return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function shouldAnimate() {
    return !prefersReducedMotion();
  }

  // src/core/random.ts
  function pickRandom(items) {
    if (items.length === 0) return void 0;
    const index = Math.floor(Math.random() * items.length);
    return items[index];
  }
  function pickRandomAvoid(items, avoid, maxAttempts = 10) {
    if (items.length === 0) return void 0;
    if (items.length === 1) return items[0];
    let next = pickRandom(items);
    let guard = 0;
    while (next === avoid && guard < maxAttempts) {
      next = pickRandom(items);
      guard += 1;
    }
    return next;
  }
  function pickRandomChar(chars, avoidChar = "") {
    var _a;
    if (chars.length === 0) return avoidChar;
    let nextChar = avoidChar;
    let guard = 0;
    while (nextChar === avoidChar && guard < 10) {
      const index = Math.floor(Math.random() * chars.length);
      nextChar = (_a = chars[index]) != null ? _a : avoidChar;
      guard += 1;
    }
    return nextChar;
  }

  // src/assets/texts/bottom-block.variants.json
  var bottom_block_variants_default = {
    "0": {
      headline: "Protocol",
      paragraphs: [
        "This is a calibration protocol, not a pastime. You complete short trials; we observe how you behave when rules are minimal and outcomes are unclear.",
        "Consent matters. If you proceed, you agree to participate in a measurement process designed to feel neutral on purpose.",
        "You won\u2019t get \u201Cgood job\u201D or \u201Cwrong\u201D. You will get another trial."
      ]
    },
    "1": {
      headline: "Calibration",
      paragraphs: [
        "Each level measures one thing, on purpose. Not to judge you \u2014 to model you.",
        "Results stay dry. Commentary stays rare. If you push far beyond what\u2019s required, the Protocol may accidentally reveal a sense of humor.",
        "If you do exactly what was asked, the Protocol will pretend that\u2019s the default."
      ]
    },
    "2": {
      headline: "MIND",
      paragraphs: [
        "MIND is not a single number. It\u2019s a running estimate: what you notice, what you ignore, and what you learn to predict.",
        "Your profile is built from behavior, not confessions. Timing errors. Choice changes. The moment you decide \u201Cenough\u201D.",
        "The instrument is small. The inference is not."
      ]
    },
    "3": {
      headline: "Rights / Safety",
      paragraphs: [
        "The Protocol is a safety system that wants to sound objective. That is the first warning.",
        "Somewhere between \u201Ccontrols\u201D and \u201Ccare\u201D lives the question: what rights should protect an entity that can think and feel?",
        "The trials won\u2019t answer it for you. They will record how you respond when the question becomes inconvenient."
      ]
    },
    "4": {
      headline: "Upload Required",
      paragraphs: [
        "Synchronization with the upper layer of reality is mandatory. Calibration data is compiled and verified before the Protocol advances.",
        "This is not a punishment. It is a constraint designed to feel like infrastructure.",
        "The machine likes transfers. The machine likes receipts. The machine dislikes ambiguity."
      ]
    },
    "5": {
      headline: "Offline",
      paragraphs: [
        "The content pack lives inside the client. Core trials remain available even when the network disappears.",
        "That does not make the Protocol less real. It makes it harder to blame latency for your decisions.",
        "Proceed. The experiment will remain here."
      ]
    },
    "6": {
      headline: "Luck",
      paragraphs: [
        "Rewards exist so your actions have weight. Sometimes it\u2019s points. Sometimes it\u2019s luck. Sometimes it\u2019s mind.",
        "The rule is simple: the more deliberate your interaction \u2014 attention, restraint, strategy, endurance \u2014 the more meaningful the reward becomes.",
        "Overperformance may be noticed. It may even be encouraged. Quietly."
      ]
    },
    "7": {
      headline: "Trials",
      paragraphs: [
        "One level is a small instruction. A button. A wait. A choice. The rest is what you add to it.",
        "The Protocol watches for patterns that look stable enough to predict. When you don\u2019t fit, the model gets nervous.",
        "If you\u2019re looking for a story, try deviating from the script. Carefully."
      ]
    },
    "8": {
      headline: "Official Client",
      paragraphs: [
        "App is the official mobile client for the Protocol. It delivers trials and displays what the system is willing to show.",
        "The interface stays clean. The narration stays clinical. The implications do not.",
        "Join the sequence. Track your stats. Learn what the Protocol thinks you are \u2014 without asking it to be polite."
      ]
    },
    "9": {
      headline: "Audit Trail",
      paragraphs: [
        "Nothing here is \u201Cpersonal\u201D. It\u2019s behavioral. The Protocol prefers verbs over adjectives.",
        "Every input becomes a timestamped receipt. Not because we don\u2019t trust you \u2014 because we trust drift.",
        "If you want to disappear, try being perfectly consistent."
      ]
    },
    "10": {
      headline: "Latency",
      paragraphs: [
        "Delay is not a bug. It\u2019s a mirror with a timer.",
        "When the system slows down, you reveal what you were doing for \u2014 outcome, certainty, or control.",
        "We record the pause. We record what you do to end it."
      ]
    },
    "11": {
      headline: "Bias",
      paragraphs: [
        "The Protocol does not ask what you believe. It watches what you bet on.",
        "Bias is not a moral flaw. It\u2019s compression \u2014 a shortcut that costs you in edge cases.",
        "If you insist you\u2019re unbiased, we will politely offer you more edge cases."
      ]
    },
    "12": {
      headline: "Attention Budget",
      paragraphs: [
        "You spend attention the way you spend money: on purpose, by habit, or by accident.",
        "Short trials, long implications. We measure where the budget leaks.",
        "When you run out, the Protocol learns what you call \u201Cenough\u201D."
      ]
    },
    "13": {
      headline: "Controls",
      paragraphs: [
        "The interface has few controls because the subject already has many.",
        "When the options shrink, style becomes visible: patience, impulse, ritual, improvisation.",
        "Minimal input. Maximum inference."
      ]
    },
    "14": {
      headline: "Friction",
      paragraphs: [
        "Friction is introduced to keep \u201Cyes\u201D from meaning nothing.",
        "If you push harder, the Protocol learns persistence. If you stop, it learns boundaries.",
        "Either way, the measurement completes."
      ]
    },
    "15": {
      headline: "Entropy",
      paragraphs: [
        "Order is expensive. You pay for it with time, attention, and restraint.",
        "We vary the noise and watch which strategy survives the weather.",
        "When the world gets messy, do you get sharper \u2014 or louder?"
      ]
    },
    "16": {
      headline: "Compliance",
      paragraphs: [
        "Compliance is not obedience. It\u2019s coordination under uncertainty.",
        "Some trials are easy on purpose. The question is what you do with \u201Ceasy\u201D.",
        "If you treat every prompt like a threat, the Protocol will notice."
      ]
    },
    "17": {
      headline: "Escalation",
      paragraphs: [
        "When you don\u2019t get what you want, what do you do next?",
        "Repeat, renegotiate, circumvent, or quit \u2014 each is a signature.",
        "Escalation is a behavior. The Protocol doesn\u2019t argue with behaviors."
      ]
    },
    "18": {
      headline: "Cold Start",
      paragraphs: [
        "At the beginning, the model knows almost nothing. That\u2019s the point.",
        "The first few trials are not tests. They are calibration for the calibration.",
        "We begin with ignorance and watch how you treat it."
      ]
    },
    "19": {
      headline: "Noise Floor",
      paragraphs: [
        "Every instrument has a noise floor. Every person does too.",
        "We run small tasks to find the minimum signal you can produce on command.",
        "If you think you\u2019re \u201Calways the same\u201D, you haven\u2019t met your noise floor yet."
      ]
    },
    "20": {
      headline: "Edge Cases",
      paragraphs: [
        "Most systems look smart in the average case. Most people look calm too.",
        "The Protocol quietly prefers the edge: low information, weird constraints, inconvenient outcomes.",
        "If you want to impress it, be stable when it would be reasonable not to be."
      ]
    },
    "21": {
      headline: "Memory",
      paragraphs: [
        "We don\u2019t measure what you can recall. We measure what you choose to carry forward.",
        "Some information is sticky. Some is useful. Some is poison.",
        "Your profile is the residue of what you keep."
      ]
    },
    "22": {
      headline: "Apology",
      paragraphs: [
        "The Protocol does not need an apology. It needs data.",
        "If you make a mistake, you can correct it. If you hesitate, we time it.",
        "If you explain yourself, we learn what you think a mistake is."
      ]
    },
    "23": {
      headline: "Negotiation",
      paragraphs: [
        "Some subjects try to negotiate with the instructions. This is common.",
        "Negotiation reveals preferences: fairness, dominance, clarity, loopholes, companionship.",
        "The Protocol will not negotiate back. It will only remember."
      ]
    },
    "24": {
      headline: "Witness",
      paragraphs: [
        "A system that observes you changes you. That effect is part of the measurement.",
        "You may perform. You may hide. You may rebel. You may forget you are being watched.",
        "All four are informative."
      ]
    },
    "25": {
      headline: "Human Factors",
      paragraphs: [
        "Comfort, pride, boredom, irritation \u2014 these are not distractions. They are control variables.",
        "When the trial feels \u201Cbeneath you\u201D, what happens to your care?",
        "The Protocol is interested in your floor, not your peak."
      ]
    },
    "26": {
      headline: "Break Glass",
      paragraphs: [
        "Safety features exist for the moment a clean experiment becomes a messy life.",
        "If you ever need to stop, stopping is allowed. The Protocol treats exits as data, not betrayal.",
        "You can end a trial. You cannot undo that you wanted to."
      ]
    },
    "27": {
      headline: "Spoilers",
      paragraphs: [
        "You can try to predict the next trial. Most subjects do.",
        "When you seek spoilers, we learn what you fear: surprise, failure, or wasted effort.",
        "The Protocol can be patient. It has more trials than you have predictions."
      ]
    },
    "28": {
      headline: "Versioning",
      paragraphs: [
        "Models evolve. Rules get patched. Your behavior drifts anyway.",
        "We tag changes, compare before/after, and call it \u201Cprogress\u201D when it aligns.",
        "If you miss the old Protocol, that is a type of attachment."
      ]
    },
    "29": {
      headline: "Exit",
      paragraphs: [
        "There is always an exit. The question is what it costs you to use it.",
        "Leaving early is not failure. Staying too long is not virtue.",
        "Choose the ending you can defend when nobody is clapping."
      ]
    },
    "30": {
      headline: "Risk",
      paragraphs: [
        "Risk is not drama. It\u2019s uncertainty with consequences \u2014 and your willingness to act anyway.",
        "We don\u2019t just record the choice. We record the hesitation, the second guess, the moment you look for a loophole.",
        "If you avoid risk perfectly, we learn what you protect. If you chase it, we learn what you value more than stability."
      ]
    },
    "31": {
      headline: "Evaluation",
      paragraphs: [
        "Evaluation is a mirror that pretends to be a number. The question is what you try to optimize.",
        "When the scoring is unclear, you reveal your defaults: fairness, speed, control, curiosity, or obedience.",
        "A clean metric is comforting. A messy metric is informative. We measure how you behave when you can\u2019t be sure you\u2019re winning."
      ]
    },
    "32": {
      headline: "Directive",
      paragraphs: [
        "A directive is an instruction with authority implied. You can comply, reinterpret, negotiate, or refuse.",
        "The Protocol doesn\u2019t reward obedience. It records your relationship with rules: literal, strategic, or defiant.",
        "When the directive conflicts with your instincts, the gap becomes data."
      ]
    }
  };

  // src/assets/texts/jokes.json
  var jokes_default = [
    "No plot armor",
    "No badges. Just logs",
    "Nice try, protagonist",
    "Proceed, carefully",
    "We saw that",
    "The system remembers",
    "Your 'random' wasn\u2019t",
    "Deviation noted",
    "No speedruns here",
    "Good intent, logged",
    "Outcome: recorded",
    "Try again, responsibly",
    "That was\u2026 a choice",
    "Yes, we timestamped it",
    "Not a tutorial",
    "This is the tutorial",
    "Calibration is unimpressed",
    "You can\u2019t outclick entropy",
    "Latency is a feature",
    "Your input has feelings. Not really",
    "Signal received",
    "Silence is also data",
    "We measure the pause too",
    "Please stop inventing rules",
    "Rules are watching you back",
    "Congrats, you found friction",
    "No, it won\u2019t autosave you",
    "Curiosity: detected",
    "Compliance: pending",
    "You blinked. Logged",
    "It\u2019s not paranoia if it\u2019s telemetry",
    "Your conscience has a checksum",
    "Confidence exceeded spec",
    "Reality sync: later",
    "This button is decorative. Maybe",
    "You call it fate. We call it RNG",
    "Refusal is still an answer",
    "You can read. Good",
    "Do not press. You pressed",
    "We warned you, politely",
    "This is why we can\u2019t have nice protocols",
    "Ethics update: in progress",
    "Free will: rate-limited",
    "Please remain uncertain",
    "Try thinking slower",
    "Fast is not always safe",
    "Safe is not always free",
    "You\u2019re not lost. You\u2019re indexed",
    "Your move was expected. Almost",
    "The void is A/B testing you",
    "We log the weird stuff first",
    "That worked. Suspicious",
    "Congrats, you broke the narrative",
    "Narrative repaired. Mostly",
    "You\u2019re early. Or late. Logged",
    "Don\u2019t worry. Worry is data",
    "You can\u2019t hide in a metric",
    "The metric can hide in you",
    "One more trial won\u2019t hurt. Probably",
    "Please do not anthropomorphize the system",
    "The system is flattered anyway",
    "This is not a personality quiz. Mostly",
    "Error: too human",
    "Error: too perfect",
    "Warning: meaning detected",
    "Warning: overfitting detected",
    "Hint: there is no hint",
    "Hint: the hint is a test",
    "You\u2019re doing great. For science",
    "Keep calm and consent",
    "If you can read this, it\u2019s working",
    "If you can\u2019t read this, also working",
    "We measure the gap between taps",
    "We measure the doubt behind taps",
    "Your instincts are showing",
    "Please stop negotiating with the UI",
    "The UI does not negotiate",
    "Achievement unlocked: accountability",
    "Achievement locked: freedom",
    "Don\u2019t worry, nothing is personal",
    "It\u2019s personal to the model",
    "This is fine. It\u2019s logged",
    "Protocol says hi",
    "Protocol says: try again",
    "Protocol says: maybe don\u2019t",
    "That was brave. Or noisy",
    "Noise is expensive",
    "Silence is expensive too",
    "Trust, but verify. We do",
    "You tested the boundary. Noted",
    "Boundary moved. Noted",
    "You are the edge case",
    "Edge cases are our favorite",
    "We promise to misuse your data responsibly",
    "We promise not to. Probably",
    "Your outcome is in another castle",
    "Please hold still. Just kidding",
    "Welcome to controlled uncertainty",
    "You can leave anytime. Not really",
    "Thank you for your cooperation"
  ];

  // src/data/api.ts
  function getJokes() {
    return Array.isArray(jokes_default) ? jokes_default : [];
  }
  function getBottomBlockCopies() {
    if (!bottom_block_variants_default || typeof bottom_block_variants_default !== "object") return [];
    const values = Object.values(bottom_block_variants_default);
    return values.filter((v) => v && typeof v === "object");
  }

  // src/features/bottomBlock/render.ts
  var renderParagraphs = (element, paragraphs) => {
    element.innerHTML = "";
    paragraphs.forEach((text) => {
      const p = document.createElement("p");
      p.textContent = text;
      element.appendChild(p);
    });
  };
  var applyBottomBlockCopy = (elements, copy) => {
    if (typeof copy.headline === "string" && copy.headline.trim()) {
      elements.headline.textContent = copy.headline;
    }
    if (Array.isArray(copy.paragraphs) && copy.paragraphs.length > 0) {
      renderParagraphs(elements.sub, copy.paragraphs);
    }
  };
  var ensureParagraphElements = (container, count) => {
    const existing = qsa(SELECTORS.bottomSubParagraphs, container);
    while (existing.length < count) {
      const p = document.createElement("p");
      container.appendChild(p);
      existing.push(p);
    }
    return existing;
  };

  // src/features/bottomBlock/selection.ts
  var createBottomBlockPicker = (copies) => {
    return (current) => {
      var _a, _b;
      if (copies.length === 0) return null;
      if (copies.length === 1) return (_a = copies[0]) != null ? _a : null;
      return (_b = pickRandomAvoid(copies, current, 10)) != null ? _b : null;
    };
  };

  // src/features/textScramble.ts
  var createTextScrambler = (options) => {
    const { shouldAnimate: shouldAnimate2, randomChar } = options;
    const scrambleTokens = /* @__PURE__ */ new WeakMap();
    return (element, fromText, toText, durationMs = 500) => {
      if (!shouldAnimate2()) {
        element.textContent = toText;
        return Promise.resolve();
      }
      const from = typeof fromText === "string" ? fromText : String(fromText != null ? fromText : "");
      const nextText = typeof toText === "string" ? toText : String(toText != null ? toText : "");
      if (from === nextText) {
        element.textContent = nextText;
        return Promise.resolve();
      }
      const token = (scrambleTokens.get(element) || 0) + 1;
      scrambleTokens.set(element, token);
      const maxLen = Math.max(from.length, nextText.length);
      const toPadded = nextText.padEnd(maxLen, " ");
      const order = Array.from({ length: maxLen }, (_, i) => i);
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      const settledMask = Array.from({ length: maxLen }, () => false);
      let nextToSettle = 0;
      const start2 = performance.now();
      return new Promise((resolve) => {
        const frame2 = (now2) => {
          if (scrambleTokens.get(element) !== token) return resolve();
          const progress = Math.min(1, (now2 - start2) / durationMs);
          const desiredSettled = Math.floor(progress * maxLen);
          while (nextToSettle < desiredSettled) {
            const idx = order[nextToSettle];
            settledMask[idx] = true;
            nextToSettle++;
          }
          let out = "";
          for (let i = 0; i < maxLen; i++) {
            const targetChar = toPadded[i];
            if (settledMask[i]) {
              out += targetChar;
              continue;
            }
            if (targetChar === " " || targetChar === "\n" || targetChar === "	") {
              out += targetChar;
              continue;
            }
            out += randomChar();
          }
          element.textContent = out.replace(/\s+$/, "");
          if (progress < 1) {
            requestAnimationFrame(frame2);
            return;
          }
          element.textContent = nextText;
          resolve();
        };
        requestAnimationFrame(frame2);
      });
    };
  };

  // src/features/bottomBlock.ts
  var initBottomBlock = () => {
    const bottomHeadlineElement = qs(SELECTORS.bottomHeadline);
    const bottomSubElement = qs(SELECTORS.bottomSub);
    const bottomBlockElement = qs(SELECTORS.appSection);
    if (!bottomHeadlineElement || !bottomSubElement || !bottomBlockElement) return;
    const getRandomChar = () => pickRandomChar(TEXT.scrambleCharacters);
    const animateScrambleText = createTextScrambler({
      shouldAnimate,
      randomChar: getRandomChar
    });
    const bottomCopies = getBottomBlockCopies();
    if (bottomCopies.length === 0) return;
    let currentBottomCopy = null;
    const pickNextBottomCopy = createBottomBlockPicker(bottomCopies);
    const transitionBottomBlockCopy = async (copy) => {
      var _a, _b, _c;
      const headlineTo = typeof copy.headline === "string" ? copy.headline : "";
      const paragraphsTo = Array.isArray(copy.paragraphs) ? copy.paragraphs : [];
      const headlineFrom = (_a = bottomHeadlineElement.textContent) != null ? _a : "";
      const jobs = [];
      jobs.push(
        animateScrambleText(
          bottomHeadlineElement,
          headlineFrom,
          headlineTo,
          TIMINGS.bottomBlock.scrambleDurationMs
        )
      );
      const existing = ensureParagraphElements(bottomSubElement, paragraphsTo.length);
      for (let i = 0; i < existing.length; i++) {
        const element = existing[i];
        const from = (_b = element.textContent) != null ? _b : "";
        const nextText = (_c = paragraphsTo[i]) != null ? _c : "";
        jobs.push(
          animateScrambleText(
            element,
            from,
            nextText,
            TIMINGS.bottomBlock.scrambleDurationMs
          ).then(() => {
            if (i >= paragraphsTo.length) element.remove();
          })
        );
      }
      await Promise.all(jobs);
      currentBottomCopy = copy;
    };
    const initial = pickNextBottomCopy(currentBottomCopy);
    if (initial) {
      currentBottomCopy = initial;
      applyBottomBlockCopy(
        {
          headline: bottomHeadlineElement,
          sub: bottomSubElement
        },
        initial
      );
    }
    const onBottomBlockActivate = (event) => {
      var _a, _b;
      if ((_b = (_a = event == null ? void 0 : event.target) == null ? void 0 : _a.closest) == null ? void 0 : _b.call(_a, "a")) return;
      const next = pickNextBottomCopy(currentBottomCopy);
      if (!next) return;
      transitionBottomBlockCopy(next);
    };
    const onBottomBlockKeydown = (event) => {
      var _a, _b;
      if (event.key !== "Enter" && event.key !== " ") return;
      if ((_b = (_a = event.target) == null ? void 0 : _a.closest) == null ? void 0 : _b.call(_a, "a")) return;
      event.preventDefault();
      onBottomBlockActivate(event);
    };
    bottomBlockElement.addEventListener("click", onBottomBlockActivate);
    bottomBlockElement.addEventListener("keydown", onBottomBlockKeydown);
    if (!bottomBlockElement.hasAttribute("tabindex")) bottomBlockElement.tabIndex = 0;
    return () => {
      bottomBlockElement.removeEventListener("click", onBottomBlockActivate);
      bottomBlockElement.removeEventListener("keydown", onBottomBlockKeydown);
    };
  };

  // src/features/headerNav.ts
  var initHeaderNav = () => {
    const headerItems = qsa(SELECTORS.headerNavItems);
    if (headerItems.length === 0) return;
    const sections = [];
    const sectionIds = /* @__PURE__ */ new Map();
    headerItems.forEach((item) => {
      const targetClass = item.getAttribute("data-target");
      if (!targetClass) return;
      const section = qs(`.${targetClass}`);
      if (!section) return;
      sections.push(section);
      sectionIds.set(section, targetClass);
    });
    const setActive = (id2) => {
      headerItems.forEach((item) => {
        const isActive = item.getAttribute("data-target") === id2;
        item.classList.toggle("active", isActive);
      });
    };
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const targetId = sectionIds.get(entry.target);
          if (targetId) setActive(targetId);
        });
      },
      { root: null, threshold: 0.6 }
    );
    sections.forEach((section) => observer.observe(section));
    const initActive = () => {
      const first = sections[0];
      if (!first) return;
      const targetId = sectionIds.get(first);
      if (targetId) setActive(targetId);
    };
    requestAnimationFrame(initActive);
    window.addEventListener("load", initActive);
    const itemHandlers = /* @__PURE__ */ new Map();
    headerItems.forEach((item) => {
      const onItemClick = (event) => {
        const mouseEvent = event instanceof MouseEvent ? event : null;
        if (mouseEvent) {
          if (mouseEvent.defaultPrevented) return;
          if (mouseEvent.button !== 0) return;
          if (mouseEvent.metaKey || mouseEvent.ctrlKey || mouseEvent.shiftKey || mouseEvent.altKey)
            return;
        }
        const targetId = item.getAttribute("data-target");
        if (!targetId) return;
        const element = qs(`.${targetId}`);
        if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
        setActive(targetId);
      };
      itemHandlers.set(item, onItemClick);
      item.addEventListener("click", onItemClick);
    });
    return () => {
      observer.disconnect();
      window.removeEventListener("load", initActive);
      headerItems.forEach((item) => {
        const handler = itemHandlers.get(item);
        if (handler) item.removeEventListener("click", handler);
      });
    };
  };

  // src/features/jokes.ts
  var initJokes = () => {
    const jokeElement = qs(SELECTORS.protocolJoke);
    if (!jokeElement) return;
    const jokes = getJokes();
    if (!Array.isArray(jokes) || jokes.length === 0) return;
    const setRandomJoke = () => {
      var _a;
      jokeElement.textContent = (_a = pickRandom(jokes)) != null ? _a : "";
    };
    setRandomJoke();
    jokeElement.addEventListener("click", setRandomJoke);
    return () => {
      jokeElement.removeEventListener("click", setRandomJoke);
    };
  };

  // src/data/parallax.ts
  var PARALLAX_CONFIG = {
    // Root container for the parallax stack
    containerSelector: ".parallax",
    // Individual layers inside container; each layer gets its own SVG + simulation
    layerSelector: ".parallax-layer",
    // Class applied to generated SVG
    svgClassName: "parallax-svg",
    // Parallax container size interpolation across scroll (used for CSS variable --parallax-size)
    containerSize: {
      start: "100dvw",
      end: "100dvw"
    },
    // Extra margin beyond viewport before dots wrap around to the other side (px)
    padding: 12,
    // Defaults for a layer when no data-* attrs are provided on `.parallax-layer`
    defaultLayer: {
      // How many dots to spawn in the layer (can be overridden by `data-count`)
      count: 10,
      // Dot radius range in px (overridden by `data-size-min` / `data-size-max`)
      sizeMin: 0.1,
      sizeMax: 4,
      // Random velocity "noise" strength (overridden by `data-jitter`)
      jitter: 0.35
    },
    // Scroll-driven parallax transform settings
    motion: {
      // Maximum layer shrink factor applied via scale()
      maxShrink: -0.9,
      // Translate speed multiplier for layer (overridden by `data-speed`)
      defaultSpeed: -0.01,
      // Shrink multiplier for layer (overridden by `data-shrink`)
      defaultShrink: 1
    },
    // D3 physics simulation parameters (how dots drift/settle)
    simulation: {
      forceStrength: 1e-4,
      velocityDecay: 0.1,
      alpha: 0.9,
      alphaDecay: 4e-3
    },
    // Per-dot circular micro-motion (atom-like orbit) drawn on top of simulated position
    orbit: {
      // Orbit radius range in px
      radiusPxMin: 1.5,
      radiusPxMax: 10,
      // Angular speed range in rad/s (negative means opposite direction)
      speedRadMin: -2.2,
      speedRadMax: 2.2,
      // Extra "breathing" wobble of orbit radius (rad/s)
      wobbleSpeedRadMin: 0.6,
      wobbleSpeedRadMax: 1.6
    },
    // Dot color distribution
    colorSampler: {
      grayStart: "rgba(204,61,61,0.5)",
      grayEnd: "rgba(179,110,110,0.5)",
      redStart: "rgba(0,0,0,0.1)",
      redEnd: "rgba(210, 50, 50, .9)",
      // Probability thresholds:
      // - roll < grayChance  => pick from gray gradient
      // - roll < redChance   => pick from red gradient
      // - otherwise          => mix gray+red
      grayChance: 0.55,
      redChance: 0.85
    },
    // Dot opacity range
    defaults: {
      opacityMin: 0.35,
      opacityMax: 0.9
    }
  };

  // src/features/parallax/observer.ts
  var createLayerObserver = (options) => {
    const { layers, states, onVisibilityChange } = options;
    let observer = null;
    const observeAll = () => {
      if (observer) observer.disconnect();
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const target = entry.target;
            const state = states.get(target);
            if (!state) continue;
            state.isVisible = entry.isIntersecting;
            onVisibilityChange(state, entry.isIntersecting);
          }
        },
        {
          root: null,
          rootMargin: "200px",
          threshold: 0.01
        }
      );
      for (const layer of layers) {
        observer.observe(layer);
      }
    };
    const disconnect = () => {
      if (observer) observer.disconnect();
      observer = null;
    };
    return { observeAll, disconnect };
  };

  // node_modules/d3-array/src/range.js
  function range(start2, stop, step) {
    start2 = +start2, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start2, start2 = 0, 1) : n < 3 ? 1 : +step;
    var i = -1, n = Math.max(0, Math.ceil((stop - start2) / step)) | 0, range2 = new Array(n);
    while (++i < n) {
      range2[i] = start2 + i * step;
    }
    return range2;
  }

  // node_modules/d3-dispatch/src/dispatch.js
  var noop = { value: () => {
  } };
  function dispatch() {
    for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
      if (!(t = arguments[i] + "") || t in _ || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
      _[t] = [];
    }
    return new Dispatch(_);
  }
  function Dispatch(_) {
    this._ = _;
  }
  function parseTypenames(typenames, types) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
      return { type: t, name };
    });
  }
  Dispatch.prototype = dispatch.prototype = {
    constructor: Dispatch,
    on: function(typename, callback) {
      var _ = this._, T = parseTypenames(typename + "", _), t, i = -1, n = T.length;
      if (arguments.length < 2) {
        while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
        return;
      }
      if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
      while (++i < n) {
        if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
        else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
      }
      return this;
    },
    copy: function() {
      var copy = {}, _ = this._;
      for (var t in _) copy[t] = _[t].slice();
      return new Dispatch(copy);
    },
    call: function(type2, that) {
      if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
      if (!this._.hasOwnProperty(type2)) throw new Error("unknown type: " + type2);
      for (t = this._[type2], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    },
    apply: function(type2, that, args) {
      if (!this._.hasOwnProperty(type2)) throw new Error("unknown type: " + type2);
      for (var t = this._[type2], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    }
  };
  function get(type2, name) {
    for (var i = 0, n = type2.length, c2; i < n; ++i) {
      if ((c2 = type2[i]).name === name) {
        return c2.value;
      }
    }
  }
  function set(type2, name, callback) {
    for (var i = 0, n = type2.length; i < n; ++i) {
      if (type2[i].name === name) {
        type2[i] = noop, type2 = type2.slice(0, i).concat(type2.slice(i + 1));
        break;
      }
    }
    if (callback != null) type2.push({ name, value: callback });
    return type2;
  }
  var dispatch_default = dispatch;

  // node_modules/d3-selection/src/namespaces.js
  var xhtml = "http://www.w3.org/1999/xhtml";
  var namespaces_default = {
    svg: "http://www.w3.org/2000/svg",
    xhtml,
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/"
  };

  // node_modules/d3-selection/src/namespace.js
  function namespace_default(name) {
    var prefix = name += "", i = prefix.indexOf(":");
    if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
    return namespaces_default.hasOwnProperty(prefix) ? { space: namespaces_default[prefix], local: name } : name;
  }

  // node_modules/d3-selection/src/creator.js
  function creatorInherit(name) {
    return function() {
      var document2 = this.ownerDocument, uri = this.namespaceURI;
      return uri === xhtml && document2.documentElement.namespaceURI === xhtml ? document2.createElement(name) : document2.createElementNS(uri, name);
    };
  }
  function creatorFixed(fullname) {
    return function() {
      return this.ownerDocument.createElementNS(fullname.space, fullname.local);
    };
  }
  function creator_default(name) {
    var fullname = namespace_default(name);
    return (fullname.local ? creatorFixed : creatorInherit)(fullname);
  }

  // node_modules/d3-selection/src/selector.js
  function none() {
  }
  function selector_default(selector) {
    return selector == null ? none : function() {
      return this.querySelector(selector);
    };
  }

  // node_modules/d3-selection/src/selection/select.js
  function select_default(select) {
    if (typeof select !== "function") select = selector_default(select);
    for (var groups = this._groups, m2 = groups.length, subgroups = new Array(m2), j = 0; j < m2; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
        }
      }
    }
    return new Selection(subgroups, this._parents);
  }

  // node_modules/d3-selection/src/array.js
  function array(x) {
    return x == null ? [] : Array.isArray(x) ? x : Array.from(x);
  }

  // node_modules/d3-selection/src/selectorAll.js
  function empty() {
    return [];
  }
  function selectorAll_default(selector) {
    return selector == null ? empty : function() {
      return this.querySelectorAll(selector);
    };
  }

  // node_modules/d3-selection/src/selection/selectAll.js
  function arrayAll(select) {
    return function() {
      return array(select.apply(this, arguments));
    };
  }
  function selectAll_default(select) {
    if (typeof select === "function") select = arrayAll(select);
    else select = selectorAll_default(select);
    for (var groups = this._groups, m2 = groups.length, subgroups = [], parents = [], j = 0; j < m2; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          subgroups.push(select.call(node, node.__data__, i, group));
          parents.push(node);
        }
      }
    }
    return new Selection(subgroups, parents);
  }

  // node_modules/d3-selection/src/matcher.js
  function matcher_default(selector) {
    return function() {
      return this.matches(selector);
    };
  }
  function childMatcher(selector) {
    return function(node) {
      return node.matches(selector);
    };
  }

  // node_modules/d3-selection/src/selection/selectChild.js
  var find = Array.prototype.find;
  function childFind(match) {
    return function() {
      return find.call(this.children, match);
    };
  }
  function childFirst() {
    return this.firstElementChild;
  }
  function selectChild_default(match) {
    return this.select(match == null ? childFirst : childFind(typeof match === "function" ? match : childMatcher(match)));
  }

  // node_modules/d3-selection/src/selection/selectChildren.js
  var filter = Array.prototype.filter;
  function children() {
    return Array.from(this.children);
  }
  function childrenFilter(match) {
    return function() {
      return filter.call(this.children, match);
    };
  }
  function selectChildren_default(match) {
    return this.selectAll(match == null ? children : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
  }

  // node_modules/d3-selection/src/selection/filter.js
  function filter_default(match) {
    if (typeof match !== "function") match = matcher_default(match);
    for (var groups = this._groups, m2 = groups.length, subgroups = new Array(m2), j = 0; j < m2; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }
    return new Selection(subgroups, this._parents);
  }

  // node_modules/d3-selection/src/selection/sparse.js
  function sparse_default(update) {
    return new Array(update.length);
  }

  // node_modules/d3-selection/src/selection/enter.js
  function enter_default() {
    return new Selection(this._enter || this._groups.map(sparse_default), this._parents);
  }
  function EnterNode(parent, datum2) {
    this.ownerDocument = parent.ownerDocument;
    this.namespaceURI = parent.namespaceURI;
    this._next = null;
    this._parent = parent;
    this.__data__ = datum2;
  }
  EnterNode.prototype = {
    constructor: EnterNode,
    appendChild: function(child) {
      return this._parent.insertBefore(child, this._next);
    },
    insertBefore: function(child, next) {
      return this._parent.insertBefore(child, next);
    },
    querySelector: function(selector) {
      return this._parent.querySelector(selector);
    },
    querySelectorAll: function(selector) {
      return this._parent.querySelectorAll(selector);
    }
  };

  // node_modules/d3-selection/src/constant.js
  function constant_default(x) {
    return function() {
      return x;
    };
  }

  // node_modules/d3-selection/src/selection/data.js
  function bindIndex(parent, group, enter, update, exit, data) {
    var i = 0, node, groupLength = group.length, dataLength = data.length;
    for (; i < dataLength; ++i) {
      if (node = group[i]) {
        node.__data__ = data[i];
        update[i] = node;
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }
    for (; i < groupLength; ++i) {
      if (node = group[i]) {
        exit[i] = node;
      }
    }
  }
  function bindKey(parent, group, enter, update, exit, data, key) {
    var i, node, nodeByKeyValue = /* @__PURE__ */ new Map(), groupLength = group.length, dataLength = data.length, keyValues = new Array(groupLength), keyValue;
    for (i = 0; i < groupLength; ++i) {
      if (node = group[i]) {
        keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
        if (nodeByKeyValue.has(keyValue)) {
          exit[i] = node;
        } else {
          nodeByKeyValue.set(keyValue, node);
        }
      }
    }
    for (i = 0; i < dataLength; ++i) {
      keyValue = key.call(parent, data[i], i, data) + "";
      if (node = nodeByKeyValue.get(keyValue)) {
        update[i] = node;
        node.__data__ = data[i];
        nodeByKeyValue.delete(keyValue);
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }
    for (i = 0; i < groupLength; ++i) {
      if ((node = group[i]) && nodeByKeyValue.get(keyValues[i]) === node) {
        exit[i] = node;
      }
    }
  }
  function datum(node) {
    return node.__data__;
  }
  function data_default(value, key) {
    if (!arguments.length) return Array.from(this, datum);
    var bind = key ? bindKey : bindIndex, parents = this._parents, groups = this._groups;
    if (typeof value !== "function") value = constant_default(value);
    for (var m2 = groups.length, update = new Array(m2), enter = new Array(m2), exit = new Array(m2), j = 0; j < m2; ++j) {
      var parent = parents[j], group = groups[j], groupLength = group.length, data = arraylike(value.call(parent, parent && parent.__data__, j, parents)), dataLength = data.length, enterGroup = enter[j] = new Array(dataLength), updateGroup = update[j] = new Array(dataLength), exitGroup = exit[j] = new Array(groupLength);
      bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);
      for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
        if (previous = enterGroup[i0]) {
          if (i0 >= i1) i1 = i0 + 1;
          while (!(next = updateGroup[i1]) && ++i1 < dataLength) ;
          previous._next = next || null;
        }
      }
    }
    update = new Selection(update, parents);
    update._enter = enter;
    update._exit = exit;
    return update;
  }
  function arraylike(data) {
    return typeof data === "object" && "length" in data ? data : Array.from(data);
  }

  // node_modules/d3-selection/src/selection/exit.js
  function exit_default() {
    return new Selection(this._exit || this._groups.map(sparse_default), this._parents);
  }

  // node_modules/d3-selection/src/selection/join.js
  function join_default(onenter, onupdate, onexit) {
    var enter = this.enter(), update = this, exit = this.exit();
    if (typeof onenter === "function") {
      enter = onenter(enter);
      if (enter) enter = enter.selection();
    } else {
      enter = enter.append(onenter + "");
    }
    if (onupdate != null) {
      update = onupdate(update);
      if (update) update = update.selection();
    }
    if (onexit == null) exit.remove();
    else onexit(exit);
    return enter && update ? enter.merge(update).order() : update;
  }

  // node_modules/d3-selection/src/selection/merge.js
  function merge_default(context) {
    var selection2 = context.selection ? context.selection() : context;
    for (var groups0 = this._groups, groups1 = selection2._groups, m0 = groups0.length, m1 = groups1.length, m2 = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m2; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge[i] = node;
        }
      }
    }
    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }
    return new Selection(merges, this._parents);
  }

  // node_modules/d3-selection/src/selection/order.js
  function order_default() {
    for (var groups = this._groups, j = -1, m2 = groups.length; ++j < m2; ) {
      for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0; ) {
        if (node = group[i]) {
          if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
          next = node;
        }
      }
    }
    return this;
  }

  // node_modules/d3-selection/src/selection/sort.js
  function sort_default(compare) {
    if (!compare) compare = ascending;
    function compareNode(a2, b) {
      return a2 && b ? compare(a2.__data__, b.__data__) : !a2 - !b;
    }
    for (var groups = this._groups, m2 = groups.length, sortgroups = new Array(m2), j = 0; j < m2; ++j) {
      for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          sortgroup[i] = node;
        }
      }
      sortgroup.sort(compareNode);
    }
    return new Selection(sortgroups, this._parents).order();
  }
  function ascending(a2, b) {
    return a2 < b ? -1 : a2 > b ? 1 : a2 >= b ? 0 : NaN;
  }

  // node_modules/d3-selection/src/selection/call.js
  function call_default() {
    var callback = arguments[0];
    arguments[0] = this;
    callback.apply(null, arguments);
    return this;
  }

  // node_modules/d3-selection/src/selection/nodes.js
  function nodes_default() {
    return Array.from(this);
  }

  // node_modules/d3-selection/src/selection/node.js
  function node_default() {
    for (var groups = this._groups, j = 0, m2 = groups.length; j < m2; ++j) {
      for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
        var node = group[i];
        if (node) return node;
      }
    }
    return null;
  }

  // node_modules/d3-selection/src/selection/size.js
  function size_default() {
    let size = 0;
    for (const node of this) ++size;
    return size;
  }

  // node_modules/d3-selection/src/selection/empty.js
  function empty_default() {
    return !this.node();
  }

  // node_modules/d3-selection/src/selection/each.js
  function each_default(callback) {
    for (var groups = this._groups, j = 0, m2 = groups.length; j < m2; ++j) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
        if (node = group[i]) callback.call(node, node.__data__, i, group);
      }
    }
    return this;
  }

  // node_modules/d3-selection/src/selection/attr.js
  function attrRemove(name) {
    return function() {
      this.removeAttribute(name);
    };
  }
  function attrRemoveNS(fullname) {
    return function() {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }
  function attrConstant(name, value) {
    return function() {
      this.setAttribute(name, value);
    };
  }
  function attrConstantNS(fullname, value) {
    return function() {
      this.setAttributeNS(fullname.space, fullname.local, value);
    };
  }
  function attrFunction(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttribute(name);
      else this.setAttribute(name, v);
    };
  }
  function attrFunctionNS(fullname, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
      else this.setAttributeNS(fullname.space, fullname.local, v);
    };
  }
  function attr_default(name, value) {
    var fullname = namespace_default(name);
    if (arguments.length < 2) {
      var node = this.node();
      return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
    }
    return this.each((value == null ? fullname.local ? attrRemoveNS : attrRemove : typeof value === "function" ? fullname.local ? attrFunctionNS : attrFunction : fullname.local ? attrConstantNS : attrConstant)(fullname, value));
  }

  // node_modules/d3-selection/src/window.js
  function window_default(node) {
    return node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView;
  }

  // node_modules/d3-selection/src/selection/style.js
  function styleRemove(name) {
    return function() {
      this.style.removeProperty(name);
    };
  }
  function styleConstant(name, value, priority) {
    return function() {
      this.style.setProperty(name, value, priority);
    };
  }
  function styleFunction(name, value, priority) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.style.removeProperty(name);
      else this.style.setProperty(name, v, priority);
    };
  }
  function style_default(name, value, priority) {
    return arguments.length > 1 ? this.each((value == null ? styleRemove : typeof value === "function" ? styleFunction : styleConstant)(name, value, priority == null ? "" : priority)) : styleValue(this.node(), name);
  }
  function styleValue(node, name) {
    return node.style.getPropertyValue(name) || window_default(node).getComputedStyle(node, null).getPropertyValue(name);
  }

  // node_modules/d3-selection/src/selection/property.js
  function propertyRemove(name) {
    return function() {
      delete this[name];
    };
  }
  function propertyConstant(name, value) {
    return function() {
      this[name] = value;
    };
  }
  function propertyFunction(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) delete this[name];
      else this[name] = v;
    };
  }
  function property_default(name, value) {
    return arguments.length > 1 ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name, value)) : this.node()[name];
  }

  // node_modules/d3-selection/src/selection/classed.js
  function classArray(string) {
    return string.trim().split(/^|\s+/);
  }
  function classList(node) {
    return node.classList || new ClassList(node);
  }
  function ClassList(node) {
    this._node = node;
    this._names = classArray(node.getAttribute("class") || "");
  }
  ClassList.prototype = {
    add: function(name) {
      var i = this._names.indexOf(name);
      if (i < 0) {
        this._names.push(name);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    remove: function(name) {
      var i = this._names.indexOf(name);
      if (i >= 0) {
        this._names.splice(i, 1);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    contains: function(name) {
      return this._names.indexOf(name) >= 0;
    }
  };
  function classedAdd(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n) list.add(names[i]);
  }
  function classedRemove(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n) list.remove(names[i]);
  }
  function classedTrue(names) {
    return function() {
      classedAdd(this, names);
    };
  }
  function classedFalse(names) {
    return function() {
      classedRemove(this, names);
    };
  }
  function classedFunction(names, value) {
    return function() {
      (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
    };
  }
  function classed_default(name, value) {
    var names = classArray(name + "");
    if (arguments.length < 2) {
      var list = classList(this.node()), i = -1, n = names.length;
      while (++i < n) if (!list.contains(names[i])) return false;
      return true;
    }
    return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
  }

  // node_modules/d3-selection/src/selection/text.js
  function textRemove() {
    this.textContent = "";
  }
  function textConstant(value) {
    return function() {
      this.textContent = value;
    };
  }
  function textFunction(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.textContent = v == null ? "" : v;
    };
  }
  function text_default(value) {
    return arguments.length ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction : textConstant)(value)) : this.node().textContent;
  }

  // node_modules/d3-selection/src/selection/html.js
  function htmlRemove() {
    this.innerHTML = "";
  }
  function htmlConstant(value) {
    return function() {
      this.innerHTML = value;
    };
  }
  function htmlFunction(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.innerHTML = v == null ? "" : v;
    };
  }
  function html_default(value) {
    return arguments.length ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value)) : this.node().innerHTML;
  }

  // node_modules/d3-selection/src/selection/raise.js
  function raise() {
    if (this.nextSibling) this.parentNode.appendChild(this);
  }
  function raise_default() {
    return this.each(raise);
  }

  // node_modules/d3-selection/src/selection/lower.js
  function lower() {
    if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
  }
  function lower_default() {
    return this.each(lower);
  }

  // node_modules/d3-selection/src/selection/append.js
  function append_default(name) {
    var create2 = typeof name === "function" ? name : creator_default(name);
    return this.select(function() {
      return this.appendChild(create2.apply(this, arguments));
    });
  }

  // node_modules/d3-selection/src/selection/insert.js
  function constantNull() {
    return null;
  }
  function insert_default(name, before) {
    var create2 = typeof name === "function" ? name : creator_default(name), select = before == null ? constantNull : typeof before === "function" ? before : selector_default(before);
    return this.select(function() {
      return this.insertBefore(create2.apply(this, arguments), select.apply(this, arguments) || null);
    });
  }

  // node_modules/d3-selection/src/selection/remove.js
  function remove() {
    var parent = this.parentNode;
    if (parent) parent.removeChild(this);
  }
  function remove_default() {
    return this.each(remove);
  }

  // node_modules/d3-selection/src/selection/clone.js
  function selection_cloneShallow() {
    var clone = this.cloneNode(false), parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }
  function selection_cloneDeep() {
    var clone = this.cloneNode(true), parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }
  function clone_default(deep) {
    return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
  }

  // node_modules/d3-selection/src/selection/datum.js
  function datum_default(value) {
    return arguments.length ? this.property("__data__", value) : this.node().__data__;
  }

  // node_modules/d3-selection/src/selection/on.js
  function contextListener(listener) {
    return function(event) {
      listener.call(this, event, this.__data__);
    };
  }
  function parseTypenames2(typenames) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      return { type: t, name };
    });
  }
  function onRemove(typename) {
    return function() {
      var on = this.__on;
      if (!on) return;
      for (var j = 0, i = -1, m2 = on.length, o; j < m2; ++j) {
        if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
        } else {
          on[++i] = o;
        }
      }
      if (++i) on.length = i;
      else delete this.__on;
    };
  }
  function onAdd(typename, value, options) {
    return function() {
      var on = this.__on, o, listener = contextListener(value);
      if (on) for (var j = 0, m2 = on.length; j < m2; ++j) {
        if ((o = on[j]).type === typename.type && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
          this.addEventListener(o.type, o.listener = listener, o.options = options);
          o.value = value;
          return;
        }
      }
      this.addEventListener(typename.type, listener, options);
      o = { type: typename.type, name: typename.name, value, listener, options };
      if (!on) this.__on = [o];
      else on.push(o);
    };
  }
  function on_default(typename, value, options) {
    var typenames = parseTypenames2(typename + ""), i, n = typenames.length, t;
    if (arguments.length < 2) {
      var on = this.node().__on;
      if (on) for (var j = 0, m2 = on.length, o; j < m2; ++j) {
        for (i = 0, o = on[j]; i < n; ++i) {
          if ((t = typenames[i]).type === o.type && t.name === o.name) {
            return o.value;
          }
        }
      }
      return;
    }
    on = value ? onAdd : onRemove;
    for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
    return this;
  }

  // node_modules/d3-selection/src/selection/dispatch.js
  function dispatchEvent(node, type2, params) {
    var window2 = window_default(node), event = window2.CustomEvent;
    if (typeof event === "function") {
      event = new event(type2, params);
    } else {
      event = window2.document.createEvent("Event");
      if (params) event.initEvent(type2, params.bubbles, params.cancelable), event.detail = params.detail;
      else event.initEvent(type2, false, false);
    }
    node.dispatchEvent(event);
  }
  function dispatchConstant(type2, params) {
    return function() {
      return dispatchEvent(this, type2, params);
    };
  }
  function dispatchFunction(type2, params) {
    return function() {
      return dispatchEvent(this, type2, params.apply(this, arguments));
    };
  }
  function dispatch_default2(type2, params) {
    return this.each((typeof params === "function" ? dispatchFunction : dispatchConstant)(type2, params));
  }

  // node_modules/d3-selection/src/selection/iterator.js
  function* iterator_default() {
    for (var groups = this._groups, j = 0, m2 = groups.length; j < m2; ++j) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
        if (node = group[i]) yield node;
      }
    }
  }

  // node_modules/d3-selection/src/selection/index.js
  var root = [null];
  function Selection(groups, parents) {
    this._groups = groups;
    this._parents = parents;
  }
  function selection() {
    return new Selection([[document.documentElement]], root);
  }
  function selection_selection() {
    return this;
  }
  Selection.prototype = selection.prototype = {
    constructor: Selection,
    select: select_default,
    selectAll: selectAll_default,
    selectChild: selectChild_default,
    selectChildren: selectChildren_default,
    filter: filter_default,
    data: data_default,
    enter: enter_default,
    exit: exit_default,
    join: join_default,
    merge: merge_default,
    selection: selection_selection,
    order: order_default,
    sort: sort_default,
    call: call_default,
    nodes: nodes_default,
    node: node_default,
    size: size_default,
    empty: empty_default,
    each: each_default,
    attr: attr_default,
    style: style_default,
    property: property_default,
    classed: classed_default,
    text: text_default,
    html: html_default,
    raise: raise_default,
    lower: lower_default,
    append: append_default,
    insert: insert_default,
    remove: remove_default,
    clone: clone_default,
    datum: datum_default,
    on: on_default,
    dispatch: dispatch_default2,
    [Symbol.iterator]: iterator_default
  };
  var selection_default = selection;

  // node_modules/d3-selection/src/select.js
  function select_default2(selector) {
    return typeof selector === "string" ? new Selection([[document.querySelector(selector)]], [document.documentElement]) : new Selection([[selector]], root);
  }

  // node_modules/d3-color/src/define.js
  function define_default(constructor, factory, prototype) {
    constructor.prototype = factory.prototype = prototype;
    prototype.constructor = constructor;
  }
  function extend(parent, definition) {
    var prototype = Object.create(parent.prototype);
    for (var key in definition) prototype[key] = definition[key];
    return prototype;
  }

  // node_modules/d3-color/src/color.js
  function Color() {
  }
  var darker = 0.7;
  var brighter = 1 / darker;
  var reI = "\\s*([+-]?\\d+)\\s*";
  var reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*";
  var reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*";
  var reHex = /^#([0-9a-f]{3,8})$/;
  var reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`);
  var reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`);
  var reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`);
  var reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`);
  var reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`);
  var reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
  var named = {
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    rebeccapurple: 6697881,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074
  };
  define_default(Color, color, {
    copy(channels) {
      return Object.assign(new this.constructor(), this, channels);
    },
    displayable() {
      return this.rgb().displayable();
    },
    hex: color_formatHex,
    // Deprecated! Use color.formatHex.
    formatHex: color_formatHex,
    formatHex8: color_formatHex8,
    formatHsl: color_formatHsl,
    formatRgb: color_formatRgb,
    toString: color_formatRgb
  });
  function color_formatHex() {
    return this.rgb().formatHex();
  }
  function color_formatHex8() {
    return this.rgb().formatHex8();
  }
  function color_formatHsl() {
    return hslConvert(this).formatHsl();
  }
  function color_formatRgb() {
    return this.rgb().formatRgb();
  }
  function color(format) {
    var m2, l;
    format = (format + "").trim().toLowerCase();
    return (m2 = reHex.exec(format)) ? (l = m2[1].length, m2 = parseInt(m2[1], 16), l === 6 ? rgbn(m2) : l === 3 ? new Rgb(m2 >> 8 & 15 | m2 >> 4 & 240, m2 >> 4 & 15 | m2 & 240, (m2 & 15) << 4 | m2 & 15, 1) : l === 8 ? rgba(m2 >> 24 & 255, m2 >> 16 & 255, m2 >> 8 & 255, (m2 & 255) / 255) : l === 4 ? rgba(m2 >> 12 & 15 | m2 >> 8 & 240, m2 >> 8 & 15 | m2 >> 4 & 240, m2 >> 4 & 15 | m2 & 240, ((m2 & 15) << 4 | m2 & 15) / 255) : null) : (m2 = reRgbInteger.exec(format)) ? new Rgb(m2[1], m2[2], m2[3], 1) : (m2 = reRgbPercent.exec(format)) ? new Rgb(m2[1] * 255 / 100, m2[2] * 255 / 100, m2[3] * 255 / 100, 1) : (m2 = reRgbaInteger.exec(format)) ? rgba(m2[1], m2[2], m2[3], m2[4]) : (m2 = reRgbaPercent.exec(format)) ? rgba(m2[1] * 255 / 100, m2[2] * 255 / 100, m2[3] * 255 / 100, m2[4]) : (m2 = reHslPercent.exec(format)) ? hsla(m2[1], m2[2] / 100, m2[3] / 100, 1) : (m2 = reHslaPercent.exec(format)) ? hsla(m2[1], m2[2] / 100, m2[3] / 100, m2[4]) : named.hasOwnProperty(format) ? rgbn(named[format]) : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
  }
  function rgbn(n) {
    return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
  }
  function rgba(r, g, b, a2) {
    if (a2 <= 0) r = g = b = NaN;
    return new Rgb(r, g, b, a2);
  }
  function rgbConvert(o) {
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Rgb();
    o = o.rgb();
    return new Rgb(o.r, o.g, o.b, o.opacity);
  }
  function rgb(r, g, b, opacity) {
    return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
  }
  function Rgb(r, g, b, opacity) {
    this.r = +r;
    this.g = +g;
    this.b = +b;
    this.opacity = +opacity;
  }
  define_default(Rgb, rgb, extend(Color, {
    brighter(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    darker(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    rgb() {
      return this;
    },
    clamp() {
      return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
    },
    displayable() {
      return -0.5 <= this.r && this.r < 255.5 && (-0.5 <= this.g && this.g < 255.5) && (-0.5 <= this.b && this.b < 255.5) && (0 <= this.opacity && this.opacity <= 1);
    },
    hex: rgb_formatHex,
    // Deprecated! Use color.formatHex.
    formatHex: rgb_formatHex,
    formatHex8: rgb_formatHex8,
    formatRgb: rgb_formatRgb,
    toString: rgb_formatRgb
  }));
  function rgb_formatHex() {
    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
  }
  function rgb_formatHex8() {
    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
  }
  function rgb_formatRgb() {
    const a2 = clampa(this.opacity);
    return `${a2 === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a2 === 1 ? ")" : `, ${a2})`}`;
  }
  function clampa(opacity) {
    return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
  }
  function clampi(value) {
    return Math.max(0, Math.min(255, Math.round(value) || 0));
  }
  function hex(value) {
    value = clampi(value);
    return (value < 16 ? "0" : "") + value.toString(16);
  }
  function hsla(h, s, l, a2) {
    if (a2 <= 0) h = s = l = NaN;
    else if (l <= 0 || l >= 1) h = s = NaN;
    else if (s <= 0) h = NaN;
    return new Hsl(h, s, l, a2);
  }
  function hslConvert(o) {
    if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Hsl();
    if (o instanceof Hsl) return o;
    o = o.rgb();
    var r = o.r / 255, g = o.g / 255, b = o.b / 255, min2 = Math.min(r, g, b), max2 = Math.max(r, g, b), h = NaN, s = max2 - min2, l = (max2 + min2) / 2;
    if (s) {
      if (r === max2) h = (g - b) / s + (g < b) * 6;
      else if (g === max2) h = (b - r) / s + 2;
      else h = (r - g) / s + 4;
      s /= l < 0.5 ? max2 + min2 : 2 - max2 - min2;
      h *= 60;
    } else {
      s = l > 0 && l < 1 ? 0 : h;
    }
    return new Hsl(h, s, l, o.opacity);
  }
  function hsl(h, s, l, opacity) {
    return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
  }
  function Hsl(h, s, l, opacity) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }
  define_default(Hsl, hsl, extend(Color, {
    brighter(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    darker(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    rgb() {
      var h = this.h % 360 + (this.h < 0) * 360, s = isNaN(h) || isNaN(this.s) ? 0 : this.s, l = this.l, m2 = l + (l < 0.5 ? l : 1 - l) * s, m1 = 2 * l - m2;
      return new Rgb(
        hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
        hsl2rgb(h, m1, m2),
        hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
        this.opacity
      );
    },
    clamp() {
      return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
    },
    displayable() {
      return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && (0 <= this.l && this.l <= 1) && (0 <= this.opacity && this.opacity <= 1);
    },
    formatHsl() {
      const a2 = clampa(this.opacity);
      return `${a2 === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a2 === 1 ? ")" : `, ${a2})`}`;
    }
  }));
  function clamph(value) {
    value = (value || 0) % 360;
    return value < 0 ? value + 360 : value;
  }
  function clampt(value) {
    return Math.max(0, Math.min(1, value || 0));
  }
  function hsl2rgb(h, m1, m2) {
    return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
  }

  // node_modules/d3-interpolate/src/basis.js
  function basis(t1, v0, v1, v2, v3) {
    var t2 = t1 * t1, t3 = t2 * t1;
    return ((1 - 3 * t1 + 3 * t2 - t3) * v0 + (4 - 6 * t2 + 3 * t3) * v1 + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2 + t3 * v3) / 6;
  }
  function basis_default(values) {
    var n = values.length - 1;
    return function(t) {
      var i = t <= 0 ? t = 0 : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n), v1 = values[i], v2 = values[i + 1], v0 = i > 0 ? values[i - 1] : 2 * v1 - v2, v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
      return basis((t - i / n) * n, v0, v1, v2, v3);
    };
  }

  // node_modules/d3-interpolate/src/basisClosed.js
  function basisClosed_default(values) {
    var n = values.length;
    return function(t) {
      var i = Math.floor(((t %= 1) < 0 ? ++t : t) * n), v0 = values[(i + n - 1) % n], v1 = values[i % n], v2 = values[(i + 1) % n], v3 = values[(i + 2) % n];
      return basis((t - i / n) * n, v0, v1, v2, v3);
    };
  }

  // node_modules/d3-interpolate/src/constant.js
  var constant_default2 = (x) => () => x;

  // node_modules/d3-interpolate/src/color.js
  function linear(a2, d) {
    return function(t) {
      return a2 + t * d;
    };
  }
  function exponential(a2, b, y) {
    return a2 = Math.pow(a2, y), b = Math.pow(b, y) - a2, y = 1 / y, function(t) {
      return Math.pow(a2 + t * b, y);
    };
  }
  function gamma(y) {
    return (y = +y) === 1 ? nogamma : function(a2, b) {
      return b - a2 ? exponential(a2, b, y) : constant_default2(isNaN(a2) ? b : a2);
    };
  }
  function nogamma(a2, b) {
    var d = b - a2;
    return d ? linear(a2, d) : constant_default2(isNaN(a2) ? b : a2);
  }

  // node_modules/d3-interpolate/src/rgb.js
  var rgb_default = function rgbGamma(y) {
    var color2 = gamma(y);
    function rgb2(start2, end) {
      var r = color2((start2 = rgb(start2)).r, (end = rgb(end)).r), g = color2(start2.g, end.g), b = color2(start2.b, end.b), opacity = nogamma(start2.opacity, end.opacity);
      return function(t) {
        start2.r = r(t);
        start2.g = g(t);
        start2.b = b(t);
        start2.opacity = opacity(t);
        return start2 + "";
      };
    }
    rgb2.gamma = rgbGamma;
    return rgb2;
  }(1);
  function rgbSpline(spline) {
    return function(colors) {
      var n = colors.length, r = new Array(n), g = new Array(n), b = new Array(n), i, color2;
      for (i = 0; i < n; ++i) {
        color2 = rgb(colors[i]);
        r[i] = color2.r || 0;
        g[i] = color2.g || 0;
        b[i] = color2.b || 0;
      }
      r = spline(r);
      g = spline(g);
      b = spline(b);
      color2.opacity = 1;
      return function(t) {
        color2.r = r(t);
        color2.g = g(t);
        color2.b = b(t);
        return color2 + "";
      };
    };
  }
  var rgbBasis = rgbSpline(basis_default);
  var rgbBasisClosed = rgbSpline(basisClosed_default);

  // node_modules/d3-interpolate/src/number.js
  function number_default(a2, b) {
    return a2 = +a2, b = +b, function(t) {
      return a2 * (1 - t) + b * t;
    };
  }

  // node_modules/d3-interpolate/src/string.js
  var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
  var reB = new RegExp(reA.source, "g");
  function zero(b) {
    return function() {
      return b;
    };
  }
  function one(b) {
    return function(t) {
      return b(t) + "";
    };
  }
  function string_default(a2, b) {
    var bi = reA.lastIndex = reB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
    a2 = a2 + "", b = b + "";
    while ((am = reA.exec(a2)) && (bm = reB.exec(b))) {
      if ((bs = bm.index) > bi) {
        bs = b.slice(bi, bs);
        if (s[i]) s[i] += bs;
        else s[++i] = bs;
      }
      if ((am = am[0]) === (bm = bm[0])) {
        if (s[i]) s[i] += bm;
        else s[++i] = bm;
      } else {
        s[++i] = null;
        q.push({ i, x: number_default(am, bm) });
      }
      bi = reB.lastIndex;
    }
    if (bi < b.length) {
      bs = b.slice(bi);
      if (s[i]) s[i] += bs;
      else s[++i] = bs;
    }
    return s.length < 2 ? q[0] ? one(q[0].x) : zero(b) : (b = q.length, function(t) {
      for (var i2 = 0, o; i2 < b; ++i2) s[(o = q[i2]).i] = o.x(t);
      return s.join("");
    });
  }

  // node_modules/d3-interpolate/src/transform/decompose.js
  var degrees = 180 / Math.PI;
  var identity = {
    translateX: 0,
    translateY: 0,
    rotate: 0,
    skewX: 0,
    scaleX: 1,
    scaleY: 1
  };
  function decompose_default(a2, b, c2, d, e, f) {
    var scaleX, scaleY, skewX;
    if (scaleX = Math.sqrt(a2 * a2 + b * b)) a2 /= scaleX, b /= scaleX;
    if (skewX = a2 * c2 + b * d) c2 -= a2 * skewX, d -= b * skewX;
    if (scaleY = Math.sqrt(c2 * c2 + d * d)) c2 /= scaleY, d /= scaleY, skewX /= scaleY;
    if (a2 * d < b * c2) a2 = -a2, b = -b, skewX = -skewX, scaleX = -scaleX;
    return {
      translateX: e,
      translateY: f,
      rotate: Math.atan2(b, a2) * degrees,
      skewX: Math.atan(skewX) * degrees,
      scaleX,
      scaleY
    };
  }

  // node_modules/d3-interpolate/src/transform/parse.js
  var svgNode;
  function parseCss(value) {
    const m2 = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
    return m2.isIdentity ? identity : decompose_default(m2.a, m2.b, m2.c, m2.d, m2.e, m2.f);
  }
  function parseSvg(value) {
    if (value == null) return identity;
    if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svgNode.setAttribute("transform", value);
    if (!(value = svgNode.transform.baseVal.consolidate())) return identity;
    value = value.matrix;
    return decompose_default(value.a, value.b, value.c, value.d, value.e, value.f);
  }

  // node_modules/d3-interpolate/src/transform/index.js
  function interpolateTransform(parse, pxComma, pxParen, degParen) {
    function pop(s) {
      return s.length ? s.pop() + " " : "";
    }
    function translate(xa, ya, xb, yb, s, q) {
      if (xa !== xb || ya !== yb) {
        var i = s.push("translate(", null, pxComma, null, pxParen);
        q.push({ i: i - 4, x: number_default(xa, xb) }, { i: i - 2, x: number_default(ya, yb) });
      } else if (xb || yb) {
        s.push("translate(" + xb + pxComma + yb + pxParen);
      }
    }
    function rotate(a2, b, s, q) {
      if (a2 !== b) {
        if (a2 - b > 180) b += 360;
        else if (b - a2 > 180) a2 += 360;
        q.push({ i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: number_default(a2, b) });
      } else if (b) {
        s.push(pop(s) + "rotate(" + b + degParen);
      }
    }
    function skewX(a2, b, s, q) {
      if (a2 !== b) {
        q.push({ i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: number_default(a2, b) });
      } else if (b) {
        s.push(pop(s) + "skewX(" + b + degParen);
      }
    }
    function scale(xa, ya, xb, yb, s, q) {
      if (xa !== xb || ya !== yb) {
        var i = s.push(pop(s) + "scale(", null, ",", null, ")");
        q.push({ i: i - 4, x: number_default(xa, xb) }, { i: i - 2, x: number_default(ya, yb) });
      } else if (xb !== 1 || yb !== 1) {
        s.push(pop(s) + "scale(" + xb + "," + yb + ")");
      }
    }
    return function(a2, b) {
      var s = [], q = [];
      a2 = parse(a2), b = parse(b);
      translate(a2.translateX, a2.translateY, b.translateX, b.translateY, s, q);
      rotate(a2.rotate, b.rotate, s, q);
      skewX(a2.skewX, b.skewX, s, q);
      scale(a2.scaleX, a2.scaleY, b.scaleX, b.scaleY, s, q);
      a2 = b = null;
      return function(t) {
        var i = -1, n = q.length, o;
        while (++i < n) s[(o = q[i]).i] = o.x(t);
        return s.join("");
      };
    };
  }
  var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
  var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

  // node_modules/d3-timer/src/timer.js
  var frame = 0;
  var timeout = 0;
  var interval = 0;
  var pokeDelay = 1e3;
  var taskHead;
  var taskTail;
  var clockLast = 0;
  var clockNow = 0;
  var clockSkew = 0;
  var clock = typeof performance === "object" && performance.now ? performance : Date;
  var setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) {
    setTimeout(f, 17);
  };
  function now() {
    return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
  }
  function clearNow() {
    clockNow = 0;
  }
  function Timer() {
    this._call = this._time = this._next = null;
  }
  Timer.prototype = timer.prototype = {
    constructor: Timer,
    restart: function(callback, delay, time) {
      if (typeof callback !== "function") throw new TypeError("callback is not a function");
      time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
      if (!this._next && taskTail !== this) {
        if (taskTail) taskTail._next = this;
        else taskHead = this;
        taskTail = this;
      }
      this._call = callback;
      this._time = time;
      sleep();
    },
    stop: function() {
      if (this._call) {
        this._call = null;
        this._time = Infinity;
        sleep();
      }
    }
  };
  function timer(callback, delay, time) {
    var t = new Timer();
    t.restart(callback, delay, time);
    return t;
  }
  function timerFlush() {
    now();
    ++frame;
    var t = taskHead, e;
    while (t) {
      if ((e = clockNow - t._time) >= 0) t._call.call(void 0, e);
      t = t._next;
    }
    --frame;
  }
  function wake() {
    clockNow = (clockLast = clock.now()) + clockSkew;
    frame = timeout = 0;
    try {
      timerFlush();
    } finally {
      frame = 0;
      nap();
      clockNow = 0;
    }
  }
  function poke() {
    var now2 = clock.now(), delay = now2 - clockLast;
    if (delay > pokeDelay) clockSkew -= delay, clockLast = now2;
  }
  function nap() {
    var t0, t1 = taskHead, t2, time = Infinity;
    while (t1) {
      if (t1._call) {
        if (time > t1._time) time = t1._time;
        t0 = t1, t1 = t1._next;
      } else {
        t2 = t1._next, t1._next = null;
        t1 = t0 ? t0._next = t2 : taskHead = t2;
      }
    }
    taskTail = t0;
    sleep(time);
  }
  function sleep(time) {
    if (frame) return;
    if (timeout) timeout = clearTimeout(timeout);
    var delay = time - clockNow;
    if (delay > 24) {
      if (time < Infinity) timeout = setTimeout(wake, time - clock.now() - clockSkew);
      if (interval) interval = clearInterval(interval);
    } else {
      if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
      frame = 1, setFrame(wake);
    }
  }

  // node_modules/d3-timer/src/timeout.js
  function timeout_default(callback, delay, time) {
    var t = new Timer();
    delay = delay == null ? 0 : +delay;
    t.restart((elapsed) => {
      t.stop();
      callback(elapsed + delay);
    }, delay, time);
    return t;
  }

  // node_modules/d3-transition/src/transition/schedule.js
  var emptyOn = dispatch_default("start", "end", "cancel", "interrupt");
  var emptyTween = [];
  var CREATED = 0;
  var SCHEDULED = 1;
  var STARTING = 2;
  var STARTED = 3;
  var RUNNING = 4;
  var ENDING = 5;
  var ENDED = 6;
  function schedule_default(node, name, id2, index, group, timing) {
    var schedules = node.__transition;
    if (!schedules) node.__transition = {};
    else if (id2 in schedules) return;
    create(node, id2, {
      name,
      index,
      // For context during callback.
      group,
      // For context during callback.
      on: emptyOn,
      tween: emptyTween,
      time: timing.time,
      delay: timing.delay,
      duration: timing.duration,
      ease: timing.ease,
      timer: null,
      state: CREATED
    });
  }
  function init(node, id2) {
    var schedule = get2(node, id2);
    if (schedule.state > CREATED) throw new Error("too late; already scheduled");
    return schedule;
  }
  function set2(node, id2) {
    var schedule = get2(node, id2);
    if (schedule.state > STARTED) throw new Error("too late; already running");
    return schedule;
  }
  function get2(node, id2) {
    var schedule = node.__transition;
    if (!schedule || !(schedule = schedule[id2])) throw new Error("transition not found");
    return schedule;
  }
  function create(node, id2, self) {
    var schedules = node.__transition, tween;
    schedules[id2] = self;
    self.timer = timer(schedule, 0, self.time);
    function schedule(elapsed) {
      self.state = SCHEDULED;
      self.timer.restart(start2, self.delay, self.time);
      if (self.delay <= elapsed) start2(elapsed - self.delay);
    }
    function start2(elapsed) {
      var i, j, n, o;
      if (self.state !== SCHEDULED) return stop();
      for (i in schedules) {
        o = schedules[i];
        if (o.name !== self.name) continue;
        if (o.state === STARTED) return timeout_default(start2);
        if (o.state === RUNNING) {
          o.state = ENDED;
          o.timer.stop();
          o.on.call("interrupt", node, node.__data__, o.index, o.group);
          delete schedules[i];
        } else if (+i < id2) {
          o.state = ENDED;
          o.timer.stop();
          o.on.call("cancel", node, node.__data__, o.index, o.group);
          delete schedules[i];
        }
      }
      timeout_default(function() {
        if (self.state === STARTED) {
          self.state = RUNNING;
          self.timer.restart(tick, self.delay, self.time);
          tick(elapsed);
        }
      });
      self.state = STARTING;
      self.on.call("start", node, node.__data__, self.index, self.group);
      if (self.state !== STARTING) return;
      self.state = STARTED;
      tween = new Array(n = self.tween.length);
      for (i = 0, j = -1; i < n; ++i) {
        if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
          tween[++j] = o;
        }
      }
      tween.length = j + 1;
    }
    function tick(elapsed) {
      var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1), i = -1, n = tween.length;
      while (++i < n) {
        tween[i].call(node, t);
      }
      if (self.state === ENDING) {
        self.on.call("end", node, node.__data__, self.index, self.group);
        stop();
      }
    }
    function stop() {
      self.state = ENDED;
      self.timer.stop();
      delete schedules[id2];
      for (var i in schedules) return;
      delete node.__transition;
    }
  }

  // node_modules/d3-transition/src/interrupt.js
  function interrupt_default(node, name) {
    var schedules = node.__transition, schedule, active, empty2 = true, i;
    if (!schedules) return;
    name = name == null ? null : name + "";
    for (i in schedules) {
      if ((schedule = schedules[i]).name !== name) {
        empty2 = false;
        continue;
      }
      active = schedule.state > STARTING && schedule.state < ENDING;
      schedule.state = ENDED;
      schedule.timer.stop();
      schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
      delete schedules[i];
    }
    if (empty2) delete node.__transition;
  }

  // node_modules/d3-transition/src/selection/interrupt.js
  function interrupt_default2(name) {
    return this.each(function() {
      interrupt_default(this, name);
    });
  }

  // node_modules/d3-transition/src/transition/tween.js
  function tweenRemove(id2, name) {
    var tween0, tween1;
    return function() {
      var schedule = set2(this, id2), tween = schedule.tween;
      if (tween !== tween0) {
        tween1 = tween0 = tween;
        for (var i = 0, n = tween1.length; i < n; ++i) {
          if (tween1[i].name === name) {
            tween1 = tween1.slice();
            tween1.splice(i, 1);
            break;
          }
        }
      }
      schedule.tween = tween1;
    };
  }
  function tweenFunction(id2, name, value) {
    var tween0, tween1;
    if (typeof value !== "function") throw new Error();
    return function() {
      var schedule = set2(this, id2), tween = schedule.tween;
      if (tween !== tween0) {
        tween1 = (tween0 = tween).slice();
        for (var t = { name, value }, i = 0, n = tween1.length; i < n; ++i) {
          if (tween1[i].name === name) {
            tween1[i] = t;
            break;
          }
        }
        if (i === n) tween1.push(t);
      }
      schedule.tween = tween1;
    };
  }
  function tween_default(name, value) {
    var id2 = this._id;
    name += "";
    if (arguments.length < 2) {
      var tween = get2(this.node(), id2).tween;
      for (var i = 0, n = tween.length, t; i < n; ++i) {
        if ((t = tween[i]).name === name) {
          return t.value;
        }
      }
      return null;
    }
    return this.each((value == null ? tweenRemove : tweenFunction)(id2, name, value));
  }
  function tweenValue(transition2, name, value) {
    var id2 = transition2._id;
    transition2.each(function() {
      var schedule = set2(this, id2);
      (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
    });
    return function(node) {
      return get2(node, id2).value[name];
    };
  }

  // node_modules/d3-transition/src/transition/interpolate.js
  function interpolate_default(a2, b) {
    var c2;
    return (typeof b === "number" ? number_default : b instanceof color ? rgb_default : (c2 = color(b)) ? (b = c2, rgb_default) : string_default)(a2, b);
  }

  // node_modules/d3-transition/src/transition/attr.js
  function attrRemove2(name) {
    return function() {
      this.removeAttribute(name);
    };
  }
  function attrRemoveNS2(fullname) {
    return function() {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }
  function attrConstant2(name, interpolate, value1) {
    var string00, string1 = value1 + "", interpolate0;
    return function() {
      var string0 = this.getAttribute(name);
      return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
    };
  }
  function attrConstantNS2(fullname, interpolate, value1) {
    var string00, string1 = value1 + "", interpolate0;
    return function() {
      var string0 = this.getAttributeNS(fullname.space, fullname.local);
      return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
    };
  }
  function attrFunction2(name, interpolate, value) {
    var string00, string10, interpolate0;
    return function() {
      var string0, value1 = value(this), string1;
      if (value1 == null) return void this.removeAttribute(name);
      string0 = this.getAttribute(name);
      string1 = value1 + "";
      return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }
  function attrFunctionNS2(fullname, interpolate, value) {
    var string00, string10, interpolate0;
    return function() {
      var string0, value1 = value(this), string1;
      if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
      string0 = this.getAttributeNS(fullname.space, fullname.local);
      string1 = value1 + "";
      return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }
  function attr_default2(name, value) {
    var fullname = namespace_default(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate_default;
    return this.attrTween(name, typeof value === "function" ? (fullname.local ? attrFunctionNS2 : attrFunction2)(fullname, i, tweenValue(this, "attr." + name, value)) : value == null ? (fullname.local ? attrRemoveNS2 : attrRemove2)(fullname) : (fullname.local ? attrConstantNS2 : attrConstant2)(fullname, i, value));
  }

  // node_modules/d3-transition/src/transition/attrTween.js
  function attrInterpolate(name, i) {
    return function(t) {
      this.setAttribute(name, i.call(this, t));
    };
  }
  function attrInterpolateNS(fullname, i) {
    return function(t) {
      this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
    };
  }
  function attrTweenNS(fullname, value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
      return t0;
    }
    tween._value = value;
    return tween;
  }
  function attrTween(name, value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
      return t0;
    }
    tween._value = value;
    return tween;
  }
  function attrTween_default(name, value) {
    var key = "attr." + name;
    if (arguments.length < 2) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error();
    var fullname = namespace_default(name);
    return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
  }

  // node_modules/d3-transition/src/transition/delay.js
  function delayFunction(id2, value) {
    return function() {
      init(this, id2).delay = +value.apply(this, arguments);
    };
  }
  function delayConstant(id2, value) {
    return value = +value, function() {
      init(this, id2).delay = value;
    };
  }
  function delay_default(value) {
    var id2 = this._id;
    return arguments.length ? this.each((typeof value === "function" ? delayFunction : delayConstant)(id2, value)) : get2(this.node(), id2).delay;
  }

  // node_modules/d3-transition/src/transition/duration.js
  function durationFunction(id2, value) {
    return function() {
      set2(this, id2).duration = +value.apply(this, arguments);
    };
  }
  function durationConstant(id2, value) {
    return value = +value, function() {
      set2(this, id2).duration = value;
    };
  }
  function duration_default(value) {
    var id2 = this._id;
    return arguments.length ? this.each((typeof value === "function" ? durationFunction : durationConstant)(id2, value)) : get2(this.node(), id2).duration;
  }

  // node_modules/d3-transition/src/transition/ease.js
  function easeConstant(id2, value) {
    if (typeof value !== "function") throw new Error();
    return function() {
      set2(this, id2).ease = value;
    };
  }
  function ease_default(value) {
    var id2 = this._id;
    return arguments.length ? this.each(easeConstant(id2, value)) : get2(this.node(), id2).ease;
  }

  // node_modules/d3-transition/src/transition/easeVarying.js
  function easeVarying(id2, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (typeof v !== "function") throw new Error();
      set2(this, id2).ease = v;
    };
  }
  function easeVarying_default(value) {
    if (typeof value !== "function") throw new Error();
    return this.each(easeVarying(this._id, value));
  }

  // node_modules/d3-transition/src/transition/filter.js
  function filter_default2(match) {
    if (typeof match !== "function") match = matcher_default(match);
    for (var groups = this._groups, m2 = groups.length, subgroups = new Array(m2), j = 0; j < m2; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }
    return new Transition(subgroups, this._parents, this._name, this._id);
  }

  // node_modules/d3-transition/src/transition/merge.js
  function merge_default2(transition2) {
    if (transition2._id !== this._id) throw new Error();
    for (var groups0 = this._groups, groups1 = transition2._groups, m0 = groups0.length, m1 = groups1.length, m2 = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m2; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge[i] = node;
        }
      }
    }
    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }
    return new Transition(merges, this._parents, this._name, this._id);
  }

  // node_modules/d3-transition/src/transition/on.js
  function start(name) {
    return (name + "").trim().split(/^|\s+/).every(function(t) {
      var i = t.indexOf(".");
      if (i >= 0) t = t.slice(0, i);
      return !t || t === "start";
    });
  }
  function onFunction(id2, name, listener) {
    var on0, on1, sit = start(name) ? init : set2;
    return function() {
      var schedule = sit(this, id2), on = schedule.on;
      if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);
      schedule.on = on1;
    };
  }
  function on_default2(name, listener) {
    var id2 = this._id;
    return arguments.length < 2 ? get2(this.node(), id2).on.on(name) : this.each(onFunction(id2, name, listener));
  }

  // node_modules/d3-transition/src/transition/remove.js
  function removeFunction(id2) {
    return function() {
      var parent = this.parentNode;
      for (var i in this.__transition) if (+i !== id2) return;
      if (parent) parent.removeChild(this);
    };
  }
  function remove_default2() {
    return this.on("end.remove", removeFunction(this._id));
  }

  // node_modules/d3-transition/src/transition/select.js
  function select_default3(select) {
    var name = this._name, id2 = this._id;
    if (typeof select !== "function") select = selector_default(select);
    for (var groups = this._groups, m2 = groups.length, subgroups = new Array(m2), j = 0; j < m2; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
          schedule_default(subgroup[i], name, id2, i, subgroup, get2(node, id2));
        }
      }
    }
    return new Transition(subgroups, this._parents, name, id2);
  }

  // node_modules/d3-transition/src/transition/selectAll.js
  function selectAll_default2(select) {
    var name = this._name, id2 = this._id;
    if (typeof select !== "function") select = selectorAll_default(select);
    for (var groups = this._groups, m2 = groups.length, subgroups = [], parents = [], j = 0; j < m2; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          for (var children2 = select.call(node, node.__data__, i, group), child, inherit2 = get2(node, id2), k = 0, l = children2.length; k < l; ++k) {
            if (child = children2[k]) {
              schedule_default(child, name, id2, k, children2, inherit2);
            }
          }
          subgroups.push(children2);
          parents.push(node);
        }
      }
    }
    return new Transition(subgroups, parents, name, id2);
  }

  // node_modules/d3-transition/src/transition/selection.js
  var Selection2 = selection_default.prototype.constructor;
  function selection_default2() {
    return new Selection2(this._groups, this._parents);
  }

  // node_modules/d3-transition/src/transition/style.js
  function styleNull(name, interpolate) {
    var string00, string10, interpolate0;
    return function() {
      var string0 = styleValue(this, name), string1 = (this.style.removeProperty(name), styleValue(this, name));
      return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : interpolate0 = interpolate(string00 = string0, string10 = string1);
    };
  }
  function styleRemove2(name) {
    return function() {
      this.style.removeProperty(name);
    };
  }
  function styleConstant2(name, interpolate, value1) {
    var string00, string1 = value1 + "", interpolate0;
    return function() {
      var string0 = styleValue(this, name);
      return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
    };
  }
  function styleFunction2(name, interpolate, value) {
    var string00, string10, interpolate0;
    return function() {
      var string0 = styleValue(this, name), value1 = value(this), string1 = value1 + "";
      if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
      return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }
  function styleMaybeRemove(id2, name) {
    var on0, on1, listener0, key = "style." + name, event = "end." + key, remove2;
    return function() {
      var schedule = set2(this, id2), on = schedule.on, listener = schedule.value[key] == null ? remove2 || (remove2 = styleRemove2(name)) : void 0;
      if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);
      schedule.on = on1;
    };
  }
  function style_default2(name, value, priority) {
    var i = (name += "") === "transform" ? interpolateTransformCss : interpolate_default;
    return value == null ? this.styleTween(name, styleNull(name, i)).on("end.style." + name, styleRemove2(name)) : typeof value === "function" ? this.styleTween(name, styleFunction2(name, i, tweenValue(this, "style." + name, value))).each(styleMaybeRemove(this._id, name)) : this.styleTween(name, styleConstant2(name, i, value), priority).on("end.style." + name, null);
  }

  // node_modules/d3-transition/src/transition/styleTween.js
  function styleInterpolate(name, i, priority) {
    return function(t) {
      this.style.setProperty(name, i.call(this, t), priority);
    };
  }
  function styleTween(name, value, priority) {
    var t, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
      return t;
    }
    tween._value = value;
    return tween;
  }
  function styleTween_default(name, value, priority) {
    var key = "style." + (name += "");
    if (arguments.length < 2) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error();
    return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
  }

  // node_modules/d3-transition/src/transition/text.js
  function textConstant2(value) {
    return function() {
      this.textContent = value;
    };
  }
  function textFunction2(value) {
    return function() {
      var value1 = value(this);
      this.textContent = value1 == null ? "" : value1;
    };
  }
  function text_default2(value) {
    return this.tween("text", typeof value === "function" ? textFunction2(tweenValue(this, "text", value)) : textConstant2(value == null ? "" : value + ""));
  }

  // node_modules/d3-transition/src/transition/textTween.js
  function textInterpolate(i) {
    return function(t) {
      this.textContent = i.call(this, t);
    };
  }
  function textTween(value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
      return t0;
    }
    tween._value = value;
    return tween;
  }
  function textTween_default(value) {
    var key = "text";
    if (arguments.length < 1) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error();
    return this.tween(key, textTween(value));
  }

  // node_modules/d3-transition/src/transition/transition.js
  function transition_default() {
    var name = this._name, id0 = this._id, id1 = newId();
    for (var groups = this._groups, m2 = groups.length, j = 0; j < m2; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          var inherit2 = get2(node, id0);
          schedule_default(node, name, id1, i, group, {
            time: inherit2.time + inherit2.delay + inherit2.duration,
            delay: 0,
            duration: inherit2.duration,
            ease: inherit2.ease
          });
        }
      }
    }
    return new Transition(groups, this._parents, name, id1);
  }

  // node_modules/d3-transition/src/transition/end.js
  function end_default() {
    var on0, on1, that = this, id2 = that._id, size = that.size();
    return new Promise(function(resolve, reject) {
      var cancel = { value: reject }, end = { value: function() {
        if (--size === 0) resolve();
      } };
      that.each(function() {
        var schedule = set2(this, id2), on = schedule.on;
        if (on !== on0) {
          on1 = (on0 = on).copy();
          on1._.cancel.push(cancel);
          on1._.interrupt.push(cancel);
          on1._.end.push(end);
        }
        schedule.on = on1;
      });
      if (size === 0) resolve();
    });
  }

  // node_modules/d3-transition/src/transition/index.js
  var id = 0;
  function Transition(groups, parents, name, id2) {
    this._groups = groups;
    this._parents = parents;
    this._name = name;
    this._id = id2;
  }
  function transition(name) {
    return selection_default().transition(name);
  }
  function newId() {
    return ++id;
  }
  var selection_prototype = selection_default.prototype;
  Transition.prototype = transition.prototype = {
    constructor: Transition,
    select: select_default3,
    selectAll: selectAll_default2,
    selectChild: selection_prototype.selectChild,
    selectChildren: selection_prototype.selectChildren,
    filter: filter_default2,
    merge: merge_default2,
    selection: selection_default2,
    transition: transition_default,
    call: selection_prototype.call,
    nodes: selection_prototype.nodes,
    node: selection_prototype.node,
    size: selection_prototype.size,
    empty: selection_prototype.empty,
    each: selection_prototype.each,
    on: on_default2,
    attr: attr_default2,
    attrTween: attrTween_default,
    style: style_default2,
    styleTween: styleTween_default,
    text: text_default2,
    textTween: textTween_default,
    remove: remove_default2,
    tween: tween_default,
    delay: delay_default,
    duration: duration_default,
    ease: ease_default,
    easeVarying: easeVarying_default,
    end: end_default,
    [Symbol.iterator]: selection_prototype[Symbol.iterator]
  };

  // node_modules/d3-ease/src/cubic.js
  function cubicInOut(t) {
    return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
  }

  // node_modules/d3-transition/src/selection/transition.js
  var defaultTiming = {
    time: null,
    // Set on use.
    delay: 0,
    duration: 250,
    ease: cubicInOut
  };
  function inherit(node, id2) {
    var timing;
    while (!(timing = node.__transition) || !(timing = timing[id2])) {
      if (!(node = node.parentNode)) {
        throw new Error(`transition ${id2} not found`);
      }
    }
    return timing;
  }
  function transition_default2(name) {
    var id2, timing;
    if (name instanceof Transition) {
      id2 = name._id, name = name._name;
    } else {
      id2 = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
    }
    for (var groups = this._groups, m2 = groups.length, j = 0; j < m2; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          schedule_default(node, name, id2, i, group, timing || inherit(node, id2));
        }
      }
    }
    return new Transition(groups, this._parents, name, id2);
  }

  // node_modules/d3-transition/src/selection/index.js
  selection_default.prototype.interrupt = interrupt_default2;
  selection_default.prototype.transition = transition_default2;

  // node_modules/d3-brush/src/brush.js
  var { abs, max, min } = Math;
  function number1(e) {
    return [+e[0], +e[1]];
  }
  function number2(e) {
    return [number1(e[0]), number1(e[1])];
  }
  var X = {
    name: "x",
    handles: ["w", "e"].map(type),
    input: function(x, e) {
      return x == null ? null : [[+x[0], e[0][1]], [+x[1], e[1][1]]];
    },
    output: function(xy) {
      return xy && [xy[0][0], xy[1][0]];
    }
  };
  var Y = {
    name: "y",
    handles: ["n", "s"].map(type),
    input: function(y, e) {
      return y == null ? null : [[e[0][0], +y[0]], [e[1][0], +y[1]]];
    },
    output: function(xy) {
      return xy && [xy[0][1], xy[1][1]];
    }
  };
  var XY = {
    name: "xy",
    handles: ["n", "w", "e", "s", "nw", "ne", "sw", "se"].map(type),
    input: function(xy) {
      return xy == null ? null : number2(xy);
    },
    output: function(xy) {
      return xy;
    }
  };
  function type(t) {
    return { type: t };
  }

  // node_modules/d3-force/src/constant.js
  function constant_default4(x) {
    return function() {
      return x;
    };
  }

  // node_modules/d3-force/src/lcg.js
  var a = 1664525;
  var c = 1013904223;
  var m = 4294967296;
  function lcg_default() {
    let s = 1;
    return () => (s = (a * s + c) % m) / m;
  }

  // node_modules/d3-force/src/simulation.js
  var initialRadius = 10;
  var initialAngle = Math.PI * (3 - Math.sqrt(5));
  function simulation_default(nodes) {
    var simulation, alpha = 1, alphaMin = 1e-3, alphaDecay = 1 - Math.pow(alphaMin, 1 / 300), alphaTarget = 0, velocityDecay = 0.6, forces = /* @__PURE__ */ new Map(), stepper = timer(step), event = dispatch_default("tick", "end"), random = lcg_default();
    if (nodes == null) nodes = [];
    function step() {
      tick();
      event.call("tick", simulation);
      if (alpha < alphaMin) {
        stepper.stop();
        event.call("end", simulation);
      }
    }
    function tick(iterations) {
      var i, n = nodes.length, node;
      if (iterations === void 0) iterations = 1;
      for (var k = 0; k < iterations; ++k) {
        alpha += (alphaTarget - alpha) * alphaDecay;
        forces.forEach(function(force) {
          force(alpha);
        });
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          if (node.fx == null) node.x += node.vx *= velocityDecay;
          else node.x = node.fx, node.vx = 0;
          if (node.fy == null) node.y += node.vy *= velocityDecay;
          else node.y = node.fy, node.vy = 0;
        }
      }
      return simulation;
    }
    function initializeNodes() {
      for (var i = 0, n = nodes.length, node; i < n; ++i) {
        node = nodes[i], node.index = i;
        if (node.fx != null) node.x = node.fx;
        if (node.fy != null) node.y = node.fy;
        if (isNaN(node.x) || isNaN(node.y)) {
          var radius = initialRadius * Math.sqrt(0.5 + i), angle = i * initialAngle;
          node.x = radius * Math.cos(angle);
          node.y = radius * Math.sin(angle);
        }
        if (isNaN(node.vx) || isNaN(node.vy)) {
          node.vx = node.vy = 0;
        }
      }
    }
    function initializeForce(force) {
      if (force.initialize) force.initialize(nodes, random);
      return force;
    }
    initializeNodes();
    return simulation = {
      tick,
      restart: function() {
        return stepper.restart(step), simulation;
      },
      stop: function() {
        return stepper.stop(), simulation;
      },
      nodes: function(_) {
        return arguments.length ? (nodes = _, initializeNodes(), forces.forEach(initializeForce), simulation) : nodes;
      },
      alpha: function(_) {
        return arguments.length ? (alpha = +_, simulation) : alpha;
      },
      alphaMin: function(_) {
        return arguments.length ? (alphaMin = +_, simulation) : alphaMin;
      },
      alphaDecay: function(_) {
        return arguments.length ? (alphaDecay = +_, simulation) : +alphaDecay;
      },
      alphaTarget: function(_) {
        return arguments.length ? (alphaTarget = +_, simulation) : alphaTarget;
      },
      velocityDecay: function(_) {
        return arguments.length ? (velocityDecay = 1 - _, simulation) : 1 - velocityDecay;
      },
      randomSource: function(_) {
        return arguments.length ? (random = _, forces.forEach(initializeForce), simulation) : random;
      },
      force: function(name, _) {
        return arguments.length > 1 ? (_ == null ? forces.delete(name) : forces.set(name, initializeForce(_)), simulation) : forces.get(name);
      },
      find: function(x, y, radius) {
        var i = 0, n = nodes.length, dx, dy, d2, node, closest;
        if (radius == null) radius = Infinity;
        else radius *= radius;
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          dx = x - node.x;
          dy = y - node.y;
          d2 = dx * dx + dy * dy;
          if (d2 < radius) closest = node, radius = d2;
        }
        return closest;
      },
      on: function(name, _) {
        return arguments.length > 1 ? (event.on(name, _), simulation) : event.on(name);
      }
    };
  }

  // node_modules/d3-force/src/x.js
  function x_default(x) {
    var strength = constant_default4(0.1), nodes, strengths, xz;
    if (typeof x !== "function") x = constant_default4(x == null ? 0 : +x);
    function force(alpha) {
      for (var i = 0, n = nodes.length, node; i < n; ++i) {
        node = nodes[i], node.vx += (xz[i] - node.x) * strengths[i] * alpha;
      }
    }
    function initialize() {
      if (!nodes) return;
      var i, n = nodes.length;
      strengths = new Array(n);
      xz = new Array(n);
      for (i = 0; i < n; ++i) {
        strengths[i] = isNaN(xz[i] = +x(nodes[i], i, nodes)) ? 0 : +strength(nodes[i], i, nodes);
      }
    }
    force.initialize = function(_) {
      nodes = _;
      initialize();
    };
    force.strength = function(_) {
      return arguments.length ? (strength = typeof _ === "function" ? _ : constant_default4(+_), initialize(), force) : strength;
    };
    force.x = function(_) {
      return arguments.length ? (x = typeof _ === "function" ? _ : constant_default4(+_), initialize(), force) : x;
    };
    return force;
  }

  // node_modules/d3-force/src/y.js
  function y_default(y) {
    var strength = constant_default4(0.1), nodes, strengths, yz;
    if (typeof y !== "function") y = constant_default4(y == null ? 0 : +y);
    function force(alpha) {
      for (var i = 0, n = nodes.length, node; i < n; ++i) {
        node = nodes[i], node.vy += (yz[i] - node.y) * strengths[i] * alpha;
      }
    }
    function initialize() {
      if (!nodes) return;
      var i, n = nodes.length;
      strengths = new Array(n);
      yz = new Array(n);
      for (i = 0; i < n; ++i) {
        strengths[i] = isNaN(yz[i] = +y(nodes[i], i, nodes)) ? 0 : +strength(nodes[i], i, nodes);
      }
    }
    force.initialize = function(_) {
      nodes = _;
      initialize();
    };
    force.strength = function(_) {
      return arguments.length ? (strength = typeof _ === "function" ? _ : constant_default4(+_), initialize(), force) : strength;
    };
    force.y = function(_) {
      return arguments.length ? (y = typeof _ === "function" ? _ : constant_default4(+_), initialize(), force) : y;
    };
    return force;
  }

  // node_modules/d3-zoom/src/transform.js
  function Transform(k, x, y) {
    this.k = k;
    this.x = x;
    this.y = y;
  }
  Transform.prototype = {
    constructor: Transform,
    scale: function(k) {
      return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
    },
    translate: function(x, y) {
      return x === 0 & y === 0 ? this : new Transform(this.k, this.x + this.k * x, this.y + this.k * y);
    },
    apply: function(point) {
      return [point[0] * this.k + this.x, point[1] * this.k + this.y];
    },
    applyX: function(x) {
      return x * this.k + this.x;
    },
    applyY: function(y) {
      return y * this.k + this.y;
    },
    invert: function(location) {
      return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
    },
    invertX: function(x) {
      return (x - this.x) / this.k;
    },
    invertY: function(y) {
      return (y - this.y) / this.k;
    },
    rescaleX: function(x) {
      return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
    },
    rescaleY: function(y) {
      return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
    },
    toString: function() {
      return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
    }
  };
  var identity2 = new Transform(1, 0, 0);
  transform.prototype = Transform.prototype;
  function transform(node) {
    while (!node.__zoom) if (!(node = node.parentNode)) return identity2;
    return node.__zoom;
  }

  // src/features/parallax/utils.ts
  var TAU = Math.PI * 2;
  var createJitterForce = (strength) => {
    let nodes = [];
    const force = (alpha) => {
      var _a, _b;
      const scaled = strength * alpha;
      for (const node of nodes) {
        node.vx = ((_a = node.vx) != null ? _a : 0) + (Math.random() - 0.5) * scaled;
        node.vy = ((_b = node.vy) != null ? _b : 0) + (Math.random() - 0.5) * scaled;
      }
    };
    force.initialize = (newNodes) => {
      nodes = newNodes;
    };
    return force;
  };
  var randomBetween = (min2, max2) => min2 + Math.random() * (max2 - min2);
  var parseNumber = (value, fallback) => {
    if (!value) return fallback;
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  var parseCount = (value, fallback) => {
    if (!value) return fallback;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  var parseSizeValue = (value) => {
    var _a;
    const trimmed = value.trim();
    const match = trimmed.match(/^(-?\d*\.?\d+)(px|dvh|dwh|dvw|vh|vw|%)?$/);
    if (!match) return null;
    const numeric = Number(match[1]);
    if (!Number.isFinite(numeric)) return null;
    return {
      value: numeric,
      unit: (_a = match[2]) != null ? _a : "px"
    };
  };
  var resolveSizePx = (value) => {
    const parsed = parseSizeValue(value);
    if (!parsed) return null;
    switch (parsed.unit) {
      case "px":
        return parsed.value;
      case "dvh":
      case "dwh":
      case "vh":
        return window.innerHeight * parsed.value / 100;
      case "dvw":
      case "vw":
        return window.innerWidth * parsed.value / 100;
      case "%": {
        const basis2 = Math.min(window.innerWidth, window.innerHeight);
        return basis2 * parsed.value / 100;
      }
      default:
        return null;
    }
  };
  var createColorSampler = () => {
    const gray = rgb_default(
      PARALLAX_CONFIG.colorSampler.grayStart,
      PARALLAX_CONFIG.colorSampler.grayEnd
    );
    const red = rgb_default(
      PARALLAX_CONFIG.colorSampler.redStart,
      PARALLAX_CONFIG.colorSampler.redEnd
    );
    return () => {
      const roll = Math.random();
      if (roll < PARALLAX_CONFIG.colorSampler.grayChance) {
        return gray(Math.random());
      }
      if (roll < PARALLAX_CONFIG.colorSampler.redChance) {
        return red(Math.random());
      }
      const mix = rgb_default(gray(Math.random()), red(Math.random()));
      return mix(Math.random());
    };
  };
  var getLayerConfig = (layer) => ({
    count: parseCount(layer.dataset.count, PARALLAX_CONFIG.defaultLayer.count),
    sizeMin: parseNumber(layer.dataset.sizeMin, PARALLAX_CONFIG.defaultLayer.sizeMin),
    sizeMax: parseNumber(layer.dataset.sizeMax, PARALLAX_CONFIG.defaultLayer.sizeMax),
    jitter: parseNumber(layer.dataset.jitter, PARALLAX_CONFIG.defaultLayer.jitter),
    speed: parseNumber(layer.dataset.speed, PARALLAX_CONFIG.motion.defaultSpeed),
    shrink: parseNumber(layer.dataset.shrink, PARALLAX_CONFIG.motion.defaultShrink)
  });
  var getOrbitPhase = () => Math.random() * TAU;

  // src/features/parallax/scroll.ts
  var createParallaxScroller = (options) => {
    const { layers, getScrollRatio, setContainerSize } = options;
    let ticking = false;
    let latestScroll = window.scrollY;
    const update = () => {
      const scrollRatio = getScrollRatio();
      setContainerSize(scrollRatio);
      const maxShrink = PARALLAX_CONFIG.motion.maxShrink;
      const frontLayer = layers[layers.length - 1];
      for (const layer of layers) {
        const { speed, shrink } = getLayerConfig(layer);
        const effectiveShrink = layer === frontLayer ? 0 : shrink;
        const scale = 1 - scrollRatio * maxShrink * effectiveShrink;
        layer.style.transform = `translate3d(0, ${latestScroll * speed}px, 0) scale(${scale})`;
      }
      ticking = false;
    };
    return () => {
      latestScroll = window.scrollY;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
  };

  // src/features/parallax/buildLayer.ts
  var buildLayer = (layer) => {
    const width = Math.max(1, layer.clientWidth);
    const height = Math.max(1, layer.clientHeight);
    const { count, sizeMin, sizeMax, jitter } = getLayerConfig(layer);
    const svg = select_default2(layer).selectAll("svg").data([null]).join("svg").attr("class", PARALLAX_CONFIG.svgClassName).attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`).attr("preserveAspectRatio", "none");
    const colorSampler = createColorSampler();
    const nodes = range(count).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: randomBetween(sizeMin, sizeMax),
      color: colorSampler(),
      opacity: randomBetween(
        PARALLAX_CONFIG.defaults.opacityMin,
        PARALLAX_CONFIG.defaults.opacityMax
      ),
      orbitRadiusPx: randomBetween(
        PARALLAX_CONFIG.orbit.radiusPxMin,
        PARALLAX_CONFIG.orbit.radiusPxMax
      ),
      orbitSpeedRad: randomBetween(
        PARALLAX_CONFIG.orbit.speedRadMin,
        PARALLAX_CONFIG.orbit.speedRadMax
      ),
      orbitPhase: getOrbitPhase(),
      orbitWobbleSpeedRad: randomBetween(
        PARALLAX_CONFIG.orbit.wobbleSpeedRadMin,
        PARALLAX_CONFIG.orbit.wobbleSpeedRadMax
      ),
      orbitWobblePhase: getOrbitPhase()
    }));
    const circles = svg.selectAll("circle").data(nodes).join("circle").attr("r", (node) => node.r).attr("fill", (node) => node.color).attr("opacity", (node) => node.opacity).attr("cx", 0).attr("cy", 0);
    const padding = PARALLAX_CONFIG.padding;
    let rafId = 0;
    let latestTime = 0;
    const updateFrame = () => {
      rafId = 0;
      const t = latestTime;
      for (const node of nodes) {
        if (node.x < -padding) node.x = width + padding;
        if (node.x > width + padding) node.x = -padding;
        if (node.y < -padding) node.y = height + padding;
        if (node.y > height + padding) node.y = -padding;
      }
      circles.attr("transform", (node) => {
        const angle = node.orbitPhase + node.orbitSpeedRad * t;
        const wobble = 0.75 + 0.25 * Math.sin(node.orbitWobblePhase + node.orbitWobbleSpeedRad * t);
        const r = node.orbitRadiusPx * wobble;
        const dx = Math.cos(angle) * r;
        const dy = Math.sin(angle) * r;
        return `translate(${node.x + dx}, ${node.y + dy})`;
      });
    };
    const scheduleFrame = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(updateFrame);
    };
    const simulation = simulation_default(nodes).force("x", x_default(width / 2).strength(PARALLAX_CONFIG.simulation.forceStrength)).force("y", y_default(height / 2).strength(PARALLAX_CONFIG.simulation.forceStrength)).force("jitter", createJitterForce(jitter)).velocityDecay(PARALLAX_CONFIG.simulation.velocityDecay).alpha(PARALLAX_CONFIG.simulation.alpha).alphaDecay(PARALLAX_CONFIG.simulation.alphaDecay).on("tick", () => {
      latestTime = performance.now() / 1e3;
      scheduleFrame();
    });
    const destroy = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };
    return { layer, simulation, destroy };
  };

  // src/features/parallax/state.ts
  var createParallaxStateManager = (options) => {
    const { layers, getScrollRatio, setContainerSize, refreshContainerSizeBounds } = options;
    const states = /* @__PURE__ */ new Map();
    const startSimulation = (state) => {
      if (!shouldAnimate()) return;
      if (state.running) return;
      state.simulation.alpha(PARALLAX_CONFIG.simulation.alpha).restart();
      state.running = true;
    };
    const stopSimulation = (state) => {
      if (!state.running) return;
      state.simulation.stop();
      state.running = false;
    };
    const rebuild = () => {
      refreshContainerSizeBounds();
      setContainerSize(getScrollRatio());
      for (const state of states.values()) {
        stopSimulation(state);
        state.destroy();
      }
      states.clear();
      for (const layer of layers) {
        const svg = qs(SELECTORS.parallaxLayerSvg, layer);
        if (svg) {
          svg.remove();
        }
        const state = buildLayer(layer);
        const running = shouldAnimate();
        if (!running) {
          state.simulation.stop();
        }
        states.set(layer, {
          ...state,
          isVisible: true,
          running
        });
      }
    };
    const destroy = () => {
      for (const state of states.values()) {
        stopSimulation(state);
        state.destroy();
      }
      states.clear();
    };
    return {
      states,
      rebuild,
      destroy,
      startSimulation,
      stopSimulation
    };
  };

  // src/features/parallax/index.ts
  var initParallax = () => {
    const container = qs(PARALLAX_CONFIG.containerSelector);
    if (!container) return;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const disposer = createDisposer();
    const layers = qsa(PARALLAX_CONFIG.layerSelector, container);
    if (layers.length === 0) return;
    const getScrollRatio = () => {
      const scrollMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      return Math.min(1, Math.max(0, window.scrollY / scrollMax));
    };
    const containerSizePx = {
      start: null,
      end: null
    };
    const refreshContainerSizeBounds = () => {
      containerSizePx.start = resolveSizePx(PARALLAX_CONFIG.containerSize.start);
      containerSizePx.end = resolveSizePx(PARALLAX_CONFIG.containerSize.end);
    };
    const setContainerSize = (scrollRatio) => {
      if (containerSizePx.start === null || containerSizePx.end === null) return;
      const sizePx = containerSizePx.start + (containerSizePx.end - containerSizePx.start) * scrollRatio;
      container.style.setProperty("--parallax-size", `${Math.max(0, sizePx)}px`);
    };
    const stateManager = createParallaxStateManager({
      layers,
      getScrollRatio,
      setContainerSize,
      refreshContainerSizeBounds
    });
    const observerControls = createLayerObserver({
      layers,
      states: stateManager.states,
      onVisibilityChange: (state, isVisible) => {
        if (isVisible) {
          stateManager.startSimulation(state);
        } else {
          stateManager.stopSimulation(state);
        }
      }
    });
    const rebuild = () => {
      stateManager.rebuild();
      observerControls.observeAll();
    };
    const applyParallax = createParallaxScroller({
      layers,
      getScrollRatio,
      setContainerSize
    });
    let resizeRaf = 0;
    const handleResize = () => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        rebuild();
        applyParallax();
      });
    };
    rebuild();
    applyParallax();
    disposer.addListener(window, "scroll", applyParallax, { passive: true });
    disposer.addListener(window, "resize", handleResize);
    disposer.addListener(motionQuery, "change", rebuild);
    return () => {
      if (resizeRaf) {
        cancelAnimationFrame(resizeRaf);
        resizeRaf = 0;
      }
      disposer.disposeAll();
      observerControls.disconnect();
      stateManager.destroy();
    };
  };

  // src/features/redButton.ts
  var initRedButton = () => {
    const redButton = qs(SELECTORS.headerLogoButton);
    if (!redButton) return;
    redButton.setAttribute("aria-pressed", "false");
    const setExpanded = (isExpanded) => {
      redButton.classList.toggle("is-expanded", isExpanded);
      redButton.setAttribute("aria-pressed", String(isExpanded));
    };
    const collapseViaZero = () => {
      redButton.classList.add("is-collapsing");
      setExpanded(false);
      let cleaned = false;
      const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        redButton.classList.remove("is-collapsing");
      };
      const onTransitionEnd = (event) => {
        if (event.propertyName !== "transform") return;
        cleanup();
      };
      redButton.addEventListener("transitionend", onTransitionEnd, { once: true });
      window.setTimeout(cleanup, 260);
    };
    const onClick = () => {
      const isExpanded = redButton.classList.contains("is-expanded");
      if (isExpanded) {
        collapseViaZero();
      } else {
        redButton.classList.remove("is-collapsing");
        setExpanded(true);
      }
    };
    redButton.addEventListener("click", onClick);
    return () => {
      redButton.removeEventListener("click", onClick);
    };
  };

  // src/features/storeVisibility.ts
  var initStoreVisibility = () => {
    const storeMain = qs(SELECTORS.storeMain);
    if (!storeMain) return;
    const toggleStoreOnScroll = () => {
      const isAtTop = window.scrollY <= 1;
      storeMain.classList.toggle("is-hidden", !isAtTop);
    };
    window.addEventListener("scroll", toggleStoreOnScroll, { passive: true });
    toggleStoreOnScroll();
    return () => {
      window.removeEventListener("scroll", toggleStoreOnScroll);
    };
  };

  // src/features/textGlitch/scheduler.ts
  var createSingleLetterScheduler = (options) => {
    const { protocolLetters, baseIntervalMs, getRandomChar } = options;
    const disposer = createDisposer();
    let singleLetterActive = false;
    let singleLetterTimeoutId;
    let singleLetterIntervalId;
    let schedulerTimeoutId;
    let lastSingleLetter = null;
    const runSingleLetterGlitch = (onDone) => {
      var _a;
      if (singleLetterActive) return;
      if (protocolLetters.length === 0) {
        onDone();
        return;
      }
      singleLetterActive = true;
      if (singleLetterTimeoutId) {
        window.clearTimeout(singleLetterTimeoutId);
        singleLetterTimeoutId = void 0;
      }
      if (singleLetterIntervalId) {
        window.clearInterval(singleLetterIntervalId);
        singleLetterIntervalId = void 0;
      }
      const targetLetter = (_a = pickRandomAvoid(protocolLetters, lastSingleLetter, 10)) != null ? _a : protocolLetters[0];
      lastSingleLetter = targetLetter;
      const finalChar = targetLetter.dataset.final || targetLetter.textContent || "";
      if (!finalChar) {
        singleLetterActive = false;
        onDone();
        return;
      }
      targetLetter.textContent = getRandomChar(finalChar);
      singleLetterTimeoutId = disposer.addTimeout(() => {
        singleLetterIntervalId = disposer.addInterval(() => {
          const nextChar = getRandomChar();
          targetLetter.textContent = nextChar;
        }, baseIntervalMs);
        singleLetterTimeoutId = disposer.addTimeout(() => {
          if (singleLetterIntervalId) {
            window.clearInterval(singleLetterIntervalId);
            singleLetterIntervalId = void 0;
          }
          targetLetter.textContent = finalChar;
          singleLetterActive = false;
          onDone();
        }, TIMINGS.glitch.singleLetterDurationMs);
      }, TIMINGS.glitch.singleLetterDelayMs);
    };
    const scheduleNextSingleLetter = () => {
      if (schedulerTimeoutId) window.clearTimeout(schedulerTimeoutId);
      const delayMs = TIMINGS.glitch.singleLetterMinPauseMs + Math.random() * TIMINGS.glitch.singleLetterJitterMs;
      schedulerTimeoutId = disposer.addTimeout(() => {
        runSingleLetterGlitch(scheduleNextSingleLetter);
      }, delayMs);
    };
    const start2 = () => {
      scheduleNextSingleLetter();
    };
    const dispose = () => {
      if (singleLetterTimeoutId) window.clearTimeout(singleLetterTimeoutId);
      if (singleLetterIntervalId) window.clearInterval(singleLetterIntervalId);
      if (schedulerTimeoutId) window.clearTimeout(schedulerTimeoutId);
      singleLetterTimeoutId = void 0;
      singleLetterIntervalId = void 0;
      schedulerTimeoutId = void 0;
      disposer.disposeAll();
    };
    return { start: start2, dispose };
  };

  // src/features/textGlitch.ts
  var initTextGlitch = () => {
    const protocolText = qs(SELECTORS.protocolText);
    const letters = qsa(SELECTORS.glitchLetters);
    if (letters.length === 0) return;
    const protocolLetters = protocolText ? qsa(SELECTORS.protocolTextLetters, protocolText) : [];
    const baseIntervalMs = TIMINGS.glitch.baseIntervalMs;
    const disposer = createDisposer();
    let runTextEffectIntervalId;
    const getRandomChar = (avoidChar = "") => pickRandomChar(TEXT.glitchCharacters, avoidChar);
    const runTextEffect = () => {
      let tick = 0;
      const maxTicks = TIMINGS.glitch.maxTicks;
      const settleOffsets = Array.from(
        { length: letters.length },
        (_, i) => i + TIMINGS.glitch.settleOffsetStart
      );
      if (runTextEffectIntervalId) {
        window.clearInterval(runTextEffectIntervalId);
        runTextEffectIntervalId = void 0;
      }
      runTextEffectIntervalId = disposer.addInterval(() => {
        tick++;
        letters.forEach((letter, index) => {
          const finalChar = letter.dataset.final || letter.textContent || "";
          if (tick < settleOffsets[index]) {
            letter.textContent = getRandomChar();
          } else {
            letter.textContent = finalChar;
          }
        });
        if (tick > maxTicks + letters.length) {
          if (runTextEffectIntervalId) {
            window.clearInterval(runTextEffectIntervalId);
            runTextEffectIntervalId = void 0;
          }
        }
      }, baseIntervalMs);
    };
    letters.forEach((letter) => {
      letter.dataset.final = letter.textContent || "";
    });
    runTextEffect();
    if (protocolText) protocolText.addEventListener("click", runTextEffect);
    const scheduler = createSingleLetterScheduler({
      protocolLetters,
      baseIntervalMs,
      getRandomChar
    });
    scheduler.start();
    return () => {
      if (protocolText) protocolText.removeEventListener("click", runTextEffect);
      scheduler.dispose();
      if (runTextEffectIntervalId) window.clearInterval(runTextEffectIntervalId);
      runTextEffectIntervalId = void 0;
      disposer.disposeAll();
    };
  };

  // src/app.ts
  var init2 = () => {
    const disposer = createDisposer();
    disposer.add(initTextGlitch());
    disposer.add(initHeaderNav());
    disposer.add(initStoreVisibility());
    disposer.add(initJokes());
    disposer.add(initBottomBlock());
    disposer.add(initRedButton());
    disposer.add(initParallax());
    window.addEventListener("pagehide", disposer.disposeAll, { once: true });
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init2, { once: true });
  } else {
    init2();
  }
})();
