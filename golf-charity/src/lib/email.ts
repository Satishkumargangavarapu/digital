import { Resend } from 'resend'

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not found. Simulating email:', { to, subject })
    return { success: true, simulated: true }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    const { data, error } = await resend.emails.send({
      from: 'Golf Charity <onboarding@resend.dev>',
      to,
      subject,
      html,
    })

    if (error) {
       console.error('Resend API Error:', error)
       return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}
