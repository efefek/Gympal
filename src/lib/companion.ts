export interface ChatMessage {
  id: string
  text: string
  role: 'user' | 'ai'
  timestamp: number
}

let messageHistory: ChatMessage[] = []
const MAX_HISTORY = 20

export function getMockResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase()

  if (lower.includes('program') || lower.includes('plan')) {
    return "I can help you generate a personalized workout program! Based on your profile (goal, experience, equipment, location), I'll create a tailored plan. Go to the Program page to start.";
  }

  if (lower.includes('goal') || lower.includes('hedef') || lower.includes('objective')) {
    return "Your goal shapes everything — exercises, intensity, and recovery. Available goals: Lose Weight, Build Muscle, General Fitness, Flexibility & Mobility, or Endurance. Visit your Profile to update it.";
  }

  if (lower.includes('exercise') || lower.includes('egzersiz') || lower.includes('workout')) {
    return "Choose an exercise based on your goal! For muscle building: squats, deadlifts, bench press. For weight loss: circuit training + cardio. For flexibility: yoga, stretching, mobility. What equipment do you have?";
  }

  if (lower.includes('today') || lower.includes('do today') || lower.includes('should i')) {
    return "Today's a great day to move! Start with warmup, hit your main workout, cool down with stretching. Even 20 minutes beats nothing. Check your personalized program for today's exercises!";
  }

  const defaults = [
    "Consistency beats perfection! Start where you are, use what you have, do what you can.",
    "Progressive overload is key — aim to do slightly more than last time.",
    "Don't skip warmup and cooldown. They prevent injury and aid recovery.",
    "Nutrition and sleep are just as important as training. Are you getting enough rest?",
    "Listen to your body. If something hurts, rest and recover.",
    "Stay hydrated! Drink water before, during, and after your workout.",
    "Core strength improves everything. Add planks or deadbugs to your routine.",
    "Mobility work prevents injuries. Spend 10 minutes daily on stretching or yoga.",
  ];

  return defaults[Math.floor(Math.random() * defaults.length)];
}

export function addMessage(text: string, role: 'user' | 'ai'): ChatMessage {
  const message: ChatMessage = {
    id: `msg-${Date.now()}`,
    text,
    role,
    timestamp: Date.now(),
  };

  messageHistory.push(message);

  if (messageHistory.length > MAX_HISTORY) {
    messageHistory = messageHistory.slice(-MAX_HISTORY);
  }

  return message;
}

export function getHistory(): ChatMessage[] {
  return [...messageHistory];
}

export function clearHistory(): void {
  messageHistory = [];
}
