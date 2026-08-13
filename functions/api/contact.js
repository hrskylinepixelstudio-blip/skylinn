export async function onRequestPost(context) {
  try {
    const data = await context.request.json();

    const name = String(data.name || "").trim();
    const email = String(data.email || "").trim();
    const phone = String(data.phone || "").trim();
    const service = String(data.service || "").trim();
    const message = String(
  data.message ||
  data.project ||
  data.projectDetails ||
  data.details ||
  ""
).trim();

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Name, email and message are required."
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const resendApiKey = context.env.RESEND_API_KEY;

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Email service is not configured."
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const emailBody = `
      <h2>New Enquiry - Skyline Pixel Studio</h2>

      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}</p>
      <p><strong>Service:</strong> ${escapeHtml(service || "Not specified")}</p>

      <hr>

      <h3>Message</h3>
      <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>

      <hr>

      <p>
        This enquiry was submitted through
        <strong>skylinn.in</strong>.
      </p>
    `;

    const resendResponse = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "Skyline Website <onboarding@resend.dev>",
          to: ["skylinnvoxel@gmail.com"],
          reply_to: email,
          subject: `New Website Enquiry - ${name}`,
          html: emailBody
        })
      }
    );

    const result = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend error:", result);

      return new Response(
        JSON.stringify({
          success: false,
          message: "Unable to send enquiry."
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Your enquiry has been sent successfully."
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Contact form error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Something went wrong. Please try again."
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
