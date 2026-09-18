export interface QuizOption {
  id: string
  label: string
}

export interface QuizQuestionData {
  id: string
  prompt: string
  options: QuizOption[]
  correctOptionId: string
  explanation: string
}
