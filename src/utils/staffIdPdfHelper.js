import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Email API Configuration Helpers
export const getEmailApiConfig = () => {
  try {
    const saved = localStorage.getItem('lvs_email_api_config');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return {
    provider: 'google_oauth',
    googleClientId: typeof window !== 'undefined' ? localStorage.getItem('lvs_google_client_id') || '' : '',
    googleClientSecret: typeof window !== 'undefined' ? localStorage.getItem('lvs_google_client_secret') || '' : '',
    web3FormsKey: typeof window !== 'undefined' ? localStorage.getItem('lvs_web3forms_key') || '' : '',
    serviceId: typeof window !== 'undefined' ? localStorage.getItem('lvs_emailjs_service_id') || '' : '',
    templateId: typeof window !== 'undefined' ? localStorage.getItem('lvs_emailjs_template_id') || '' : '',
    publicKey: typeof window !== 'undefined' ? localStorage.getItem('lvs_emailjs_public_key') || '' : '',
    apiUrl: ''
  };
};

export const saveEmailApiConfig = (config) => {
  try {
    localStorage.setItem('lvs_email_api_config', JSON.stringify(config));
    if (config.googleClientId) localStorage.setItem('lvs_google_client_id', config.googleClientId);
    if (config.googleClientSecret) localStorage.setItem('lvs_google_client_secret', config.googleClientSecret);
    if (config.web3FormsKey) localStorage.setItem('lvs_web3forms_key', config.web3FormsKey);
    if (config.serviceId) localStorage.setItem('lvs_emailjs_service_id', config.serviceId);
    if (config.templateId) localStorage.setItem('lvs_emailjs_template_id', config.templateId);
    if (config.publicKey) localStorage.setItem('lvs_emailjs_public_key', config.publicKey);
    return true;
  } catch (e) {
    return false;
  }
};

// SVG Icon Strings for ID Cards (Employee ID, Department, Contact, Joining Date)
const svgUserIcon = `<svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
const svgDeptIcon = `<svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/><path d="M16 10h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`;
const svgPhoneIcon = `<svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
const svgCalendarIcon = `<svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

export const generateStaffIdCardHtml = (staffMember) => {
  const frontImgSrc = '/Team Member/id_card_front.jpg';
  const backImgSrc = '/Team Member/id_card_back.jpg';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Staff ID Card - ${staffMember.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800;900&display=swap');
          * { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            color-adjust: exact !important; 
            box-sizing: border-box; 
          }
          body { 
            font-family: 'Plus Jakarta Sans', sans-serif; 
            background: #0f172a; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            gap: 30px; 
            padding: 30px; 
            margin: 0; 
          }
          
          .card-container { 
            width: 340px; 
            height: 510px; 
            position: relative; 
            border-radius: 20px; 
            overflow: hidden; 
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); 
            background: #fff; 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
          }
          .card-bg { 
            width: 100%; 
            height: 100%; 
            object-fit: cover; 
            position: absolute; 
            inset: 0; 
            z-index: 1; 
          }

          /* Overlay Elements for Front Card */
          .photo-box { 
            position: absolute; 
            top: 154px; 
            left: 50%; 
            transform: translateX(-50%); 
            width: 114px; 
            height: 114px; 
            border-radius: 18px; 
            object-fit: cover; 
            z-index: 10; 
            background: #fff; 
            border: 2px solid #10b981; 
          }
          .staff-name { 
            position: absolute; 
            top: 275px; 
            width: 100%; 
            text-align: center; 
            font-size: 14px; 
            font-weight: 900; 
            color: #021a10; 
            z-index: 10; 
            font-family: sans-serif; 
          }
          .staff-role { 
            position: absolute; 
            top: 293px; 
            width: 100%; 
            text-align: center; 
            font-size: 10px; 
            font-weight: 800; 
            color: #047857; 
            z-index: 10; 
            text-transform: uppercase; 
          }

          .info-section { 
            position: absolute; 
            top: 316px; 
            left: 68px; 
            right: 20px; 
            z-index: 10; 
            display: flex; 
            flex-direction: column; 
            gap: 3px; 
          }
          .info-row { 
            display: flex; 
            align-items: center; 
            font-size: 9.5px; 
            line-height: 1; 
          }
          .icon-circle { 
            width: 16px; 
            height: 16px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            margin-right: 6px; 
            flex-shrink: 0; 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
          }
          .bg-emerald { background: #047857 !important; }
          .bg-teal { background: #0e4b55 !important; }
          .info-label { 
            font-weight: 700; 
            color: #1e293b; 
            width: 68px; 
            flex-shrink: 0; 
            font-family: 'Plus Jakarta Sans', sans-serif; 
          }
          .colon { 
            font-weight: 700; 
            color: #1e293b; 
            margin-right: 6px; 
            font-family: 'Plus Jakarta Sans', sans-serif; 
          }
          .info-value { 
            font-weight: 800; 
            color: #0f172a; 
            white-space: nowrap; 
            overflow: hidden; 
            text-overflow: ellipsis; 
            max-width: 145px; 
            font-family: 'Plus Jakarta Sans', sans-serif; 
          }

          @media print {
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body { background: transparent !important; padding: 0 !important; gap: 20px !important; }
            .card-container { page-break-after: always; box-shadow: none !important; border: 1px solid #ddd !important; }
          }
        </style>
      </head>
      <body>
        <!-- FRONT SIDE -->
        <div class="card-container">
          <img src="${frontImgSrc}" class="card-bg" alt="Front ID Template" />
          <img src="${staffMember.avatar || staffMember.photoDoc || '/image/logo.png'}" class="photo-box" alt="Staff Photo" />
          <div class="staff-name">${staffMember.name}</div>
          <div class="staff-role">${staffMember.role || staffMember.designation || 'Staff'}</div>
          
          <div class="info-section">
            <div class="info-row">
              <div class="icon-circle bg-emerald">
                ${svgUserIcon}
              </div>
              <span class="info-label">Employee ID</span>
              <span class="colon">:</span>
              <span class="info-value">${staffMember.id || staffMember.employeeId}</span>
            </div>
            <div class="info-row">
              <div class="icon-circle bg-emerald">
                ${svgDeptIcon}
              </div>
              <span class="info-label">Department</span>
              <span class="colon">:</span>
              <span class="info-value">${staffMember.department}</span>
            </div>
            <div class="info-row">
              <div class="icon-circle bg-teal">
                ${svgPhoneIcon}
              </div>
              <span class="info-label">Contact No.</span>
              <span class="colon">:</span>
              <span class="info-value">${staffMember.phone || '+91 9416362914'}</span>
            </div>
            <div class="info-row">
              <div class="icon-circle bg-emerald">
                ${svgCalendarIcon}
              </div>
              <span class="info-label">Joining Date</span>
              <span class="colon">:</span>
              <span class="info-value">${staffMember.joinDate || staffMember.joiningDate || '2026-01-01'}</span>
            </div>
          </div>
        </div>

        <!-- BACK SIDE -->
        <div class="card-container">
          <img src="${backImgSrc}" class="card-bg" alt="Back ID Template" />
        </div>
      </body>
    </html>
  `;
};

// Google OAuth & Email API Dispatcher using dynamic environment / localStorage credentials
export const sendStaffIdCardEmailApi = async (staffMember) => {
  if (!staffMember || !staffMember.email) {
    return { success: false, emailSent: false, error: 'Staff member email address is missing' };
  }

  const googleClientId = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_CLIENT_ID) 
    ? import.meta.env.VITE_GOOGLE_CLIENT_ID 
    : (typeof window !== 'undefined' ? localStorage.getItem('lvs_google_client_id') || '' : '');
  const savedAccessToken = typeof window !== 'undefined' ? localStorage.getItem('lvs_google_oauth_access_token') : null;

  // 1. First, attempt sending via backend API (/api/staff/send-id-card-email) passing active accessToken if available
  try {
    const response = await fetch('/api/staff/send-id-card-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staff: staffMember, accessToken: savedAccessToken })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.emailSent) {
        return {
          success: true,
          emailSent: true,
          message: data.message || `✓ Staff ID Card email successfully sent to ${staffMember.email}!`
        };
      }
    }
  } catch (backendErr) {
    console.warn("[Staff ID Email Helper] Backend fetch notice:", backendErr);
  }

  // 2. Direct Gmail API if Access Token is stored locally
  if (savedAccessToken) {
    try {
      const rawMessage = [
        `From: Life Vision Society <support.lifevision@gmail.com>`,
        `To: ${staffMember.name} <${staffMember.email}>`,
        `Subject: Staff ID Card – Approved`,
        `MIME-Version: 1.0`,
        `Content-Type: text/html; charset=utf-8`,
        ``,
        `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">`,
        `  <div style="background: #047857; padding: 18px; border-radius: 8px; text-align: center; color: white;">`,
        `    <h2 style="margin: 0; font-size: 20px;">Life Vision Society</h2>`,
        `    <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: bold;">Staff ID Card – Approved</p>`,
        `  </div>`,
        `  <div style="padding: 24px 0; color: #1e293b; font-size: 14px; line-height: 1.6;">`,
        `    <p>Dear <strong>${staffMember.name}</strong>,</p>`,
        `    <p>Your Staff ID Card has been approved by the administration.</p>`,
        `    <p>Please find your Staff ID Card attached to this email as a PDF.</p>`,
        `    <br/>`,
        `    <p style="margin-bottom: 0;">Regards,<br/><strong>Life Vision Society Administration</strong></p>`,
        `  </div>`,
        `</div>`
      ].join('\r\n');

      const base64Raw = btoa(unescape(encodeURIComponent(rawMessage)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const gResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${savedAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: base64Raw })
      });

      if (gResponse.ok) {
        return {
          success: true,
          emailSent: true,
          message: `✓ Staff ID Card email sent directly from support.lifevision@gmail.com to ${staffMember.email}!`
        };
      }
    } catch (gErr) {
      console.warn("Direct Gmail API error:", gErr);
    }
  }

  // 3. Prompt interactive Google OAuth authorization popup using GIS if available
  if (typeof window !== 'undefined') {
    try {
      const getGisToken = () => new Promise((resolve) => {
        const doInit = () => {
          if (window.google?.accounts?.oauth2) {
            const client = window.google.accounts.oauth2.initTokenClient({
              client_id: googleClientId,
              scope: 'https://www.googleapis.com/auth/gmail.send',
              callback: (tokenRes) => resolve(tokenRes?.access_token || null)
            });
            client.requestAccessToken({ prompt: '' });
          } else {
            resolve(null);
          }
        };

        if (window.google?.accounts?.oauth2) {
          doInit();
        } else {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.onload = doInit;
          script.onerror = () => resolve(null);
          document.body.appendChild(script);
        }
      });

      const newToken = await getGisToken();
      if (newToken) {
        localStorage.setItem('lvs_google_oauth_access_token', newToken);
        const res2 = await fetch('/api/staff/send-id-card-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ staff: staffMember, accessToken: newToken })
        });
        if (res2.ok) {
          const d2 = await res2.json();
          if (d2.success) {
            return { success: true, emailSent: true, message: `✓ Email successfully sent to ${staffMember.email}!` };
          }
        }
      }
    } catch (tokenErr) {
      console.warn("GIS token request notice:", tokenErr);
    }
  }

  // 4. Backup dispatch via Web3Forms API to ensure recipient gets email
  try {
    const wResponse = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
        to_email: staffMember.email,
        email: staffMember.email,
        name: staffMember.name,
        subject: 'Staff ID Card – Approved',
        from_name: 'Life Vision Society Administration',
        message: `Dear ${staffMember.name},\n\nYour Staff ID Card has been approved by the administration.\n\nEmployee ID: ${staffMember.id || staffMember.employeeId}\nDepartment: ${staffMember.department}\nContact No: ${staffMember.phone || '+91 9416362914'}\nJoining Date: ${staffMember.joinDate || '2026-01-01'}\n\nRegards,\nLife Vision Society Administration`
      })
    });
    const wData = await wResponse.json();
    if (wData.success) {
      return { success: true, emailSent: true, message: `✓ Staff ID Card email successfully delivered to ${staffMember.email}!` };
    }
  } catch (wErr) {
    console.warn("Web3Forms notice:", wErr);
  }

  return {
    success: false,
    emailSent: false,
    error: `Unable to dispatch email to ${staffMember.email}. Please verify email address and backend connection.`
  };
};

// Direct Download High-Resolution PDF File of Exact View ID Card Design
export const downloadStaffIdCardPdf = async (staffMember) => {
  if (!staffMember) return;

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '740px';
  container.style.background = '#0f172a';
  container.style.padding = '30px';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  container.style.gap = '30px';
  container.style.boxSizing = 'border-box';
  container.style.fontFamily = "'Plus Jakarta Sans', sans-serif";

  const photoUrl = staffMember.avatar || staffMember.photoDoc || '/image/logo.png';
  const staffName = staffMember.name || 'Staff Member';
  const staffRole = staffMember.role || staffMember.designation || 'Staff';
  const empId = staffMember.id || staffMember.employeeId || 'STF-2026-101';
  const dept = staffMember.department || 'Mobilization';
  const phone = staffMember.phone || '+91 9416362914';
  const joinDate = staffMember.joinDate || staffMember.joiningDate || '2026-01-01';

  container.innerHTML = `
    <!-- FRONT SIDE CARD -->
    <div style="width: 340px; height: 510px; position: relative; border-radius: 20px; overflow: hidden; background: #fff; border: 2px solid #10b981; flex-shrink: 0; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
      <img src="/Team Member/id_card_front.jpg" style="width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; z-index: 1;" />
      <img src="${photoUrl}" style="position: absolute; top: 154px; left: 50%; transform: translateX(-50%); width: 114px; height: 114px; border-radius: 18px; object-fit: cover; border: 2px solid #10b981; z-index: 10; background: #fff;" />
      
      <div style="position: absolute; top: 275px; width: 100%; text-align: center; z-index: 10; font-family: sans-serif; padding: 0 10px; box-sizing: border-box;">
        <div style="font-size: 14px; font-weight: 900; color: #021a10; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${staffName}</div>
      </div>
      <div style="position: absolute; top: 293px; width: 100%; text-align: center; z-index: 10; padding: 0 10px; box-sizing: border-box;">
        <div style="font-size: 10px; font-weight: 800; color: #047857; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${staffRole}</div>
      </div>

      <div style="position: absolute; top: 316px; left: 68px; right: 20px; z-index: 10; display: flex; flex-direction: column; gap: 3px; font-family: 'Plus Jakarta Sans', sans-serif;">
        <div style="display: flex; align-items: center; font-size: 9.5px; line-height: 1;">
          <div style="width: 16px; height: 16px; border-radius: 50%; background: #047857; display: flex; align-items: center; justify-content: center; margin-right: 6px; flex-shrink: 0;">${svgUserIcon}</div>
          <span style="font-weight: 700; color: #1e293b; width: 68px; flex-shrink: 0;">Employee ID</span>
          <span style="font-weight: 700; color: #1e293b; margin-right: 6px;">:</span>
          <span style="font-weight: 800; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 145px;">${empId}</span>
        </div>
        <div style="display: flex; align-items: center; font-size: 9.5px; line-height: 1;">
          <div style="width: 16px; height: 16px; border-radius: 50%; background: #047857; display: flex; align-items: center; justify-content: center; margin-right: 6px; flex-shrink: 0;">${svgDeptIcon}</div>
          <span style="font-weight: 700; color: #1e293b; width: 68px; flex-shrink: 0;">Department</span>
          <span style="font-weight: 700; color: #1e293b; margin-right: 6px;">:</span>
          <span style="font-weight: 800; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 145px;">${dept}</span>
        </div>
        <div style="display: flex; align-items: center; font-size: 9.5px; line-height: 1;">
          <div style="width: 16px; height: 16px; border-radius: 50%; background: #0e4b55; display: flex; align-items: center; justify-content: center; margin-right: 6px; flex-shrink: 0;">${svgPhoneIcon}</div>
          <span style="font-weight: 700; color: #1e293b; width: 68px; flex-shrink: 0;">Contact No.</span>
          <span style="font-weight: 700; color: #1e293b; margin-right: 6px;">:</span>
          <span style="font-weight: 800; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 145px;">${phone}</span>
        </div>
        <div style="display: flex; align-items: center; font-size: 9.5px; line-height: 1;">
          <div style="width: 16px; height: 16px; border-radius: 50%; background: #047857; display: flex; align-items: center; justify-content: center; margin-right: 6px; flex-shrink: 0;">${svgCalendarIcon}</div>
          <span style="font-weight: 700; color: #1e293b; width: 68px; flex-shrink: 0;">Joining Date</span>
          <span style="font-weight: 700; color: #1e293b; margin-right: 6px;">:</span>
          <span style="font-weight: 800; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 145px;">${joinDate}</span>
        </div>
      </div>
    </div>

    <!-- BACK SIDE CARD -->
    <div style="width: 340px; height: 510px; position: relative; border-radius: 20px; overflow: hidden; background: #fff; border: 2px solid #10b981; flex-shrink: 0; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
      <img src="/Team Member/id_card_back.jpg" style="width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; z-index: 1;" />
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#0f172a'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
    pdf.save(`Staff_ID_Card_${empId}.pdf`);

  } catch (err) {
    console.error("Error generating PDF:", err);
    printOrSaveStaffIdCardPdf(staffMember);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

export const downloadStaffIdCardHtmlFile = downloadStaffIdCardPdf;

// Trigger Print / PDF window
export const printOrSaveStaffIdCardPdf = (staffMember) => {
  const printWindow = window.open('', '_blank', 'width=800,height=950');
  if (!printWindow) return;
  const htmlContent = generateStaffIdCardHtml(staffMember);
  
  printWindow.document.write(htmlContent);
  printWindow.document.write(`
    <script>
      window.onload = function() { window.print(); }
    </script>
  `);
  printWindow.document.close();
};
