import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';

const app = express();
const PORT = 3000;

app.use(express.json());

// API: Send Email Notification via SMTP
app.post('/api/notify-email', async (req, res) => {
  try {
    const { toEmail, subject, subName, price, billingDate, daysLeft, cancelUrl } = req.body;

    if (!toEmail) {
      return res.status(400).json({ success: false, message: 'E-posta adresi gerekli.' });
    }

    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || `"Abonelik Takibi" <${user || 'no-reply@gurlabs.com'}>`;

    if (!host || !user || !pass) {
      return res.status(400).json({
        success: false,
        message: 'Sunucu SMTP ayarları (.env) henüz yapılandırılmamış. Lütfen SMTP_HOST, SMTP_USER ve SMTP_PASS değerlerini tanımlayın.'
      });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px; color: #18181b; }
          .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: #09090b; padding: 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
          .header p { margin: 4px 0 0 0; font-size: 12px; color: #a1a1aa; }
          .body { padding: 24px; }
          .sub-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; background: #fef3c7; color: #d97706; font-size: 12px; font-weight: 700; margin-bottom: 12px; }
          .sub-title { font-size: 22px; font-weight: 800; margin: 0 0 4px 0; color: #09090b; }
          .sub-price { font-size: 18px; font-weight: 700; color: #059669; margin-bottom: 20px; }
          .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
          .info-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; }
          .info-row:last-child { margin-bottom: 0; }
          .info-label { color: #64748b; }
          .info-val { font-weight: 600; color: #0f172a; }
          .btn-cancel { display: block; text-align: center; background: #dc2626; color: #ffffff !important; text-decoration: none; padding: 12px 20px; border-radius: 12px; font-weight: 700; font-size: 14px; margin-bottom: 12px; }
          .footer { padding: 16px 24px; background: #fafafa; border-top: 1px solid #f4f4f5; text-align: center; font-size: 11px; color: #71717a; }
          .footer a { color: #10b981; font-weight: 700; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>Abonelik Hatırlatması</h1>
            <p>Powered By GurLabs</p>
          </div>
          <div class="body">
            <span class="sub-badge">🔔 Yenileme / İptal Hatırlatıcısı</span>
            <div class="sub-title">${subName || 'Abonelik'}</div>
            <div class="sub-price">${price ? `₺${price}` : ''}</div>
            <div class="info-box">
              <div class="info-row">
                <span class="info-label">Kalan Süre:</span>
                <span class="info-val">${daysLeft !== undefined ? `${daysLeft} gün kaldı` : 'Bugün'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Yenileme Tarihi:</span>
                <span class="info-val">${billingDate || 'Yarın'}</span>
              </div>
            </div>
            ${cancelUrl ? `<a href="${cancelUrl}" class="btn-cancel" target="_blank">Aboneliği İptal Et / Yönet</a>` : ''}
          </div>
          <div class="footer">
            Abonelik Takibi • <a href="https://gurlabs.com" target="_blank">GurLabs</a>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from,
      to: toEmail,
      subject: subject || `🔔 Abonelik Hatırlatması: ${subName}`,
      html: htmlContent
    });

    return res.json({ success: true, message: 'Hatırlatma e-postası başarıyla gönderildi.' });
  } catch (error: any) {
    console.error('Email send error:', error);
    return res.status(500).json({ success: false, message: error.message || 'E-posta gönderilirken hata oluştu.' });
  }
});

// API: Send Discord Webhook Notification
app.post('/api/notify-discord', async (req, res) => {
  try {
    const { webhookUrl, subName, price, billingDate, daysLeft, category } = req.body;

    if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      return res.status(400).json({ success: false, message: 'Geçerli bir Discord Webhook URL adresi girin.' });
    }

    const embed = {
      title: `🔔 Abonelik Hatırlatması: ${subName || 'Test Servisi'}`,
      description: `**${subName}** aboneliğinizin ödeme yenileme zamanı geldi.`,
      color: 0x10B981, // Emerald green
      fields: [
        { name: '💰 Tutar', value: `₺${price || '0'}`, inline: true },
        { name: '📅 Yenileme Tarihi', value: billingDate || 'Bugün', inline: true },
        { name: '⏳ Kalan Süre', value: daysLeft !== undefined ? `${daysLeft} Gün` : 'Yaklaşıyor', inline: true },
        { name: '🏷️ Kategori', value: category || 'Genel', inline: true }
      ],
      footer: {
        text: 'Abonelik Takibi • Powered By GurLabs',
        icon_url: 'https://gurlabs.com/favicon.ico'
      },
      timestamp: new Date().toISOString()
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Abonelik Hatırlatıcı',
        embeds: [embed]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ success: false, message: `Discord Webhook Hatası: ${errText}` });
    }

    return res.json({ success: true, message: 'Discord bildirimi başarıyla gönderildi!' });
  } catch (error: any) {
    console.error('Discord notification error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Discord bildirimi gönderilemedi.' });
  }
});

// API: Send Custom Webhook Notification (Zapier / n8n / Make / WhatsApp)
app.post('/api/notify-webhook', async (req, res) => {
  try {
    const { webhookUrl, subName, price, billingDate, daysLeft, category } = req.body;

    if (!webhookUrl || (!webhookUrl.startsWith('http://') && !webhookUrl.startsWith('https://'))) {
      return res.status(400).json({ success: false, message: 'Geçerli bir Webhook HTTP/HTTPS URL girin.' });
    }

    const payload = {
      event: 'subscription_renewal_reminder',
      timestamp: new Date().toISOString(),
      subscription: {
        name: subName || 'Test Servisi',
        price: price || 0,
        billingDate: billingDate || new Date().toISOString().split('T')[0],
        daysLeft: daysLeft ?? 0,
        category: category || 'Genel'
      },
      source: 'Abonelik Takibi (GurLabs)'
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      return res.status(response.status).json({ success: false, message: `Webhook sunucusu ${response.status} yanıtı verdi.` });
    }

    return res.json({ success: true, message: 'Özel Webhook bildirimi başarıyla iletildi!' });
  } catch (error: any) {
    console.error('Custom Webhook error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Custom Webhook gönderilemedi.' });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
