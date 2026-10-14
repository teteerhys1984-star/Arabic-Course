import {
  createContext,
  useCallback,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'

interface LessonMemory {
  values: Record<string, unknown>
  update: (key: string, action: SetStateAction<unknown>, initial: unknown) => void
}

const LessonMemoryContext = createContext<LessonMemory | null>(null)

/**
 * LessonFlow mounts only its current step. Keep student activity state in this
 * lesson-level provider so leaving a step never erases a selection or result.
 */
export function LessonMemoryProvider({ children }: { children: ReactNode }) {
  const [values, setValues] = useState<Record<string, unknown>>({})
  const update = useCallback((key: string, action: SetStateAction<unknown>, initial: unknown) => {
    setValues((previous) => {
      const current = key in previous ? previous[key] : initial
      const next = typeof action === 'function'
        ? (action as (value: unknown) => unknown)(current)
        : action
      return key in previous && Object.is(current, next) ? previous : { ...previous, [key]: next }
    })
  }, [])
  return <LessonMemoryContext.Provider value={{ values, update }}>{children}</LessonMemoryContext.Provider>
}

/** useState whose value is retained when its LessonFlow step is unmounted. */
// eslint-disable-next-line react-refresh/only-export-components -- this hook is private lesson state, paired with its provider.
export function useLessonState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const memory = useContext(LessonMemoryContext)
  if (!memory) throw new Error('useLessonState must be used within LessonMemoryProvider')
  const { values, update } = memory
  const [initialValue] = useState(initial)
  const value = (key in values ? values[key] : initialValue) as T
  const setValue = useCallback(
    (action: SetStateAction<T>) => update(key, action as SetStateAction<unknown>, initialValue),
    [update, key, initialValue],
  )
  return [value, setValue]
}
