/**
 * The single source of truth for the official course contact.
 *
 * The instructor's phone number and the WhatsApp deep link are declared here once and
 * are never typed again anywhere else in the app. Every surface that needs them (the
 * shared shell header and its contact element) imports from this module, so a future
 * number change is a one-line edit — and `scripts/check-architecture.mjs` fails the
 * build if the raw number or a second WhatsApp URL reappears elsewhere.
 *
 * The number is published in two forms:
 *   - `phoneDisplay`       — exactly how the instructor writes it: 0930215022
 *   - `phoneInternational` — the same number with the Syrian country code (+963), which
 *                            is what the WhatsApp deep link requires.
 */
export const INSTRUCTOR_CONTACT = {
  /** Instructor name, exactly as it is shown to the student. */
  name: 'المهندس سومر شاهين',
  /** Local display form of the number (as printed on screen). */
  phoneDisplay: '0930215022',
  /** International form, Syrian country code 963 without the leading zero. */
  phoneInternational: '963930215022',
} as const

/** Real WhatsApp deep link that opens a chat with the instructor. */
export const instructorWhatsAppUrl = `https://wa.me/${INSTRUCTOR_CONTACT.phoneInternational}`

/**
 * Accessible name for the contact link. It names the destination (WhatsApp) and the
 * person, so screen-reader users hear the same thing sighted users read.
 */
export const instructorContactLabel =
  `التواصل عبر واتساب مع ${INSTRUCTOR_CONTACT.name} على الرقم ${INSTRUCTOR_CONTACT.phoneDisplay}`
