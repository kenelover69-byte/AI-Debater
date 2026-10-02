const Stats = {
  xpKey: "ai_debater_xp",
  getXP() {
    return Number(localStorage.getItem(this.xpKey)) || 0;
  },
  addXP(amount) {
    const xp = this.getXP() + Math.max(0, amount);
    localStorage.setItem(
      this.xpKey,
      xp.toString()
    );
  },
  getRank() {
    const xp = this.getXP();
    if (xp >= 5000) return {
      name: "ГРАНДМАСТЕР",
      next: Infinity,
      current: xp
    };
    if (xp >= 3000) return {
      name: "МАСТЕР",
      next: 5000,
      current: xp
    };
    if (xp >= 1800) return {
      name: "ЭКСПЕРТ",
      next: 3000,
      current: xp
    };
    if (xp >= 900) return {
      name: "ДЕБАТАНТ",
      next: 1800,
      current: xp
    };
    if (xp >= 300) return {
      name: "УЧЕНИК",
      next: 900,
      current: xp
    };
    return {
      name: "НОВИЧОК",
      next: 300,
      current: xp
    };
  },
  renderHome() {
    const total = History.total();
    const wins = History.wins();
    const logic = History.averageStat("logic");
    const persuasion = History.averageStat("persuasion");
    document.getElementById("home-debates").textContent = total;
    document.getElementById("home-wins").textContent = wins;
    document.getElementById("home-logic").textContent =
      total ? logic : "—";
    document.getElementById("home-persuasion").textContent =
      total ? persuasion : "—";
    const rank = this.getRank();
    document.getElementById("home-rank").textContent =
      rank.name;
    document.getElementById("home-xp-text").textContent =
      `${rank.current} XP`;
    let percent = 100;
    if (rank.next !== Infinity) {
      const previousThreshold =
        this.getPreviousThreshold(rank.next);
      percent =
        ((rank.current - previousThreshold) /
        (rank.next - previousThreshold)) * 100;
    }
    document.getElementById("home-xp-bar").style.width =
      `${Math.max(0, Math.min(100, percent))}%`;
  },
  getPreviousThreshold(next) {
    const thresholds = [0, 300, 900, 1800, 3000, 5000];
    let previous = 0;
    for (const value of thresholds) {
      if (value < next) previous = value;
    }
    return previous;
  }
};
