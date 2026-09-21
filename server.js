import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors());

app.use(
  express.json({
    limit: '10mb'
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb'
  })
);

// ============================================================
// RAZORPAY
// ============================================================

const getRazorpayInstance = () => {
  const key_id =
    process.env.RAZORPAY_KEY_ID ||
    process.env.VITE_RAZORPAY_KEY_ID;

  const key_secret =
    process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error(
      'Razorpay credentials are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env'
    );
  }

  return new Razorpay({
    key_id,
    key_secret
  });
};

// In-memory idempotency cache.
// For production, move this to Firebase/database.
const processedPayments = new Set();

// ============================================================
// STAFF ID CARD PDF GENERATOR
// ============================================================

// Helper to draw clean vector icon circles for PDFKit (User, Dept, Phone, Calendar)
function drawIconCircle(doc, iconType, x, y) {
  const isTeal = iconType === 'phone';
  const circleColor = isTeal ? '#0e4b55' : '#047857';

  // Draw circle background (diameter 16, radius 8)
  doc.circle(x + 8, y + 8, 8).fill(circleColor);

  doc.save();
  doc.lineWidth(1.2);
  doc.strokeColor('#ffffff');
  doc.fillColor('#ffffff');

  if (iconType === 'user') {
    doc.circle(x + 8, y + 5.8, 2.3).fill('#ffffff');
    doc.path(`M ${x + 4.5} ${y + 12.5} C ${x + 4.5} ${y + 9.5} ${x + 11.5} ${y + 9.5} ${x + 11.5} ${y + 12.5}`).stroke('#ffffff');
  } else if (iconType === 'dept') {
    doc.rect(x + 4.5, y + 4.5, 7, 7.5).stroke('#ffffff');
    doc.rect(x + 6.5, y + 9, 3, 3).fill('#ffffff');
  } else if (iconType === 'phone') {
    doc.path(`M ${x + 5} ${y + 5} L ${x + 7} ${y + 5} L ${x + 8.2} ${y + 7.5} L ${x + 7} ${y + 8.8} C ${x + 7.8} ${y + 10.5} ${x + 9.5} ${y + 11.5} ${x + 11} ${y + 10.2} L ${x + 12.2} ${y + 11.2} L ${x + 11} ${y + 13} C ${x + 6} ${y + 13} ${x + 4.5} ${y + 8.5} ${x + 5} ${y + 5}`).fill('#ffffff');
  } else if (iconType === 'calendar') {
    doc.rect(x + 4.5, y + 5, 7, 6.5).stroke('#ffffff');
    doc.moveTo(x + 4.5, y + 7.2).lineTo(x + 11.5, y + 7.2).stroke('#ffffff');
    doc.moveTo(x + 6.5, y + 3.8).lineTo(x + 6.5, y + 5.2).stroke('#ffffff');
    doc.moveTo(x + 9.5, y + 3.8).lineTo(x + 9.5, y + 5.2).stroke('#ffffff');
  }

  doc.restore();
}

function generateStaffIdCardPdfBuffer(staff) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [340, 510],
        margin: 0
      });

      const chunks = [];

      doc.on('data', chunk => {
        chunks.push(chunk);
      });

      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      doc.on('error', err => {
        reject(err);
      });

      // --------------------------------------------------------
      // Page 1: Front Side Card with Background Image
      // --------------------------------------------------------
      const frontPath = path.join(__dirname, 'public', 'Team Member', 'id_card_front.jpg');

      if (fs.existsSync(frontPath)) {
        doc.image(frontPath, 0, 0, { width: 340, height: 510 });
      } else {
        doc.rect(0, 0, 340, 510).fill('#0f172a');
        doc.rect(0, 0, 340, 120).fill('#047857');
        doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold').text('LIFE VISION SOCIETY', 0, 30, { width: 340, align: 'center' });
      }

      // --------------------------------------------------------
      // Staff Profile Photo (Box at x=113, y=154, w=114, h=114, r=18)
      // --------------------------------------------------------
      const photoX = 113;
      const photoY = 154;
      const photoW = 114;
      const photoH = 114;
      const photoR = 18;

      let photoDrawn = false;
      const avatarSrc = staff.avatar || staff.photoDoc;

      // Draw photo box outer border
      doc.roundedRect(photoX, photoY, photoW, photoH, photoR).fillAndStroke('#ffffff', '#10b981');

      if (avatarSrc && typeof avatarSrc === 'string') {
        if (avatarSrc.startsWith('data:image')) {
          try {
            const base64Data = avatarSrc.replace(/^data:image\/\w+;base64,/, '');
            const imgBuffer = Buffer.from(base64Data, 'base64');
            doc.save();
            doc.roundedRect(photoX + 1.5, photoY + 1.5, photoW - 3, photoH - 3, photoR - 1).clip();
            doc.image(imgBuffer, photoX + 1.5, photoY + 1.5, {
              cover: [photoW - 3, photoH - 3],
              align: 'center',
              valign: 'center'
            });
            doc.restore();
            photoDrawn = true;
          } catch (e) {
            console.warn('[Staff ID PDF] Base64 image render notice:', e.message);
          }
        } else if (!avatarSrc.startsWith('http')) {
          const localPhotoPath = path.join(__dirname, 'public', avatarSrc.replace(/^\//, ''));
          if (fs.existsSync(localPhotoPath)) {
            try {
              doc.save();
              doc.roundedRect(photoX + 1.5, photoY + 1.5, photoW - 3, photoH - 3, photoR - 1).clip();
              doc.image(localPhotoPath, photoX + 1.5, photoY + 1.5, {
                cover: [photoW - 3, photoH - 3],
                align: 'center',
                valign: 'center'
              });
              doc.restore();
              photoDrawn = true;
            } catch (e) {
              console.warn('[Staff ID PDF] Local photo render notice:', e.message);
            }
          }
        }
      }

      if (!photoDrawn) {
        const logoPath = path.join(__dirname, 'public', 'image', 'logo.png');
        if (fs.existsSync(logoPath)) {
          try {
            doc.save();
            doc.roundedRect(photoX + 1.5, photoY + 1.5, photoW - 3, photoH - 3, photoR - 1).clip();
            doc.image(logoPath, photoX + 17, photoY + 17, { fit: [80, 80], align: 'center', valign: 'center' });
            doc.restore();
          } catch (e) {}
        }
      }

      // --------------------------------------------------------
      // Staff Name & Designation / Role
      // --------------------------------------------------------
      const staffName = staff.name || 'Staff Member';
      const staffRole = (staff.role || staff.designation || 'Staff').toUpperCase();

      doc.fillColor('#021a10')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text(staffName, 0, 275, { width: 340, align: 'center' });

      doc.fillColor('#047857')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text(staffRole, 0, 293, { width: 340, align: 'center' });

      // --------------------------------------------------------
      // Staff Details Rows with Icon Circles
      // --------------------------------------------------------
      const empId = staff.id || staff.employeeId || 'N/A';
      const dept = staff.department || 'General';
      const phone = staff.phone || '+91 9416362914';
      const joinDate = staff.joinDate || staff.joiningDate || new Date().toISOString().split('T')[0];

      const detailsList = [
        { iconType: 'user', label: 'Employee ID', value: empId },
        { iconType: 'dept', label: 'Department', value: dept },
        { iconType: 'phone', label: 'Contact No.', value: phone },
        { iconType: 'calendar', label: 'Joining Date', value: joinDate }
      ];

      let rowY = 316;
      detailsList.forEach(row => {
        // Draw Icon Circle at x=68
        drawIconCircle(doc, row.iconType, 68, rowY);

        // Label
        doc.fillColor('#1e293b')
           .fontSize(9.5)
           .font('Helvetica-Bold')
           .text(row.label, 90, rowY + 3.5);

        // Colon
        doc.fillColor('#1e293b')
           .fontSize(9.5)
           .font('Helvetica-Bold')
           .text(':', 156, rowY + 3.5);

        // Value
        doc.fillColor('#0f172a')
           .fontSize(9.5)
           .font('Helvetica-Bold')
           .text(String(row.value), 164, rowY + 3.5, { width: 155, height: 14 });

        rowY += 20;
      });

      // --------------------------------------------------------
      // Page 2: Back Side Card with Background Image
      // --------------------------------------------------------
      const backPath = path.join(__dirname, 'public', 'Team Member', 'id_card_back.jpg');
      doc.addPage({ size: [340, 510], margin: 0 });

      if (fs.existsSync(backPath)) {
        doc.image(backPath, 0, 0, { width: 340, height: 510 });
      } else {
        doc.rect(0, 0, 340, 510).fill('#0f172a');
        doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold').text('LIFE VISION SOCIETY', 0, 240, { width: 340, align: 'center' });
      }

      doc.end();

    } catch (err) {
      reject(err);
    }
  });
}

// ============================================================
// GMAIL API
// ============================================================

function getGmailClient() {
  const clientId =
    process.env.GOOGLE_CLIENT_ID?.trim();

  const clientSecret =
    process.env.GOOGLE_CLIENT_SECRET?.trim();

  const refreshToken =
    process.env.GOOGLE_REFRESH_TOKEN?.trim();

  const senderEmail =
    process.env.GOOGLE_USER_EMAIL?.trim();

  if (
    !clientId ||
    !clientSecret ||
    !refreshToken ||
    !senderEmail
  ) {
    throw new Error(
      'Google Gmail API credentials are missing. Check GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_USER_EMAIL and GOOGLE_REFRESH_TOKEN in .env'
    );
  }

  const oauth2Client =
    new google.auth.OAuth2(
      clientId,
      clientSecret,
      'http://localhost:3000/oauth2callback'
    );

  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });

  const gmail = google.gmail({
    version: 'v1',
    auth: oauth2Client
  });

  return {
    gmail,
    senderEmail
  };
}

// ------------------------------------------------------------
// Encode Gmail MIME message
// ------------------------------------------------------------

function createGmailRawMessage({
  from,
  to,
  subject,
  text,
  html,
  pdfBuffer,
  filename
}) {
  const boundary =
    '----=_LifeVisionBoundary_' +
    Date.now() +
    '_' +
    Math.random()
      .toString(36)
      .slice(2);

  const pdfBase64 =
    pdfBuffer.toString('base64');

  const safeFilename =
    String(filename)
      .replace(/[\r\n"]/g, '');

  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: multipart/alternative; boundary="alt-boundary"',
    '',
    '--alt-boundary',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    text,
    '',
    '--alt-boundary',
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    html,
    '',
    '--alt-boundary--',
    '',
    `--${boundary}`,
    `Content-Type: application/pdf; name="${safeFilename}"`,
    `Content-Disposition: attachment; filename="${safeFilename}"`,
    'Content-Transfer-Encoding: base64',
    '',
    pdfBase64,
    '',
    `--${boundary}--`
  ].join('\r\n');

  return Buffer
    .from(message, 'utf8')
    .toString('base64url');
}

// ------------------------------------------------------------
// Send email through Gmail API
// ------------------------------------------------------------

async function sendGmailMessage({
  to,
  subject,
  text,
  html,
  pdfBuffer,
  filename
}) {
  const {
    gmail,
    senderEmail
  } = getGmailClient();

  const fromAddress =
    process.env.EMAIL_FROM?.trim() ||
    `"Life Vision Society Administration" <${senderEmail}>`;

  const raw =
    createGmailRawMessage({
      from: fromAddress,
      to,
      subject,
      text,
      html,
      pdfBuffer,
      filename
    });

  const result =
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw
      }
    });

  return result.data;
}

// ============================================================
// DONATION CONFIG
// ============================================================

app.get(
  '/api/donations/config',
  (req, res) => {
    try {
      const keyId =
        process.env.RAZORPAY_KEY_ID ||
        process.env.VITE_RAZORPAY_KEY_ID;

      if (!keyId) {
        return res.status(500).json({
          success: false,
          error:
            'Razorpay public key is not configured.'
        });
      }

      res.json({
        success: true,
        keyId,
        testMode:
          keyId.startsWith('rzp_test_')
      });

    } catch (err) {
      console.error(
        'Donation config error:',
        err
      );

      res.status(500).json({
        success: false,
        error:
          'Unable to load payment configuration.'
      });
    }
  }
);

// ============================================================
// CREATE RAZORPAY ORDER
// ============================================================

app.post(
  '/api/donations/create-order',
  async (req, res) => {
    try {
      const {
        amount,
        donorName,
        email,
        mobile,
        panNo,
        purpose,
        message
      } = req.body;

      if (
        !amount ||
        Number(amount) <= 0
      ) {
        return res.status(400).json({
          success: false,
          error:
            'Valid donation amount is required'
        });
      }

      if (
        !donorName ||
        !email ||
        !mobile
      ) {
        return res.status(400).json({
          success: false,
          error:
            'Donor Name, Email, and Mobile number are required'
        });
      }

      // --------------------------------------------------------
      // PAN validation
      // --------------------------------------------------------

      let cleanPan = '';

      if (
        panNo &&
        String(panNo).trim() !== ''
      ) {
        cleanPan =
          String(panNo)
            .trim()
            .toUpperCase();

        const panRegex =
          /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

        if (!panRegex.test(cleanPan)) {
          return res.status(400).json({
            success: false,
            error:
              'Invalid PAN format. Standard format is 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).'
          });
        }
      }

      const amountInPaise =
        Math.round(
          Number(amount) * 100
        );

      const receiptId =
        `RCPT_${Date.now()}_${Math.floor(
          100 + Math.random() * 900
        )}`;

      const razorpayKeyId =
        process.env.RAZORPAY_KEY_ID ||
        process.env.VITE_RAZORPAY_KEY_ID;

      if (!razorpayKeyId) {
        return res.status(500).json({
          success: false,
          error:
            'Razorpay key is not configured.'
        });
      }

      let rzp;

      try {
        rzp =
          getRazorpayInstance();

      } catch (credentialError) {
        return res.status(500).json({
          success: false,
          error:
            credentialError.message
        });
      }

      const order =
        await rzp.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: receiptId,
          notes: {
            donorName,
            email,
            mobile,
            purpose:
              purpose ||
              'General Donation',
            message:
              message || ''
          }
        });

      console.log(
        `[Razorpay] Created order ${order.id}`
      );

      return res.json({
        success: true,
        order_id: order.id,
        amount: Number(amount),
        currency: 'INR',
        key_id: razorpayKeyId
      });

    } catch (err) {
      console.error(
        'Error creating donation order:',
        err
      );

      return res.status(500).json({
        success: false,
        error:
          err?.error?.description ||
          err?.message ||
          'Failed to create payment order'
      });
    }
  }
);

// ============================================================
// VERIFY RAZORPAY PAYMENT
// ============================================================

app.post(
  '/api/donations/verify-payment',
  async (req, res) => {
    try {
      const {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        donorData,
        amount,
        purpose
      } = req.body;

      if (
        !razorpay_payment_id ||
        !razorpay_order_id ||
        !razorpay_signature
      ) {
        return res.status(400).json({
          success: false,
          verified: false,
          error:
            'Payment ID, Order ID and Razorpay signature are required.'
        });
      }

      // --------------------------------------------------------
      // Duplicate protection
      // --------------------------------------------------------

      if (
        processedPayments.has(
          razorpay_payment_id
        )
      ) {
        return res.json({
          success: true,
          verified: true,
          duplicate: true,
          message:
            'Payment already processed and verified'
        });
      }

      const secret =
        process.env.RAZORPAY_KEY_SECRET;

      if (!secret) {
        return res.status(500).json({
          success: false,
          verified: false,
          error:
            'Razorpay secret is not configured.'
        });
      }

      // --------------------------------------------------------
      // Signature verification
      // --------------------------------------------------------

      const generatedSignature =
        crypto
          .createHmac(
            'sha256',
            secret
          )
          .update(
            `${razorpay_order_id}|${razorpay_payment_id}`
          )
          .digest('hex');

      const expected =
        Buffer.from(
          generatedSignature,
          'utf8'
        );

      const received =
        Buffer.from(
          razorpay_signature,
          'utf8'
        );

      const isSignatureValid =
        expected.length ===
          received.length &&
        crypto.timingSafeEqual(
          expected,
          received
        );

      if (!isSignatureValid) {
        console.warn(
          `[Razorpay] Invalid signature for payment ${razorpay_payment_id}`
        );

        return res.status(400).json({
          success: false,
          verified: false,
          error:
            'Invalid Razorpay payment signature. Payment verification failed.'
        });
      }

      // --------------------------------------------------------
      // Mark payment as processed
      // --------------------------------------------------------

      processedPayments.add(
        razorpay_payment_id
      );

      const donationId =
        `LVS-DON-${Math.floor(
          100000 +
          Math.random() * 900000
        )}`;

      const receiptNo =
        `RCP-80G-2026-${Math.floor(
          1000 +
          Math.random() * 9000
        )}`;

      const pan =
        donorData?.panNo
          ? String(
              donorData.panNo
            ).toUpperCase()
          : '';

      const maskedPan =
        pan
          ? `${pan.slice(0, 5)}****${pan.slice(9)}`
          : 'N/A';

      return res.json({
        success: true,
        verified: true,
        donationId,
        paymentId:
          razorpay_payment_id,
        orderId:
          razorpay_order_id,
        amount,
        donorName:
          donorData?.fullName ||
          'Generous Donor',
        email:
          donorData?.email || '',
        mobile:
          donorData?.mobile || '',
        maskedPan,
        purpose:
          purpose ||
          'Empower Rural Women & Skill Trainees',
        receiptNo,
        status: 'Successful',
        date:
          new Date().toLocaleDateString(
            'en-IN'
          )
      });

    } catch (err) {
      console.error(
        'Error verifying payment signature:',
        err
      );

      return res.status(500).json({
        success: false,
        verified: false,
        error:
          'Server payment verification error'
      });
    }
  }
);

// ============================================================
// RAZORPAY WEBHOOK
// ============================================================

app.post(
  '/api/donations/webhook',
  (req, res) => {
    try {
      const webhookSecret =
        process.env.RAZORPAY_WEBHOOK_SECRET;

      const signature =
        req.headers[
          'x-razorpay-signature'
        ];

      if (
        !webhookSecret ||
        !signature
      ) {
        return res.status(400).json({
          status: 'error',
          message:
            'Webhook secret/signature is not configured.'
        });
      }

      const expectedSignature =
        crypto
          .createHmac(
            'sha256',
            webhookSecret
          )
          .update(
            JSON.stringify(req.body)
          )
          .digest('hex');

      const signatureBuffer =
        Buffer.from(
          signature,
          'utf8'
        );

      const expectedBuffer =
        Buffer.from(
          expectedSignature,
          'utf8'
        );

      if (
        signatureBuffer.length !==
          expectedBuffer.length ||
        !crypto.timingSafeEqual(
          signatureBuffer,
          expectedBuffer
        )
      ) {
        return res.status(400).json({
          status: 'error',
          message:
            'Invalid webhook signature'
        });
      }

      const event =
        req.body?.event;

      const payload =
        req.body?.payload;

      if (
        event === 'payment.captured' ||
        event === 'order.paid'
      ) {
        const paymentEntity =
          payload?.payment?.entity ||
          payload?.order?.entity;

        const paymentId =
          paymentEntity?.id;

        if (
          paymentId &&
          processedPayments.has(
            paymentId
          )
        ) {
          return res.json({
            status: 'ok',
            message:
              'Event already processed (idempotent)'
          });
        }

        if (paymentId) {
          processedPayments.add(
            paymentId
          );
        }
      }

      return res.json({
        status: 'ok',
        received: true
      });

    } catch (err) {
      console.error(
        'Webhook processing error:',
        err
      );

      return res.status(500).json({
        status: 'error',
        message:
          'Webhook processing failed'
      });
    }
  }
);

// ============================================================
// STAFF ID CARD EMAIL
// GMAIL API VERSION
// ============================================================

app.post(
  '/api/staff/send-id-card-email',
  async (req, res) => {
    try {
      // Re-read process.env from .env file on every request so any new .env updates are instantly picked up
      dotenv.config({ override: true });

      const { staff } = req.body;

      if (
        !staff ||
        !staff.email
      ) {
        return res.status(400).json({
          success: false,
          emailSent: false,
          error:
            'Staff details and valid email are required'
        });
      }

      const recipientEmail =
        String(
          staff.email
        ).trim();

      if (!recipientEmail) {
        return res.status(400).json({
          success: false,
          emailSent: false,
          error:
            'Recipient email is empty'
        });
      }

      console.log(
        `[Staff ID Email Service] Generating PDF & dispatching approval email to: ${recipientEmail}`
      );

      // --------------------------------------------------------
      // Generate PDF
      // --------------------------------------------------------

      let pdfBuffer;

      try {
        pdfBuffer =
          await generateStaffIdCardPdfBuffer(
            staff
          );
      } catch (pdfErr) {
        console.error(
          '[Staff ID Email Error] PDF Generation Error:',
          pdfErr
        );

        return res.status(500).json({
          success: false,
          emailSent: false,
          error:
            `Failed to generate ID card PDF: ${pdfErr.message}`
        });
      }

      // --------------------------------------------------------
      // Email content
      // --------------------------------------------------------

      const staffName =
        staff.name ||
        'Staff Member';

      const filename =
        `Staff_ID_Card_${
          staff.id ||
          staff.employeeId ||
          'LVS'
        }.pdf`;

      const subject =
        'Staff ID Card – Approved';

      const text =
        `Dear ${staffName},\n\n` +
        `Your Staff ID Card has been approved by the administration.\n\n` +
        `Please find your official Staff ID Card attached to this email as a PDF.\n\n` +
        `Regards,\n` +
        `Life Vision Society Administration`;

      const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Staff ID Card Approved</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#f8fafc;
  font-family:Arial,Helvetica,sans-serif;
">

<div style="
  max-width:600px;
  margin:30px auto;
  background:#ffffff;
  border:1px solid #e2e8f0;
  border-radius:12px;
  overflow:hidden;
">

  <div style="
    background:#047857;
    padding:20px;
    text-align:center;
    color:#ffffff;
  ">
    <h2 style="
      margin:0;
      font-size:21px;
    ">
      Life Vision Society
    </h2>

    <p style="
      margin:6px 0 0;
      font-size:13px;
      font-weight:bold;
    ">
      Staff ID Card – Approved
    </p>
  </div>

  <div style="
    padding:25px;
    color:#1e293b;
    font-size:14px;
    line-height:1.6;
  ">

    <p>
      Dear <strong>${staffName}</strong>,
    </p>

    <p>
      Your Staff ID Card has been approved
      by the administration.
    </p>

    <p>
      Please find your official Staff ID Card
      attached to this email as a PDF.
    </p>

    <p>
      Regards,<br>
      <strong>
        Life Vision Society Administration
      </strong>
    </p>

  </div>

  <div style="
    border-top:1px solid #e2e8f0;
    padding:12px;
    text-align:center;
    font-size:11px;
    color:#94a3b8;
  ">
    © 2026 Life Vision Society.
    All rights reserved.
  </div>

</div>

</body>
</html>
`;

      // --------------------------------------------------------
      // Read Credentials (supports SMTP, Gmail App Password, and OAuth)
      // --------------------------------------------------------

      const smtpUser = process.env.EMAIL_USER || process.env.SMTP_USER || process.env.GMAIL_USER || process.env.MAIL_USER || process.env.GOOGLE_USER_EMAIL;
      const smtpPass = process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD || process.env.MAIL_PASS;
      const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
      const smtpPort = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 465;

      const clientId = (process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID)?.trim();
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
      const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.trim();
      const senderEmail = (process.env.GOOGLE_USER_EMAIL || smtpUser)?.trim();

      let emailSent = false;
      let messageId = null;
      let warning = null;
      let lastError = null;

      // 1. Attempt Gmail OAuth API if OAuth credentials present
      if (clientId && clientSecret && refreshToken && senderEmail) {
        try {
          console.log(`[Staff ID Email Service] Attempting Gmail OAuth API dispatch via ${senderEmail}...`);
          const info = await sendGmailMessage({
            to: recipientEmail,
            subject,
            text,
            html,
            pdfBuffer,
            filename
          });
          emailSent = true;
          messageId = info?.id || null;
        } catch (gmailErr) {
          lastError = gmailErr.message;
          console.warn('[Staff ID Email Notice] Gmail OAuth API failed:', gmailErr.message);
        }
      }

      // 2. Attempt Nodemailer SMTP (supports Gmail App Passwords & standard SMTP)
      if (!emailSent && smtpUser && smtpPass) {
        try {
          console.log(`[Staff ID Email Service] Attempting Nodemailer SMTP dispatch via ${smtpUser}...`);
          
          const isGmail = smtpHost.includes('gmail') || smtpUser.includes('gmail');
          const transportOpts = isGmail
            ? {
                service: 'gmail',
                auth: { user: smtpUser, pass: smtpPass }
              }
            : {
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: { user: smtpUser, pass: smtpPass }
              };

          const transporter = nodemailer.createTransport(transportOpts);

          const mailOptions = {
            from: process.env.EMAIL_FROM || `"Life Vision Society Administration" <${smtpUser}>`,
            to: recipientEmail,
            subject,
            text,
            html,
            attachments: [
              {
                filename,
                content: pdfBuffer,
                contentType: 'application/pdf'
              }
            ]
          };

          const info = await transporter.sendMail(mailOptions);
          emailSent = true;
          messageId = info.messageId;
        } catch (smtpErr) {
          lastError = smtpErr.message;
          console.warn('[Staff ID Email Notice] Nodemailer SMTP failed:', smtpErr.message);
        }
      }

      if (!emailSent) {
        if (lastError) {
          warning = `Email transport error: ${lastError}. Check your credentials in .env file.`;
        } else {
          warning = `Email credentials (SMTP or Gmail API) not found in .env. Please configure EMAIL_USER & EMAIL_PASS in .env file.`;
        }
        console.log(`[Staff ID Email Service] ${warning}`);
      } else {
        console.log(
          `[Staff ID Email Service] Successfully sent ID Card PDF email to ${recipientEmail}. MessageId: ${messageId}`
        );
      }

      return res.json({
        success: true,
        emailSent,
        recipient: recipientEmail,
        messageId,
        warning,
        message: emailSent
          ? `✓ Staff ID Card PDF successfully emailed to ${recipientEmail}`
          : `✓ Staff ID Card generated successfully. (${warning})`
      });

    } catch (err) {
      console.error(
        '[Staff ID Email Error]:',
        {
          message:
            err?.message,
          code:
            err?.code,
          response:
            err?.response?.data ||
            err?.response
        }
      );

      return res.status(500).json({
        success: false,
        emailSent: false,
        error:
          err?.message ||
          'Server error while dispatching Staff ID Card email'
      });
    }
  }
);

// ============================================================
// UNIVERSAL WEBSITE FORM EMAIL DISPATCHER
// Sends Applicant Confirmation + Admin Notification
// ============================================================

app.post('/api/send-email', async (req, res) => {
  try {
    dotenv.config({ path: path.join(__dirname, 'env'), override: true });
    dotenv.config({ path: path.join(__dirname, '.env'), override: true });

    const { type, applicantEmail, applicantName, data } = req.body;

    if (!applicantEmail) {
      return res.status(400).json({ success: false, error: 'Applicant email address is required' });
    }

    const adminEmail = process.env.GOOGLE_USER_EMAIL || process.env.EMAIL_USER || 'support.lifevision@gmail.com';
    const name = applicantName || data?.name || data?.studentName || data?.fullName || 'Applicant';

    // Helper to send individual message
    const dispatchOne = async ({ to, subject, html, text }) => {
      const smtpUser = process.env.EMAIL_USER || process.env.SMTP_USER || process.env.GMAIL_USER || process.env.GOOGLE_USER_EMAIL;
      const smtpPass = process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD;

      const clientId = (process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID)?.trim();
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
      const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.trim();
      const senderEmail = (process.env.GOOGLE_USER_EMAIL || smtpUser || 'support.lifevision@gmail.com')?.trim();

      // 1. Try Gmail OAuth API
      if (clientId && clientSecret && refreshToken && senderEmail) {
        try {
          const rawMessage = [
            `From: "Life Vision Society" <${senderEmail}>`,
            `To: ${to}`,
            `Subject: ${subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=utf-8',
            '',
            html
          ].join('\r\n');

          const raw = Buffer.from(rawMessage, 'utf8').toString('base64url');
          const { gmail } = getGmailClient();
          await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
          return true;
        } catch (e) {
          console.warn(`[Website Email Service] Gmail OAuth API error for ${to}:`, e.message);
        }
      }

      // 2. Try Nodemailer SMTP
      if (smtpUser && smtpPass) {
        try {
          const isGmail = smtpUser.includes('gmail');
          const transporter = nodemailer.createTransport(
            isGmail
              ? { service: 'gmail', auth: { user: smtpUser, pass: smtpPass } }
              : { host: process.env.SMTP_HOST || 'smtp.gmail.com', port: 465, secure: true, auth: { user: smtpUser, pass: smtpPass } }
          );

          await transporter.sendMail({
            from: `"Life Vision Society" <${smtpUser}>`,
            to,
            subject,
            text: text || subject,
            html
          });
          return true;
        } catch (e) {
          console.warn(`[Website Email Service] Nodemailer SMTP error for ${to}:`, e.message);
        }
      }

      return false;
    };

    let applicantSubject = '';
    let applicantHtml = '';
    let adminSubject = '';
    let adminHtml = '';

    const currentDate = new Date().toISOString().split('T')[0];

    if (type === 'trainer' || type === 'volunteer') {
      const role = data.roleInterest || data.skills || data.interest || 'Skill Trainer / Instructor';
      applicantSubject = `Volunteer & Trainer Application Received – Life Vision Society`;
      applicantHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="background: #047857; padding: 18px; border-radius: 8px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 20px;">Life Vision Society</h2>
            <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: bold;">Volunteer & Trainer Application</p>
          </div>
          <div style="padding: 24px 0; color: #1e293b; font-size: 14px; line-height: 1.6;">
            <p>Dear <strong>${name}</strong>,</p>
            <p>Thank you for expressing interest in joining Life Vision Society as a <strong>${role}</strong>!</p>
            <p>We have received your application details:</p>
            <ul style="background: #f8fafc; padding: 14px 20px; border-radius: 8px;">
              <li><strong>Name:</strong> ${name}</li>
              <li><strong>Email:</strong> ${applicantEmail}</li>
              <li><strong>Phone:</strong> ${data.phone || data.mobile || 'N/A'}</li>
              <li><strong>Role Interest:</strong> ${role}</li>
              <li><strong>Location:</strong> ${data.location || data.city || 'Odisha'}</li>
            </ul>
            <p>Our volunteer & trainer coordinator will review your application and contact you shortly.</p>
            <p>Regards,<br/><strong>Life Vision Society Administration</strong></p>
          </div>
        </div>`;

      adminSubject = `[Website Alert] New Volunteer / Trainer Application: ${name}`;
      adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="background: #0f172a; padding: 18px; border-radius: 8px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 18px;">New Volunteer / Trainer Application</h2>
          </div>
          <div style="padding: 20px 0; color: #1e293b; font-size: 14px; line-height: 1.6;">
            <ul style="background: #f8fafc; padding: 14px 20px; border-radius: 8px;">
              <li><strong>Applicant Name:</strong> ${name}</li>
              <li><strong>Email:</strong> ${applicantEmail}</li>
              <li><strong>Phone:</strong> ${data.phone || data.mobile || 'N/A'}</li>
              <li><strong>Role / Skill:</strong> ${role}</li>
              <li><strong>Location:</strong> ${data.location || data.city || 'N/A'}</li>
              <li><strong>Date:</strong> ${currentDate}</li>
            </ul>
          </div>
        </div>`;

    } else if (type === 'placement') {
      const course = data.course || data.higherCourse || 'Placement Support';
      const appId = data.applicationId || data.id || `PLC-${Date.now().toString().slice(-4)}`;

      applicantSubject = `Placement Support Application Received (ID: ${appId}) – Life Vision Society`;
      applicantHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="background: #047857; padding: 18px; border-radius: 8px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 20px;">Life Vision Society</h2>
            <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: bold;">Placement Support Application</p>
          </div>
          <div style="padding: 24px 0; color: #1e293b; font-size: 14px; line-height: 1.6;">
            <p>Dear <strong>${name}</strong>,</p>
            <p>Your request for <strong>Placement Support</strong> has been submitted successfully!</p>
            <ul style="background: #f8fafc; padding: 14px 20px; border-radius: 8px;">
              <li><strong>Application ID:</strong> ${appId}</li>
              <li><strong>Course / Training:</strong> ${course}</li>
              <li><strong>Location:</strong> ${data.location || 'Odisha'}</li>
              <li><strong>Date Submitted:</strong> ${currentDate}</li>
            </ul>
            <p>Our Placement Cell will review your profile and contact you for upcoming hiring drives.</p>
            <p>Regards,<br/><strong>Life Vision Society Placement Cell</strong></p>
          </div>
        </div>`;

      adminSubject = `[Website Alert] New Placement Support Application: ${name} (ID: ${appId})`;
      adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="background: #0f172a; padding: 18px; border-radius: 8px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 18px;">New Placement Support Request</h2>
          </div>
          <div style="padding: 20px 0; color: #1e293b; font-size: 14px; line-height: 1.6;">
            <ul style="background: #f8fafc; padding: 14px 20px; border-radius: 8px;">
              <li><strong>Student Name:</strong> ${name}</li>
              <li><strong>Application ID:</strong> ${appId}</li>
              <li><strong>Course / Training:</strong> ${course}</li>
              <li><strong>Email:</strong> ${applicantEmail}</li>
              <li><strong>Mobile:</strong> ${data.phone || data.mobile || 'N/A'}</li>
              <li><strong>Location:</strong> ${data.location || 'N/A'}</li>
            </ul>
          </div>
        </div>`;

    } else if (type === 'csr' || type === 'partner') {
      const org = data.orgName || data.companyName || name;

      applicantSubject = `Thank You for Partnering with Life Vision Society`;
      applicantHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="background: #047857; padding: 18px; border-radius: 8px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 20px;">Life Vision Society</h2>
            <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: bold;">CSR & Institutional Partnership</p>
          </div>
          <div style="padding: 24px 0; color: #1e293b; font-size: 14px; line-height: 1.6;">
            <p>Dear <strong>${name}</strong>,</p>
            <p>Thank you for expressing interest in collaborating with Life Vision Society on behalf of <strong>${org}</strong>.</p>
            <p>Our partnership development team will review your proposal and get in touch with you shortly.</p>
            <p>Regards,<br/><strong>Life Vision Society Partnership Cell</strong></p>
          </div>
        </div>`;

      adminSubject = `[Website Alert] New CSR / Collaboration Proposal from ${org}`;
      adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="background: #0f172a; padding: 18px; border-radius: 8px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 18px;">New Corporate / Institutional Partnership Proposal</h2>
          </div>
          <div style="padding: 20px 0; color: #1e293b; font-size: 14px; line-height: 1.6;">
            <ul style="background: #f8fafc; padding: 14px 20px; border-radius: 8px;">
              <li><strong>Organization / Company:</strong> ${org}</li>
              <li><strong>Contact Person:</strong> ${name}</li>
              <li><strong>Email:</strong> ${applicantEmail}</li>
              <li><strong>Phone:</strong> ${data.phone || data.mobile || 'N/A'}</li>
              <li><strong>Budget / Area:</strong> ${data.budget || data.collabArea || 'N/A'}</li>
              <li><strong>Notes / Message:</strong> ${data.message || data.notes || 'N/A'}</li>
            </ul>
          </div>
        </div>`;

    } else if (type === 'donation') {
      const amount = data.amount || 'N/A';
      const receiptId = data.receiptId || data.id || `RCPT-${Date.now()}`;

      applicantSubject = `Donation Confirmation & Receipt – Life Vision Society`;
      applicantHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="background: #047857; padding: 18px; border-radius: 8px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 20px;">Life Vision Society</h2>
            <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: bold;">Donation Receipt</p>
          </div>
          <div style="padding: 24px 0; color: #1e293b; font-size: 14px; line-height: 1.6;">
            <p>Dear <strong>${name}</strong>,</p>
            <p>Thank you for your generous donation of <strong>₹${amount}</strong> to Life Vision Society!</p>
            <ul style="background: #f8fafc; padding: 14px 20px; border-radius: 8px;">
              <li><strong>Donor Name:</strong> ${name}</li>
              <li><strong>Amount Paid:</strong> ₹${amount}</li>
              <li><strong>Receipt ID:</strong> ${receiptId}</li>
              <li><strong>Purpose:</strong> ${data.purpose || 'General Social Support'}</li>
              <li><strong>Date:</strong> ${currentDate}</li>
            </ul>
            <p>Your support helps empower women, youth, and rural communities across Odisha.</p>
            <p>Regards,<br/><strong>Life Vision Society Finance Team</strong></p>
          </div>
        </div>`;

      adminSubject = `[Website Alert] New Donation Received: ₹${amount} from ${name}`;
      adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="background: #0f172a; padding: 18px; border-radius: 8px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 18px;">New Online Donation Received</h2>
          </div>
          <div style="padding: 20px 0; color: #1e293b; font-size: 14px; line-height: 1.6;">
            <ul style="background: #f8fafc; padding: 14px 20px; border-radius: 8px;">
              <li><strong>Donor Name:</strong> ${name}</li>
              <li><strong>Amount:</strong> ₹${amount}</li>
              <li><strong>Email:</strong> ${applicantEmail}</li>
              <li><strong>Mobile:</strong> ${data.mobile || data.phone || 'N/A'}</li>
              <li><strong>PAN No:</strong> ${data.panNo || 'N/A'}</li>
              <li><strong>Receipt ID:</strong> ${receiptId}</li>
            </ul>
          </div>
        </div>`;

    } else if (type === 'contact') {
      const subjectMsg = data.subject || 'General Inquiry';

      applicantSubject = `We Have Received Your Message – Life Vision Society`;
      applicantHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="background: #047857; padding: 18px; border-radius: 8px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 20px;">Life Vision Society</h2>
            <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: bold;">Contact Inquiry Acknowledgment</p>
          </div>
          <div style="padding: 24px 0; color: #1e293b; font-size: 14px; line-height: 1.6;">
            <p>Dear <strong>${name}</strong>,</p>
            <p>Thank you for contacting Life Vision Society. We have received your inquiry regarding <strong>"${subjectMsg}"</strong> and our team will get back to you shortly.</p>
            <p>Regards,<br/><strong>Life Vision Society Support Team</strong></p>
          </div>
        </div>`;

      adminSubject = `[Website Alert] New Contact Us Inquiry from ${name}`;
      adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="background: #0f172a; padding: 18px; border-radius: 8px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 18px;">New Contact Us Inquiry</h2>
          </div>
          <div style="padding: 20px 0; color: #1e293b; font-size: 14px; line-height: 1.6;">
            <ul style="background: #f8fafc; padding: 14px 20px; border-radius: 8px;">
              <li><strong>Sender Name:</strong> ${name}</li>
              <li><strong>Email:</strong> ${applicantEmail}</li>
              <li><strong>Phone:</strong> ${data.phone || 'N/A'}</li>
              <li><strong>Subject:</strong> ${subjectMsg}</li>
              <li><strong>Message:</strong> ${data.message || 'N/A'}</li>
            </ul>
          </div>
        </div>`;

    } else {
      const program = data.program || data.course || 'Training Program';

      applicantSubject = `Application Received – Life Vision Society`;
      applicantHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="background: #047857; padding: 18px; border-radius: 8px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 20px;">Life Vision Society</h2>
            <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: bold;">Application Confirmation</p>
          </div>
          <div style="padding: 24px 0; color: #1e293b; font-size: 14px; line-height: 1.6;">
            <p>Dear <strong>${name}</strong>,</p>
            <p>Your application for <strong>${program}</strong> has been received successfully.</p>
            <p>Our team will contact you shortly.</p>
            <p>Regards,<br/><strong>Life Vision Society Team</strong></p>
          </div>
        </div>`;

      adminSubject = `[Website Alert] New Application Received from ${name}`;
      adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="background: #0f172a; padding: 18px; border-radius: 8px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 18px;">New Application Submitted</h2>
          </div>
          <div style="padding: 20px 0; color: #1e293b; font-size: 14px; line-height: 1.6;">
            <ul style="background: #f8fafc; padding: 14px 20px; border-radius: 8px;">
              <li><strong>Applicant Name:</strong> ${name}</li>
              <li><strong>Email:</strong> ${applicantEmail}</li>
              <li><strong>Phone:</strong> ${data.phone || data.mobile || 'N/A'}</li>
              <li><strong>Program / Topic:</strong> ${program}</li>
            </ul>
          </div>
        </div>`;
    }

    const [applicantSent, adminSent] = await Promise.all([
      dispatchOne({ to: applicantEmail, subject: applicantSubject, html: applicantHtml }),
      dispatchOne({ to: adminEmail, subject: adminSubject, html: adminHtml })
    ]);

    console.log(`[Website Email Service] Form "${type}" processed. Applicant email sent: ${applicantSent}, Admin email sent: ${adminSent}`);

    return res.json({
      success: true,
      applicantSent,
      adminSent,
      message: `Emails processed for ${applicantEmail}`
    });

  } catch (err) {
    console.error('[Website Email Service Error]:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================
// HEALTH CHECK
// ============================================================

app.get(
  '/api/health',
  (req, res) => {
    res.json({
      success: true,
      server: 'Life Vision Backend',
      status: 'running',
      port: PORT,
      gmailOAuthConfigured:
        Boolean(
          process.env.GOOGLE_CLIENT_ID &&
          process.env.GOOGLE_CLIENT_SECRET &&
          process.env.GOOGLE_REFRESH_TOKEN &&
          process.env.GOOGLE_USER_EMAIL
        ),
      razorpayConfigured:
        Boolean(
          process.env.RAZORPAY_KEY_ID &&
          process.env.RAZORPAY_KEY_SECRET
        )
    });
  }
);

// ============================================================
// PRODUCTION FRONTEND
// ============================================================

if (
  process.env.NODE_ENV ===
  'production'
) {
  app.use(
    express.static(
      path.join(
        __dirname,
        'dist'
      )
    )
  );

  app.get(
    '/{*splat}',
    (req, res) => {
      res.sendFile(
        path.resolve(
          __dirname,
          'dist',
          'index.html'
        )
      );
    }
  );
}

// ============================================================
// START SERVER
// ============================================================

if (process.env.VERCEL !== '1') {

app.listen(
  PORT,
  () => {
    console.log(
      `[Life Vision Backend] Server running on port ${PORT}`
    );

    console.log(
      `[Life Vision Backend] Gmail OAuth configured: ${
        Boolean(
          process.env.GOOGLE_CLIENT_ID &&
          process.env.GOOGLE_CLIENT_SECRET &&
          process.env.GOOGLE_REFRESH_TOKEN &&
          process.env.GOOGLE_USER_EMAIL
        )
      }`
    );

    console.log(
      `[Life Vision Backend] Gmail sender: ${
        process.env.GOOGLE_USER_EMAIL ||
        'not configured'
      }`
    );

    console.log(
      `[Life Vision Backend] Razorpay configured: ${
        Boolean(
          process.env.RAZORPAY_KEY_ID &&
          process.env.RAZORPAY_KEY_SECRET
        )
      }`
    );
  }
);
}

export default app;
