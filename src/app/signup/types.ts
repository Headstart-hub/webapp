// Brand tokens and gradient
export const COLORS = {
  fg: "#222222",
  primary: "#7070F0",
  primaryDark: "#5A5AD1",
  accent: "#ECD872",
  bg: "rgba(112,112,240,0.10)",
  border: "#ECECEE",
  darkNav: "#1E293B",
} as const

export const primaryGradient = `linear-gradient(90deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`

export enum SignupStep {
  BASIC = "basic",
  INTERESTS = "interests",
  TECHNICAL_SKILLS = "technicalSkills",
  COMPLETE = "complete",
}
