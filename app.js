const App = {
  mode: "quick",
  debate: null,
  timerInterval: null,
  isProcessing: false,
  init() {
    this.bindEvents();
    Stats.renderHome();
  },
  bindEvents() {
    document.querySelectorAll(".mode-card").forEach(card => {
      card.addEventListener("click", () => {
        document.querySelectorAll(".mode-card")
          .forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        this.mode = card.dataset.mode;
      });
    });
    document.getElementById("enter-arena-btn")
      .addEventListener("click", () => this.startDebate());
    document.getElementById("submit-argument")
      .addEventListener("click", () => this.submitArgument());
    document.getElementById("argument-input")
      .addEventListener("input", e => {
        document.getElementById("argument-counter").textContent =
          `${e.target.value.length} / 500`;
      });
    document.getElementById("argument-input")
      .addEventListener("keydown", e => {
        if (e.ctrlKey && e.key === "Enter") {
          this.submitArgument();
        }
      });
    document.getElementById("leave-debate")
      .addEventListener("click", () => this.leaveDebate());
    document.getElementById("again-btn")
      .addEventListener("click", () => this.startDebate());
    document.getElementById("home-btn")
      .addEventListener("click", () => this.showScreen("home-screen"));
  },
  startDebate() {
    this.stopTimer();
    const mode = Modes.get(this.mode);
    this.debate = {
      mode: this.mode,
      topic: Themes.random(),
      position: Math.random() > .5 ? "ЗА" : "ПРОТИВ",
      round: 1,
      totalRounds: mode.rounds,
      timeLeft: mode.time,
      arguments: [],
      opponentArguments: [],
      pressure: 0,
      score: {
        logic: 0,
        persuasion: 0,
        evidence: 0,
        rebuttal: 0
      }
    };
    this.showScreen("debate-screen");
    this.prepareDebate();
  },
  prepareDebate() {
    const d = this.debate;
    const mode = Modes.get(d.mode);
    document.getElementById("debate-mode-label").textContent =
      mode.name.toUpperCase();
    document.getElementById("topic-label").textContent =
      "БОЙ НАЧАТ";
    document.getElementById("debate-topic").textContent = d.topic;
    document.getElementById("user-position").textContent = d.position;
    document.getElementById("round-number").textContent = d.round;
    document.getElementById("round-total").textContent = d.totalRounds;
    document.getElementById("round-progress-fill").style.width =
      `${(d.round / d.totalRounds) * 100}%`;
    document.getElementById("argument-input").value = "";
    document.getElementById("argument-counter").textContent = "0 / 500";
    Debater.setEmotion("neutral");
    const opening = MockAI.opening(d.topic, d.position, d.mode);
    Debater.say(opening);
    this.updatePressure();
    this.startTimer();
  },
  startTimer() {
    this.stopTimer();
    this.updateTimer();
    this.timerInterval = setInterval(() => {
      if (!this.debate) return;
      this.debate.timeLeft--;
      this.updateTimer();
      if (this.debate.timeLeft <= 0) {
        this.finishDebate("Время вышло.");
      }
    }, 1000);
  },
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },
  updateTimer() {
    const seconds = Math.max(0, this.debate.timeLeft);
    const min = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const sec = (seconds % 60)
      .toString()
      .padStart(2, "0");
    const timer = document.getElementById("timer");
    timer.textContent = `${min}:${sec}`;
    timer.classList.toggle("warning", seconds <= 30);
  },
  async submitArgument() {
    if (this.isProcessing || !this.debate) return;
    const input = document.getElementById("argument-input");
    const text = input.value.trim();
    if (text.length < 10) {
      this.showFeedback(
        "СЛИШКОМ СЛАБО",
        "Одного короткого утверждения недостаточно. Разверни мысль и объясни причинно-следственную связь."
      );
      return;
    }
    this.isProcessing = true;
    const button = document.getElementById("submit-argument");
    button.disabled = true;
    button.textContent = "АНАЛИЗ...";
    const analysis = MockAI.analyze(text, {
      topic: this.debate.topic,
      position: this.debate.position,
      round: this.debate.round,
      previousArguments: this.debate.arguments,
      opponentArguments: this.debate.opponentArguments,
      mode: this.debate.mode
    });
    this.debate.arguments.push({
      text,
      analysis
    });
    this.debate.score.logic += analysis.logic;
    this.debate.score.persuasion += analysis.persuasion;
    this.debate.score.evidence += analysis.evidence;
    this.debate.score.rebuttal += analysis.rebuttal;
    this.debate.pressure = Math.max(
      0,
      Math.min(100, this.debate.pressure + analysis.pressureChange)
    );
    this.showFeedback(
      analysis.grade,
      analysis.feedback
    );
    await this.delay(700);
    const counter = MockAI.counter(
      text,
      this.debate.topic,
      this.debate.position,
      this.debate.round,
      this.debate.mode,
      analysis
    );
    this.debate.opponentArguments.push(counter);
    Debater.say(counter.text);
    Debater.setEmotion(counter.emotion);
    this.debate.pressure = Math.max(
      0,
      Math.min(100, this.debate.pressure + counter.pressure)
    );
    this.updatePressure();
    await this.delay(800);
    if (this.debate.round >= this.debate.totalRounds) {
      this.finishDebate("Все раунды завершены.");
    } else {
      this.nextRound();
    }
    this.isProcessing = false;
    button.disabled = false;
    button.innerHTML = "ОТПРАВИТЬ <span>↗</span>";
  },
  nextRound() {
    this.debate.round++;
    const d = this.debate;
    document.getElementById("round-number").textContent = d.round;
    document.getElementById("round-progress-fill").style.width =
      `${(d.round / d.totalRounds) * 100}%`;
    document.getElementById("argument-input").value = "";
    document.getElementById("argument-counter").textContent = "0 / 500";
    const nextOpening = MockAI.nextRound(
      d.topic,
      d.position,
      d.round,
      d.mode
    );
    Debater.say(nextOpening);
    Debater.setEmotion("thinking");
    this.updatePressure();
  },
  updatePressure() {
    const pressure = this.debate.pressure;
    document.getElementById("pressure-fill").style.width =
      `${pressure}%`;
    document.getElementById("pressure-value").textContent =
      `${Math.round(pressure)}%`;
    if (pressure >= 70) {
      document.getElementById("pressure-label").textContent =
        "ОППОНЕНТ ДАВИТ";
    } else if (pressure >= 40) {
      document.getElementById("pressure-label").textContent =
        "НАПРЯЖЕНИЕ";
    } else {
      document.getElementById("pressure-label").textContent =
        "ДАВЛЕНИЕ";
    }
  },
  showFeedback(title, text) {
    const feedback = document.getElementById("feedback");
    feedback.innerHTML = `
      <div class="feedback-title">${title}</div>
      <p>${this.escape(text)}</p>
    `;
    feedback.classList.add("show");
  },
  finishDebate(reason) {
    if (!this.debate) return;
    this.stopTimer();
    const d = this.debate;
    const count = Math.max(1, d.arguments.length);
    const scores = {
      logic: Math.round(d.score.logic / count),
      persuasion: Math.round(d.score.persuasion / count),
      evidence: Math.round(d.score.evidence / count),
      rebuttal: Math.round(d.score.rebuttal / count)
    };
    const finalScore = Math.round(
      scores.logic * .3 +
      scores.persuasion * .25 +
      scores.evidence * .2 +
      scores.rebuttal * .25
    );
    let verdict;
    if (finalScore >= 85) verdict = "ДОМИНИРОВАНИЕ";
    else if (finalScore >= 70) verdict = "УБЕДИТЕЛЬНО";
    else if (finalScore >= 55) verdict = "ДОСТОЙНЫЙ БОЙ";
    else if (finalScore >= 40) verdict = "ЕСТЬ НАД ЧЕМ РАБОТАТЬ";
    else verdict = "ОППОНЕНТ ПЕРЕЖАЛ";
    const result = {
      date: new Date().toISOString(),
      mode: d.mode,
      topic: d.topic,
      position: d.position,
      score: finalScore,
      verdict,
      scores,
      arguments: d.arguments,
      opponentArguments: d.opponentArguments,
      pressure: d.pressure,
      reason
    };
    History.save(result);
    Stats.addXP(finalScore);
    document.getElementById("final-score").textContent = finalScore;
    document.getElementById("final-verdict").textContent = verdict;
    document.getElementById("result-logic").textContent = scores.logic;
    document.getElementById("result-persuasion").textContent = scores.persuasion;
    document.getElementById("result-evidence").textContent = scores.evidence;
    document.getElementById("result-rebuttal").textContent = scores.rebuttal;
    document.getElementById("result-subtitle").textContent =
      `${d.topic} • ${reason}`;
    document.getElementById("result-title").textContent =
      finalScore >= 70 ? "ТЫ ВЫДЕРЖАЛ." : "ДЕБАТ ЗАВЕРШЁН.";
    this.renderAnalysis(result);
    this.showScreen("result-screen");
    this.debate = null;
  },
  renderAnalysis(result) {
    const container = document.getElementById("analysis-content");
    const best = result.arguments
      .map(a => a.analysis)
      .sort((a, b) => b.logic + b.persuasion - a.logic - a.persuasion)[0];
    const weak = result.arguments
      .map(a => a.analysis)
      .sort((a, b) => a.logic + a.evidence - b.logic - b.evidence)[0];
    container.innerHTML = `
      <div class="analysis-item">
        <h3>СИЛЬНАЯ СТОРОНА</h3>
        <p>${this.escape(best ? best.feedback : "Недостаточно данных.")}</p>
      </div>
      <div class="analysis-item">
        <h3>ГЛАВНАЯ ТОЧКА РОСТА</h3>
        <p>${this.escape(weak ? weak.improvement : "Продолжай тренироваться.")}</p>
      </div>
      <div class="analysis-item">
        <h3>ЛОГИЧЕСКАЯ ДИСЦИПЛИНА</h3>
        <p>
          Сильный дебатант не просто говорит убедительно.
          Он отделяет факт от предположения, объясняет связь
          между доказательством и выводом и заранее учитывает
          возможное возражение.
        </p>
      </div>
      <div class="analysis-item">
        <h3>СЛЕДУЮЩАЯ ЦЕЛЬ</h3>
        <p>${this.escape(MockAI.trainingAdvice(result))}</p>
      </div>
    `;
  },
  leaveDebate() {
    if (!this.debate) return;
    const leave = confirm(
      "Выйти из дебата? Текущий результат не будет сохранён."
    );
    if (!leave) return;
    this.stopTimer();
    this.debate = null;
    this.showScreen("home-screen");
    Stats.renderHome();
  },
  showScreen(id) {
    document.querySelectorAll(".screen").forEach(screen => {
      screen.classList.remove("active");
    });
    document.getElementById(id).classList.add("active");
    if (id === "home-screen") {
      Stats.renderHome();
    }
    window.scrollTo(0, 0);
  },
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  escape(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
};
document.addEventListener("DOMContentLoaded", () => App.init());
