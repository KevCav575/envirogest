import nodemailer from 'nodemailer';

// Configuración del servidor SMTP (ej. Gmail, SendGrid, Hostinger)
export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true, // true para port 465, false para otros
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

export const sendVerificationEmail = async (email: string, token: string) => {
    // Construimos la URL de verificación que leerá tu componente verificacion.tsx
    const verifyUrl = `${process.env.APP_URL}/verificacion?token=${token}`;

    const mailOptions = {
        from: '"BioImpact" <no-reply@tudominio.com>',
        to: email,
        subject: 'Verifica tu cuenta',
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
        <h2>¡Bienvenido!</h2>
        <p>Gracias por registrarte. Por favor, verifica tu correo haciendo clic en el siguiente enlace:</p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 10px 20px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 5px;">
          Verificar mi cuenta
        </a>
        <p>Si no solicitaste esta cuenta, ignora este correo.</p>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
};