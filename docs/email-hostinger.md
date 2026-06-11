# Trading Tazos Game Email Integration

Date: 2026-06-11
Owner: support@tradingtazosgame.com

## Official Identity

- Sender name: `Trading Tazos Game Support`
- Sender email: `support@tradingtazosgame.com`
- Signature name: `Firma Profesional Soporte (Mejorada)`
- Signature content: site URL, support email, and `Collect. Trade. Battle.`
- Domain requirement: `tradingtazosgame.com` must keep SPF/DKIM valid in Hostinger.

## Master Templates

The application maps the Hostinger templates in `src/lib/email.ts`:

| App key | Hostinger template |
| --- | --- |
| `welcome` | `Bienvenida - Nuevo Usuario` |
| `tradeConfirmation` | `Confirmacion de Intercambio` |
| `passwordReset` | `Recuperacion de Contrasena` |
| `supportAutoReply` | `Respuesta Rapida Soporte` |

## Runtime Variables

Set these only in the VPS `.env`; do not commit secrets:

```env
MAIL_FROM_NAME="Trading Tazos Game Support"
MAIL_FROM_EMAIL=support@tradingtazosgame.com
HOSTINGER_EMAIL_API_URL=
HOSTINGER_EMAIL_API_TOKEN=
HOSTINGER_TEMPLATE_WELCOME_ID=
HOSTINGER_TEMPLATE_TRADE_CONFIRMATION_ID=
HOSTINGER_TEMPLATE_PASSWORD_RESET_ID=
HOSTINGER_TEMPLATE_SUPPORT_AUTOREPLY_ID=
```

## Current Triggers

- Register: sends `welcome` with `name` and `emailVerificationUrl` when email API is configured.
- Forgot password: sends `passwordReset` with `name`, `resetUrl`, and `expiresIn`.
- Marketplace purchase: sends `tradeConfirmation` to buyer and seller.
- Direct trade accepted: sends `tradeConfirmation` to both users.

If Hostinger email is not configured, production never returns reset tokens to users. Development may return reset debug data only outside `NODE_ENV=production`.

## Payload Contract

The email bridge sends:

```json
{
  "template": "Hostinger template name",
  "templateId": "optional env template id",
  "subject": "fallback subject",
  "from": { "name": "Trading Tazos Game Support", "email": "support@tradingtazosgame.com" },
  "replyTo": "support@tradingtazosgame.com",
  "to": "recipient@example.com",
  "variables": {
    "siteName": "Trading Tazos Game",
    "siteUrl": "https://tradingtazosgame.com",
    "supportEmail": "support@tradingtazosgame.com",
    "tagline": "Collect. Trade. Battle.",
    "signatureName": "Firma Profesional Soporte (Mejorada)",
    "signatureHtml": "...",
    "signatureText": "..."
  }
}
```

If Hostinger requires a different payload shape, adapt only `sendTransactionalEmail` in `src/lib/email.ts`.
