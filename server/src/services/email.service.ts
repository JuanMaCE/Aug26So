import { createEmailProvider } from "./email-provider.factory";
import { EmailResult, SendEmailOptions } from "./email-provider.interface";

export interface SendWelcomeEmailOptions {
  to: string;
  name: string;
  secondName?: string;
  verificationLink?: string;
}


export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  const provider = createEmailProvider();
  return provider.send(options);
}

  
export async function sendWelcomeEmail({
  to,
  name,
  secondName = "",
  verificationLink = "http://localhost:5173",
}: SendWelcomeEmailOptions): Promise<EmailResult> {
  const fullName = `${name} ${secondName}`.trim();
  const subject = `¡Bienvenido/a a nuestra plataforma, ${name}! 🎉`;

  const html = buildWelcomeEmailHtml({ fullName, to, verificationLink });
  const text = `¡Hola, ${fullName}!\n\n¡Bienvenido/a a nuestra plataforma! Tu cuenta con correo ${to} ha sido creada correctamente.\n\nPuedes acceder desde aquí: ${verificationLink}\n\nSi no realizaste este registro, por favor ignora este mensaje.`;

  return sendEmail({ to, subject, html, text });
}


function buildWelcomeEmailHtml({
  fullName,
  to,
  verificationLink,
}: {
  fullName: string;
  to: string;
  verificationLink: string;
}): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenida</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #0f172a;
          margin: 0;
          padding: 20px;
          color: #f8fafc;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: #1e293b;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          border: 1px solid #334155;
        }
        .header {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
          padding: 36px 24px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          color: #ffffff;
          font-size: 26px;
          font-weight: 700;
        }
        .content {
          padding: 32px 28px;
        }
        .greeting {
          font-size: 20px;
          font-weight: 600;
          color: #ffffff;
          margin-top: 0;
          margin-bottom: 16px;
        }
        .paragraph {
          font-size: 15px;
          line-height: 1.6;
          color: #cbd5e1;
          margin-bottom: 20px;
        }
        .card-details {
          background-color: #0f172a;
          border-radius: 10px;
          padding: 16px 20px;
          margin: 24px 0;
          border: 1px solid #334155;
        }
        .card-item {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 14px;
        }
        .card-label {
          color: #94a3b8;
        }
        .card-value {
          color: #38bdf8;
          font-weight: 500;
        }
        .btn-wrapper {
          text-align: center;
          margin: 32px 0 20px 0;
        }
        .btn {
          display: inline-block;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #ffffff !important;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 15px;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }
        .footer {
          border-top: 1px solid #334155;
          padding: 20px 28px;
          text-align: center;
          font-size: 12px;
          color: #64748b;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>¡Registro Exitoso!</h1>
        </div>
        <div class="content">
          <h2 class="greeting">Hola, ${fullName} 👋</h2>
          <p class="paragraph">
            ¡Gracias por registrarte en nuestra plataforma! Tu cuenta ha sido creada satisfactoriamente.
          </p>
          <p class="paragraph">
            A continuación te compartimos el resumen de tu cuenta registrada:
          </p>
          <div class="card-details">
            <div class="card-item">
              <span class="card-label">Nombre registrado:</span>
              <span class="card-value">${fullName}</span>
            </div>
            <div class="card-item">
              <span class="card-label">Correo electrónico:</span>
              <span class="card-value">${to}</span>
            </div>
            <div class="card-item">
              <span class="card-label">Estado de la cuenta:</span>
              <span class="card-value" style="color: #4ade80;">Activa / Verificada</span>
            </div>
          </div>
          <div class="btn-wrapper">
            <a href="${verificationLink}" class="btn" target="_blank">Ir a la Plataforma</a>
          </div>
          <p class="paragraph" style="font-size: 13px; color: #94a3b8; text-align: center;">
            Si tú no solicitaste este registro, por favor ignora este correo.
          </p>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} Aug26 Platform. Todos los derechos reservados.
        </div>
      </div>
    </body>
    </html>
  `;
}
