const Modes = {
  data: {
    quick: {
      name: "Быстрый дебат",
      rounds: 3,
      time: 300,
      description: "Быстрая тренировка аргументации."
    },
    full: {
      name: "Полный дебат",
      rounds: 5,
      time: 900,
      description: "Полноценный дебат с глубоким анализом."
    },
    cross: {
      name: "Перекрёстный допрос",
      rounds: 5,
      time: 600,
      description: "Короткие вопросы и атака противоречий."
    },
    logic: {
      name: "Тренировка логики",
      rounds: 5,
      time: 600,
      description: "Фокус на структуре рассуждения."
    },
    devil: {
      name: "Адвокат дьявола",
      rounds: 5,
      time: 900,
      description: "Защита позиции под максимальным давлением."
    },
    tournament: {
      name: "Турнир",
      rounds: 7,
      time: 1200,
      description: "Серия сложных раундов."
    }
  },
  get(mode) {
    return this.data[mode] || this.data.quick;
  }
};
