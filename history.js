const History = {
  key: "ai_debater_history",
  getAll() {
    try {
      return JSON.parse(localStorage.getItem(this.key)) || [];
    } catch {
      return [];
    }
  },
  save(result) {
    const history = this.getAll();
    history.unshift(result);
    if (history.length > 100) {
      history.length = 100;
    }
    localStorage.setItem(
      this.key,
      JSON.stringify(history)
    );
  },
  clear() {
    localStorage.removeItem(this.key);
  },
  latest() {
    return this.getAll()[0] || null;
  },
  total() {
    return this.getAll().length;
  },
  wins() {
    return this.getAll()
      .filter(item => item.score >= 70)
      .length;
  },
  averageScore() {
    const history = this.getAll();
    if (!history.length) return 0;
    return Math.round(
      history.reduce((sum, item) => sum + item.score, 0) /
      history.length
    );
  },
  averageStat(stat) {
    const history = this.getAll();
    if (!history.length) return 0;
    return Math.round(
      history.reduce(
        (sum, item) => sum + (item.scores?.[stat] || 0),
        0
      ) / history.length
    );
  }
};
