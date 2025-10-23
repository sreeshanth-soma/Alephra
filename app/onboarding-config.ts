interface OnboardingStep {
  title: string
  description: string
  targetElement?: string
  image?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export const onboardingSteps: OnboardingStep[] = [
  {
    title: "Welcome to Alephra! 🎉",
    description: "Your intelligent health companion powered by AI. Let's take a quick tour to help you get started.",
  },
  {
    title: "Upload Medical Reports",
    description: "Easily upload your medical reports, lab results, and prescriptions. Our AI will analyze and organize them for you.",
  },
  {
    title: "Ask Health Questions",
    description: "Chat with our AI to get insights about your health reports, understand medical terms, and track your health metrics over time.",
  },
  {
    title: "Track Your Health Timeline",
    description: "View your health journey with interactive timelines, charts, and trends. See how your metrics change over time.",
  },
  {
    title: "Voice Assistant",
    description: "Use voice commands to interact with your health data hands-free. Ask questions, record notes, and get instant answers.",
  },
  {
    title: "You're All Set! ✨",
    description: "Start by uploading your first medical report or explore with sample data. Need help? Look for tooltips throughout the app!",
  }
]

// Feature tooltips for first-time users
export const featureTooltips = {
  timeline: {
    title: "📊 Timeline View",
    description: "See all your lab results across time. Click any report to view detailed metrics and trends."
  },
  templates: {
    title: "📋 Smart Templates",
    description: "Use pre-built templates for common tests like CBC, Lipid Panel, and more to quickly organize your reports."
  },
  sharing: {
    title: "🔗 Share Reports",
    description: "Generate secure, expiring links to share your reports with doctors or family members."
  },
  voice: {
    title: "🎤 Voice Chat",
    description: "Click the mic button to ask questions about your health using your voice. Supports multiple languages!"
  },
  darkMode: {
    title: "🌙 Dark Mode",
    description: "Toggle between light, dark, or system theme. The app automatically adapts to your preference."
  },
  swipeActions: {
    title: "👆 Swipe Actions",
    description: "On mobile, swipe left to delete or right to archive/share. Quick actions at your fingertips!"
  }
}
