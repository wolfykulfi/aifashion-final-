export function generateAltText(colors: { name: string; percentage: number }[]): string {
  const sortedColors = [...colors].sort((a, b) => b.percentage - a.percentage);
  const topColors = sortedColors.slice(0, 3);
  
  const colorDescription = topColors
    .map(color => `${color.name} (${color.percentage}%)`)
    .join(', ');

  return `Image containing predominantly ${colorDescription}`;
}

export function generateFashionDescription(colors: { name: string; percentage: number }[]): string {
  if (!colors || colors.length === 0) {
    return "No colors detected in this piece";
  }

  const mainColor = [...colors].sort((a, b) => b.percentage - a.percentage)[0];
  
  const descriptions = {
    black: "elegant and timeless",
    white: "clean and crisp",
    blue: "cool and calming",
    red: "bold and striking",
    green: "natural and fresh",
    yellow: "bright and cheerful",
    purple: "luxurious and royal",
    pink: "soft and feminine",
    gray: "sophisticated and neutral",
    brown: "earthy and warm",
    orange: "vibrant and energetic",
    default: "stylish and fashionable"
  };

  const colorMood = descriptions[mainColor.name.toLowerCase() as keyof typeof descriptions] || descriptions.default;
  
  return `This ${colorMood} piece features ${mainColor.name} as its primary color, making up ${mainColor.percentage}% of the overall design.`;
}

export function speakResults(text: string) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1;
  speechSynthesis.speak(utterance);
}