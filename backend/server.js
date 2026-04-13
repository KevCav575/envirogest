import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';


dotenv.config();

const app = express();

// Configuración CRÍTICA para que las Cookies funcionen entre puertos distintos
app.use(cors({
  origin: process.env.APP_URL, // Tu frontend de Vite (ej. http://localhost:5173)
  credentials: true // Permite enviar y recibir cookies
}));
app.use(express.json());
app.use(cookieParser());

// Conexión a Supabase usando la clave secreta del servidor
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// 1. ENDPOINT: Registro (Contraseñas Hasheadas y Nodemailer)
app.post('/api/registro', async (req, res) => {
  const { nombre, empresa, giro, email, pwd } = req.body;

  try {
    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase.from('usuarios').select('id').eq('email', email).single();
    if (existingUser) return res.status(400).json({ error: "El correo ya está registrado." });

    // Hashear contraseña y generar token
    const hashedPassword = await bcrypt.hash(pwd, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Guardar en base de datos (id lo genera Supabase automáticamente)
    const { data: newUser, error: dbError } = await supabase.from('usuarios').insert([{
      email,
      nombre,
      empresa,
      giro,
      rol: req.body.rol || 'cliente',
      pwd_hash: hashedPassword,
      token: verificationToken,
      verificado: false
    }]).select().single();

    if (dbError) throw dbError;

    // Definir la URL de verificación ANTES de usarla en el HTML
    const verifyUrl = `${process.env.APP_URL}/verificacion?token=${verificationToken}`;

    // Enviar correo (Faltaba la envoltura transporter.sendMail)
    await transporter.sendMail({
      from: `"Equipo BioImpact" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Verifica tu cuenta - BioImpact",
      html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body, table, td, p, a { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
                  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
                  img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
                  table { border-collapse: collapse !important; }
                </style>
              </head>
              <body style="margin: 0 !important; padding: 0 !important; background-color: #f4f4f4;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center" style="padding: 20px 0;">
                      <table border="0" cellpadding="0" cellspacing="0" width="680" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                        <tr>
                          <td align="center" style="padding: 10px 40px; font-family: Arial, sans-serif; font-size: 12px; color: #3f3f3f; opacity: 0.5;">
                            Si tienes problemas para ver este correo, haz clic <a href="${verifyUrl}" style="color: #3f3f3f;">aquí</a>.
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding: 0 40px;">
                            <hr style="border: 0; border-top: 1px solid #d1d1d1; margin: 0;">
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 40px 40px 20px 40px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                <td width="60%" valign="top" style="font-family: Arial, sans-serif;">
                                  <h1 style="margin: 0; color: #42505c; font-size: 48px; line-height: 56px; font-weight: bold;">
                                    ¡Solo un paso más ${nombre}!
                                  </h1>
                                  <p style="margin: 25px 0 0 0; color: #3f3f3f; font-size: 14px; line-height: 24px;">
                                    Haz clic en el botón <strong>“¡Da click aquí para confirmar!”</strong> para autenticar tu nueva cuenta.
                                  </p>
                                </td>
                                <td width="40%" align="right" valign="middle">
                                  <img src="cid:logo_bioimpact" alt="BioImpact" width="220" style="display: block; border-radius: 10px;">
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 0 40px 30px 40px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr><td style="font-family: Arial, sans-serif; font-size: 12px; color: #333333; padding-bottom: 5px;">Link de Activación</td></tr>
                              <tr>
                                <td style="border: 1px solid #d1d1d1; padding: 15px; background-color: #f9f9f9; border-radius: 4px;">
                                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                      <td style="font-family: Arial, sans-serif; font-size: 14px; color: #000000; opacity: 0.6;">${verifyUrl}</td>
                                      <td align="right" style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold;">
                                        <a href="${verifyUrl}" style="color: #225727; text-decoration: none;">COPIAR URL</a>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td align="left" style="padding: 0 40px 40px 40px;">
                            <table border="0" cellspacing="0" cellpadding="0" width="100%">
                              <tr>
                                <td align="center" bgcolor="#225727" style="border-radius: 4px;">
                                  <a href="${verifyUrl}" target="_blank" style="padding: 18px 0; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; display: block; width: 100%;">
                                    ¡Da click aquí para confirmar!
                                  </a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding: 20px 40px 40px 40px; font-family: Arial, sans-serif; font-size: 11px; color: #3f3f3f; line-height: 18px; opacity: 0.6;">
                            Si no solicitaste este correo, puedes ignorarlo. Haz clic en <a href="#" style="color: #3f3f3f;">Darse de baja</a> en cualquier momento.
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
            `
    });

    res.json({ success: true, message: "Registro exitoso. Revisa tu correo." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor." });
  }
});

// 2. ENDPOINT: Verificación de Email
app.post('/api/verificar', async (req, res) => {
  const { token } = req.body;

  try {
    const { data: user } = await supabase.from('usuarios').select('id').eq('token', token).single();
    if (!user) return res.status(400).json({ error: "Token inválido o expirado." });

    // Marcar como verificado y borrar el token
    await supabase.from('usuarios').update({ verificado: true, token: null }).eq('id', user.id);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor." });
  }
});

// 3. ENDPOINT: Login y creación de Session Cookie HTTP-Only
app.post('/api/login', async (req, res) => {
  const { email, pwd } = req.body;

  try {
    const { data: user } = await supabase.from('usuarios').select('*').eq('email', email).single();
    if (!user) return res.status(401).json({ error: "Credenciales incorrectas." });

    if (!user.verificado) return res.status(403).json({ error: "Debes verificar tu correo primero." });

    // Comparar hashes
    const match = await bcrypt.compare(pwd, user.pwd_hash);
    if (!match) return res.status(401).json({ error: "Credenciales incorrectas." });

    // Crear token JWT para la sesión
    const sessionToken = jwt.sign(
      { id: user.id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Enviar Cookie segura (HTTP-Only)
    res.cookie('bioimpact_session', sessionToken, {
      httpOnly: true, // Javascript en el frontend NO puede leer esto (Protección XSS)
      secure: process.env.NODE_ENV === 'production', // true en HTTPS
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000 // 8 horas
    });

    // Devolver perfil sin datos sensibles
    delete user.pwd_hash;
    delete user.token;

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor." });
  }
});

// 4. ENDPOINT: Obtener usuario actual (para cuando recargas la página)
app.get('/api/me', async (req, res) => {
  const token = req.cookies.bioimpact_session;
  if (!token) return res.status(401).json({ user: null });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { data: user } = await supabase.from('usuarios').select('id, nombre, empresa, giro, rol').eq('id', decoded.id).single();

    res.json({ user });
  } catch (error) {
    res.clearCookie('bioimpact_session');
    res.status(401).json({ user: null });
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('bioimpact_session');
  res.json({ success: true });
});

// Middleware: verifica la cookie JWT y adjunta el usuario decodificado
function requireAuth(req, res, next) {
  const token = req.cookies.bioimpact_session;
  if (!token) return res.status(401).json({ error: 'No autenticado.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.clearCookie('bioimpact_session');
    res.status(401).json({ error: 'Sesión expirada.' });
  }
}

// 5. ENDPOINT: Obtener el proyecto del cliente autenticado
app.get('/api/mi-proyecto', requireAuth, async (req, res) => {
  try {
    const { data: proj, error } = await supabase
      .from('proyectos')
      .select('id')
      .eq('cliente_id', req.user.id)
      .limit(1)
      .single();

    if (error || !proj) return res.json({ projectId: null });
    res.json({ projectId: proj.id });
  } catch (err) {
    res.status(500).json({ error: 'Error buscando proyecto.' });
  }
});

// 6. ENDPOINT: Obtener todos los datos del workspace de un proyecto
app.get('/api/workspace/:projectId', requireAuth, async (req, res) => {
  const { projectId } = req.params;

  try {
    const [projReq, tramitesReq, alertasReq, isoReq] = await Promise.all([
      supabase.from('proyectos').select('*').eq('id', projectId).single(),
      supabase.from('tramites').select('*').eq('proyecto_id', projectId),
      supabase.from('alertas').select('*').eq('proyecto_id', projectId),
      supabase.from('iso14001_progreso').select('*').eq('proyecto_id', projectId).maybeSingle()
    ]);

    if (projReq.error) return res.status(404).json({ error: 'Proyecto no encontrado.' });

    res.json({
      proyecto: projReq.data,
      tramites: tramitesReq.data || [],
      alertas: alertasReq.data || [],
      iso14001: isoReq.data || { secciones: {} }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error cargando workspace.' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Backend seguro corriendo en http://localhost:${process.env.PORT}`);
});