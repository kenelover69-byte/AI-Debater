const Debater = {
  say(text) {
    const element = document.getElementById("opponent-message");
    element.style.opacity = "0";
    element.style.transform = "translateY(5px)";
    setTimeout(() => {
      element.textContent = text;
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
    }, 180);
  },
  setEmotion(emotion) {
    const element = document.getElementById("opponent-emotion");
    const emotions = {
      neutral: "●",
      thinking: "◐",
      confident: "◆",
      surprised: "◇",
      angry: "▲"
    };
    element.textContent = emotions[emotion] || emotions.neutral;
    const avatar = document.getElementById("debater-avatar");
    avatar.style.transform = "scale(1.02)";
    setTimeout(() => {
      avatar.style.transform = "scale(1)";
    }, 250);
  }
};
