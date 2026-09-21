import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';
import { google } from 'googleapis';

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
      // Background
      // --------------------------------------------------------

      doc
        .rect(0, 0, 340, 510)
        .fill('#0f172a');

      // --------------------------------------------------------
      // Header
      // --------------------------------------------------------

      doc
        .rect(0, 0, 340, 120)
        .fill('#047857');

      doc
        .fillColor('#ffffff')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(
          'LIFE VISION SOCIETY',
          0,
          30,
          {
            width: 340,
            align: 'center'
          }
        );

      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#a7f3d0')
        .text(
          'OFFICIAL STAFF IDENTITY CARD',
          0,
          52,
          {
            width: 340,
            align: 'center'
          }
        );

      // --------------------------------------------------------
      // Profile photo
      // --------------------------------------------------------

      const photoY = 95;

      doc
        .roundedRect(
          113,
          photoY,
          114,
          114,
          14
        )
        .fillAndStroke(
          '#ffffff',
          '#10b981'
        );

      if (
        staff.avatar &&
        typeof staff.avatar === 'string' &&
        staff.avatar.startsWith('data:image')
      ) {
        try {
          const base64Data =
            staff.avatar.replace(
              /^data:image\/\w+;base64,/,
              ''
            );

          const imgBuffer = Buffer.from(
            base64Data,
            'base64'
          );

          doc.image(
            imgBuffer,
            115,
            photoY + 2,
            {
              fit: [110, 110],
              align: 'center',
              valign: 'center'
            }
          );
        } catch (e) {
          doc
            .fillColor('#047857')
            .fontSize(11)
            .font('Helvetica-Bold')
            .text(
              'STAFF PHOTO',
              113,
              photoY + 48,
              {
                width: 114,
                align: 'center'
              }
            );
        }
      } else {
        doc
          .fillColor('#047857')
          .fontSize(11)
          .font('Helvetica-Bold')
          .text(
            'STAFF PHOTO',
            113,
            photoY + 48,
            {
              width: 114,
              align: 'center'
            }
          );
      }

      // --------------------------------------------------------
      // Name and role
      // --------------------------------------------------------

      doc
        .fillColor('#ffffff')
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(
          staff.name || 'Staff Member',
          10,
          225,
          {
            width: 320,
            align: 'center'
          }
        );

      doc
        .fillColor('#34d399')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(
          (
            staff.role ||
            staff.designation ||
            'STAFF'
          ).toUpperCase(),
          10,
          243,
          {
            width: 320,
            align: 'center'
          }
        );

      // --------------------------------------------------------
      // Details box
      // --------------------------------------------------------

      doc
        .roundedRect(
          20,
          268,
          300,
          195,
          12
        )
        .fill('#1e293b');

      const infoRows = [
        {
          label: 'Employee ID:',
          value:
            staff.id ||
            staff.employeeId ||
            'N/A'
        },
        {
          label: 'Department:',
          value:
            staff.department ||
            'General'
        },
        {
          label: 'Contact No.:',
          value:
            staff.phone ||
            'N/A'
        },
        {
          label: 'Joining Date:',
          value:
            staff.joinDate ||
            staff.joiningDate ||
            new Date()
              .toISOString()
              .split('T')[0]
        },
        {
          label: 'Blood Group:',
          value:
            staff.bloodGroup ||
            'N/A'
        },
        {
          label: 'Status:',
          value:
            'APPROVED & ACTIVE'
        }
      ];

      let rowY = 282;

      infoRows.forEach(row => {
        doc
          .fillColor('#94a3b8')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text(
            row.label,
            35,
            rowY
          );

        doc
          .fillColor('#f8fafc')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text(
            String(row.value),
            135,
            rowY
          );

        rowY += 27;
      });

      // --------------------------------------------------------
      // Footer
      // --------------------------------------------------------

      doc
        .rect(0, 480, 340, 30)
        .fill('#047857');

      doc
        .fillColor('#ffffff')
        .fontSize(8)
        .font('Helvetica-Bold')
        .text(
          'Authorized Signature & Official Seal',
          0,
          490,
          {
            width: 340,
            align: 'center'
          }
        );

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
      // Check Gmail credentials
      // --------------------------------------------------------

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
        console.error(
          '[Staff ID Email Error] Google Gmail API credentials are missing.'
        );

        return res.status(500).json({
          success: false,
          emailSent: false,
          error:
            'Email service is not configured. Check GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_USER_EMAIL and GOOGLE_REFRESH_TOKEN in .env.'
        });
      }

      console.log(
        `[Staff ID Email Service] Gmail API configured for: ${senderEmail}`
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
        `Please find your Staff ID Card attached to this email as a PDF.\n\n` +
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
      Please find your Staff ID Card
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
      // Send using Gmail API
      // --------------------------------------------------------

      console.log(
        `[Staff ID Email Service] Sending Gmail API message to: ${recipientEmail}`
      );

      let info;

      try {
        info =
          await sendGmailMessage({
            to: recipientEmail,
            subject,
            text,
            html,
            pdfBuffer,
            filename
          });

      } catch (gmailError) {
        console.error(
          '[Staff ID Email Error] Gmail API Error:',
          {
            message:
              gmailError?.message,
            code:
              gmailError?.code,
            response:
              gmailError?.response?.data ||
              gmailError?.response
          }
        );

        let message =
          gmailError?.message ||
          'Gmail API failed to send email.';

        if (
          /invalid_grant/i.test(
            message
          )
        ) {
          message =
            'Google OAuth refresh token is invalid or revoked. Generate a new refresh token.';
        }

        if (
          /unauthorized/i.test(
            message
          )
        ) {
          message =
            'Gmail API authorization failed. Check the Google OAuth client and Gmail API configuration.';
        }

        return res.status(500).json({
          success: false,
          emailSent: false,
          error: message
        });
      }

      console.log(
        `[Staff ID Email Service] Successfully sent ID Card PDF email to ${recipientEmail}. MessageId: ${info?.id || 'unknown'}`
      );

      return res.json({
        success: true,
        emailSent: true,
        recipient:
          recipientEmail,
        messageId:
          info?.id || null,
        message:
          `Staff ID Card PDF successfully emailed to ${recipientEmail}`
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
    '*',
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