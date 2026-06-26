import { handlers } from "@/auth"

// This single line wires GET and POST to NextAuth's built-in handler.
// Handles: sign-in, sign-out, session, CSRF token, callbacks.
export const { GET, POST } = handlers
