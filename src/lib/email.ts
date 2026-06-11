import { SITE_CONFIG } from "@/lib/site-config"

export type EmailTemplateKey =
  | "welcome"
  | "tradeConfirmation"
  | "passwordReset"
  | "supportAutoReply"

type SendEmailInput = {
  template: EmailTemplateKey
  to: string
  variables?: Record<string, string | number | boolean | null | undefined>
}

type SendEmailResult =
  | { sent: true }
  | { sent: false; reason: "not_configured" | "request_failed" }

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || SITE_CONFIG.canonicalUrl
const FROM_EMAIL = process.env.MAIL_FROM_EMAIL || SITE_CONFIG.supportEmail
const FROM_NAME = process.env.MAIL_FROM_NAME || `${SITE_CONFIG.name} Support`

export const OFFICIAL_EMAIL_SIGNATURE = {
  name: "Firma Profesional Soporte (Mejorada)",
  html:
    `<p style="margin:0 0 8px;font-weight:700;">${SITE_CONFIG.name} Support</p>` +
    `<p style="margin:0;">${SITE_CONFIG.tagline}</p>` +
    `<p style="margin:8px 0 0;"><a href="${SITE_CONFIG.canonicalUrl}">${SITE_CONFIG.canonicalUrl}</a></p>` +
    `<p style="margin:0;"><a href="mailto:${SITE_CONFIG.supportEmail}">${SITE_CONFIG.supportEmail}</a></p>`,
  text: `${SITE_CONFIG.name} Support\n${SITE_CONFIG.tagline}\n${SITE_CONFIG.canonicalUrl}\n${SITE_CONFIG.supportEmail}`,
} as const

export const EMAIL_TEMPLATES: Record<EmailTemplateKey, { hostingerName: string; defaultSubject: string; envTemplateId: string }> = {
  welcome: {
    hostingerName: "Bienvenida - Nuevo Usuario",
    defaultSubject: "Welcome to Trading Tazos Game",
    envTemplateId: "HOSTINGER_TEMPLATE_WELCOME_ID",
  },
  tradeConfirmation: {
    hostingerName: "Confirmacion de Intercambio",
    defaultSubject: "Your TTG trade is confirmed",
    envTemplateId: "HOSTINGER_TEMPLATE_TRADE_CONFIRMATION_ID",
  },
  passwordReset: {
    hostingerName: "Recuperacion de Contrasena",
    defaultSubject: "Reset your Trading Tazos Game password",
    envTemplateId: "HOSTINGER_TEMPLATE_PASSWORD_RESET_ID",
  },
  supportAutoReply: {
    hostingerName: "Respuesta Rapida Soporte",
    defaultSubject: "We received your Trading Tazos Game support request",
    envTemplateId: "HOSTINGER_TEMPLATE_SUPPORT_AUTOREPLY_ID",
  },
}

export function buildPasswordResetUrl(token: string): string {
  return `${SITE_URL}/reset-password?token=${encodeURIComponent(token)}`
}

export function buildEmailVerificationUrl(token: string): string {
  return `${SITE_URL}/verify-email?token=${encodeURIComponent(token)}`
}

export function isTransactionalEmailConfigured(): boolean {
  return Boolean(process.env.HOSTINGER_EMAIL_API_URL && process.env.HOSTINGER_EMAIL_API_TOKEN)
}

export async function sendTransactionalEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const endpoint = process.env.HOSTINGER_EMAIL_API_URL
  const token = process.env.HOSTINGER_EMAIL_API_TOKEN

  if (!endpoint || !token) {
    console.warn(`[email] skipped ${input.template}: Hostinger email API is not configured`)
    return { sent: false, reason: "not_configured" }
  }

  const template = EMAIL_TEMPLATES[input.template]
  const templateId = process.env[template.envTemplateId]
  const payload = {
    template: template.hostingerName,
    templateId,
    subject: template.defaultSubject,
    from: {
      name: FROM_NAME,
      email: FROM_EMAIL,
    },
    replyTo: SITE_CONFIG.supportEmail,
    to: input.to,
    variables: {
      siteName: SITE_CONFIG.name,
      siteUrl: SITE_URL,
      supportEmail: SITE_CONFIG.supportEmail,
      tagline: SITE_CONFIG.tagline,
      signatureName: OFFICIAL_EMAIL_SIGNATURE.name,
      signatureHtml: OFFICIAL_EMAIL_SIGNATURE.html,
      signatureText: OFFICIAL_EMAIL_SIGNATURE.text,
      ...input.variables,
    },
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const body = await response.text().catch(() => "")
      console.error(`[email] ${input.template} failed: ${response.status} ${body.slice(0, 300)}`)
      return { sent: false, reason: "request_failed" }
    }

    return { sent: true }
  } catch (error) {
    console.error(`[email] ${input.template} failed:`, error)
    return { sent: false, reason: "request_failed" }
  }
}

export function sendTransactionalEmailSoon(input: SendEmailInput): void {
  sendTransactionalEmail(input).catch((error) => {
    console.error(`[email] ${input.template} failed:`, error)
  })
}
