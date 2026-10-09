import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import './styles/global.css'
import './styles/visual-polish.css'
import './styles/lesson-cards.css'
import './styles/sections.css'
import './styles/lesson-four.css'
import './styles/lesson-five.css'
import './styles/lesson-six.css'
import './styles/lesson-seven.css'
import './styles/lesson-eight.css'
import './styles/lesson-nine.css'
import './styles/lesson-ten.css'
import './styles/morphology-lesson-01.css'
import './styles/contact.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
