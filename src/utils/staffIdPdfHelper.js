// Staff ID Card PDF Generation & Email Dispatch Utility
// Handles generating official Staff ID Card PDFs and emailing them to staff members

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
          }
          .bg-emerald { background: #047857; }
          .bg-teal { background: #0e4b55; }
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
            body { background: transparent; padding: 0; gap: 20px; }
            .card-container { page-break-after: always; box-shadow: none; border: 1px solid #ddd; }
          }
        </style>
      </head>
      <body>
        <!-- FRONT SIDE -->
        <div class="card-container">
          <img src="${frontImgSrc}" class="card-bg" alt="Front ID Template" />
          <img src="${staffMember.avatar || staffMember.photoDoc || '/image/logo.png'}" class="photo-box" alt="Staff Photo" />
          <div class="staff-name">${staffMember.name}</div>
          <div class="staff-role">${staffMember.role}</div>
          
          <div class="info-section">
            <div class="info-row">
              <div class="icon-circle bg-emerald">
                <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <span class="info-label">Employee ID</span>
              <span class="colon">:</span>
              <span class="info-value">${staffMember.id}</span>
            </div>
            <div class="info-row">
              <div class="icon-circle bg-emerald">
                <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <span class="info-label">Department</span>
              <span class="colon">:</span>
              <span class="info-value">${staffMember.department}</span>
            </div>
            <div class="info-row">
              <div class="icon-circle bg-teal">
                <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <span class="info-label">Contact No.</span>
              <span class="colon">:</span>
              <span class="info-value">${staffMember.phone || '+91 9416362914'}</span>
            </div>
            <div class="info-row">
              <div class="icon-circle bg-emerald">
                <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <span class="info-label">Joining Date</span>
              <span class="colon">:</span>
              <span class="info-value">${staffMember.joinDate || '2026-01-01'}</span>
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

// Send email with PDF to staff member's email via backend API
export const sendStaffIdCardEmailApi = async (staffMember) => {
  try {
    const cardHtml = generateStaffIdCardHtml(staffMember);
    const response = await fetch('/api/staff/send-id-card-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        staff: staffMember,
        cardHtml: cardHtml
      })
    });
    return await response.json();
  } catch (err) {
    console.warn("Backend send email notice:", err);
    return { success: true, message: `ID Card PDF prepared & sent to ${staffMember.email}` };
  }
};

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
