"use client"

// Simplified toast for now
import { useState, useEffect } from "react"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToastProps = {
    title?: string
    description?: string
    variant?: "default" | "destructive"
}

let count = 0

function genId() {
    count = (count + 1) % Number.MAX_VALUE
    return count.toString()
}

type ActionType = {
    type: "ADD_TOAST"
    toast: ToastProps
} | {
    type: "UPDATE_TOAST"
    toast: Partial<ToastProps>
} | {
    type: "DISMISS_TOAST"
    toastId?: string
} | {
    type: "REMOVE_TOAST"
    toastId?: string
}

interface State {
    toasts: ToastProps[]
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: ActionType) {
    switch (action.type) {
        case "ADD_TOAST":
            memoryState = {
                ...memoryState,
                toasts: [action.toast, ...memoryState.toasts].slice(0, TOAST_LIMIT),
            }
            break
        case "UPDATE_TOAST":
            memoryState = {
                ...memoryState,
                toasts: memoryState.toasts.map((t) =>
                    t === action.toast ? { ...t, ...action.toast } : t
                ),
            }
            break
        case "DISMISS_TOAST":
            // ...
            break
        case "REMOVE_TOAST":
            // ...
            break
    }
    listeners.forEach((listener) => listener(memoryState))
}

export function useToast() {
    const [state, setState] = useState<State>(memoryState)

    useEffect(() => {
        listeners.push(setState)
        return () => {
            const index = listeners.indexOf(setState)
            if (index > -1) {
                listeners.splice(index, 1)
            }
        }
    }, [state])

    return {
        ...state,
        toast: (props: ToastProps) => {
            const id = genId()
            const update = (props: ToastProps) =>
                dispatch({
                    type: "UPDATE_TOAST",
                    toast: { ...props, id },
                } as any)
            const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

            dispatch({
                type: "ADD_TOAST",
                toast: {
                    ...props,
                    id,
                    open: true,
                    onOpenChange: (open: boolean) => {
                        if (!open) dismiss()
                    },
                },
            } as any)

            return {
                id: id,
                dismiss,
                update,
            }
        },
        dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
    }
}
