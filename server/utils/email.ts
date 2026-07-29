type EmailMessage = {
  to: string
  subject: string
  text: string
}

export const sendEmail = async (message: EmailMessage) => {
  const apiKey = process.env.NUXT_RESEND_API_KEY
  const from = process.env.NUXT_EMAIL_FROM ?? "Fieldnote <notes@example.com>"

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[Fieldnote email] ${message.subject} for ${message.to}\n${message.text}`)
      return
    }

    throw new Error("NUXT_RESEND_API_KEY is required to send authentication email")
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, ...message }),
  })

  if (!response.ok) {
    throw new Error(`Email delivery failed with status ${response.status}`)
  }
}
