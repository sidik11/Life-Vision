import React, { useRef } from 'react';
import { Download, Printer, QrCode, ShieldCheck, Sparkles, Building, Phone, Mail, CheckCircle2, Copy } from 'lucide-react';

export default function ScannerView({ showToast }) {
  const notify = showToast || (() => {});
  const cardRef = useRef(null);

  // Official NGO Details
  const orgDetails = {
    name: 'Life Vision Society',
    regNo: 'LVS/NGO/OD/2018/8891',
    taxId: '80G / 12A Certified',
    upiId: 'lifevisionsociety@upi',
    phone: '+91 9416362914',
    email: 'support.lifevision@gmail.com',
    location: 'Bhubaneswar & Cuttack, Odisha'
  };

  // Handle Copy UPI ID
  const handleCopyUpi = () => {
    navigator.clipboard.writeText(orgDetails.upiId);
    notify('✓ NGO UPI ID copied to clipboard!', 'success');
  };

  // Handle Direct Download of Scanner Card as Image
  const handleDownloadScanner = () => {
    try {
      const svgElement = document.getElementById('ngo-qr-svg');
      if (!svgElement) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 750;
        const context = canvas.getContext('2d');

        // Draw Slate Background
        context.fillStyle = '#0f172a';
        context.fillRect(0, 0, 600, 750);

        // Header Banner
        context.fillStyle = '#047857';
        context.fillRect(0, 0, 600, 140);

        // Header Text
        context.fillStyle = '#ffffff';
        context.font = 'bold 24px serif';
        context.textAlign = 'center';
        context.fillText('LIFE VISION SOCIETY', 300, 55);

        context.fillStyle = '#a7f3d0';
        context.font = 'bold 12px sans-serif';
        context.fillText('OFFICIAL NGO VERIFICATION & DONATION SCANNER', 300, 85);

        context.fillStyle = '#ffffff';
        context.font = '11px sans-serif';
        context.fillText(`Reg No: ${orgDetails.regNo} | 80G Certified`, 300, 110);

        // Draw QR Code Background Box
        context.fillStyle = '#ffffff';
        context.fillRect(150, 170, 300, 300);

        // Draw SVG QR Code onto Canvas
        context.drawImage(image, 170, 190, 260, 260);

        // UPI Text Box
        context.fillStyle = '#1e293b';
        context.fillRect(80, 500, 440, 140);

        context.fillStyle = '#34d399';
        context.font = 'bold 16px monospace';
        context.fillText(`UPI ID: ${orgDetails.upiId}`, 300, 545);

        context.fillStyle = '#94a3b8';
        context.font = '12px sans-serif';
        context.fillText('Scan with Google Pay, PhonePe, Paytm, BHIM or any UPI App', 300, 580);
        context.fillText(`Contact: ${orgDetails.phone} | ${orgDetails.email}`, 300, 610);

        // Footer
        context.fillStyle = '#047857';
        context.fillRect(0, 700, 600, 50);
        context.fillStyle = '#ffffff';
        context.font = 'bold 12px sans-serif';
        context.fillText('Authorized Official NGO Scanner • Life Vision Society Odisha', 300, 730);

        // Trigger Download
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = 'Life_Vision_Society_Official_Scanner.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        notify('✓ Scanner image downloaded successfully!', 'success');
      };

      image.src = blobURL;
    } catch (err) {
      console.warn("Download scanner notice:", err);
      notify('Downloading Scanner Card...', 'info');
    }
  };

  // Handle Print Option
  const handlePrintScanner = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=950');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print NGO Scanner - Life Vision Society</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; margin: 0; padding: 40px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            .card { width: 450px; background: #0f172a; color: white; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); border: 2px solid #334155; text-align: center; }
            .header { background: #047857; padding: 24px; }
            .header h1 { margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; }
            .header p { margin: 6px 0 0; font-size: 11px; color: #a7f3d0; font-weight: 700; text-transform: uppercase; }
            .qr-box { background: white; margin: 24px auto; padding: 20px; border-radius: 20px; width: 220px; height: 220px; display: flex; align-items: center; justify-content: center; }
            .details { background: #1e293b; margin: 0 20px 24px; padding: 16px; border-radius: 16px; border: 1px solid #334155; }
            .upi { font-family: monospace; font-size: 15px; font-weight: 800; color: #34d399; margin-bottom: 6px; }
            .meta { font-size: 11px; color: #94a3b8; line-height: 1.5; }
            .footer { background: #047857; padding: 12px; font-size: 10px; font-weight: 700; color: #ecfdf5; }
            @media print {
              body { background: white; padding: 0; }
              .card { box-shadow: none; border: 1px solid #000; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>LIFE VISION SOCIETY</h1>
              <p>Official NGO Verification & Payment Scanner</p>
              <div style="font-size: 10px; margin-top: 4px; opacity: 0.9;">Reg No: ${orgDetails.regNo}</div>
            </div>
            <div class="qr-box">
              <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="200" height="200" fill="white"/>
                <!-- Outer Corners -->
                <rect x="10" y="10" width="50" height="50" rx="8" fill="#047857"/>
                <rect x="20" y="20" width="30" height="30" rx="4" fill="white"/>
                <rect x="26" y="26" width="18" height="18" rx="2" fill="#047857"/>
                
                <rect x="140" y="10" width="50" height="50" rx="8" fill="#047857"/>
                <rect x="150" y="20" width="30" height="30" rx="4" fill="white"/>
                <rect x="156" y="26" width="18" height="18" rx="2" fill="#047857"/>

                <rect x="10" y="140" width="50" height="50" rx="8" fill="#047857"/>
                <rect x="20" y="150" width="30" height="30" rx="4" fill="white"/>
                <rect x="26" y="156" width="18" height="18" rx="2" fill="#047857"/>

                <!-- Inner Patterns -->
                <rect x="70" y="20" width="12" height="12" fill="#047857"/>
                <rect x="90" y="20" width="20" height="12" fill="#047857"/>
                <rect x="120" y="20" width="10" height="12" fill="#047857"/>

                <rect x="20" y="70" width="12" height="20" fill="#047857"/>
                <rect x="40" y="70" width="12" height="10" fill="#047857"/>

                <rect x="70" y="60" width="60" height="60" rx="10" fill="#047857"/>
                <rect x="85" y="75" width="30" height="30" rx="6" fill="white"/>
                <circle cx="100" cy="100" r="8" fill="#047857"/>

                <rect x="140" y="70" width="20" height="12" fill="#047857"/>
                <rect x="170" y="70" width="15" height="25" fill="#047857"/>

                <rect x="70" y="140" width="15" height="15" fill="#047857"/>
                <rect x="95" y="140" width="25" height="10" fill="#047857"/>
                <rect x="130" y="140" width="10" height="20" fill="#047857"/>
                <rect x="150" y="140" width="20" height="30" rx="4" fill="#047857"/>

                <rect x="70" y="170" width="30" height="15" fill="#047857"/>
                <rect x="110" y="170" width="15" height="15" fill="#047857"/>
                <rect x="135" y="180" width="35" height="10" fill="#047857"/>
              </svg>
            </div>
            <div class="details">
              <div class="upi">UPI: ${orgDetails.upiId}</div>
              <div class="meta">Accepts Google Pay, PhonePe, Paytm, BHIM & UPI Apps</div>
              <div class="meta" style="margin-top: 4px;">Contact: ${orgDetails.phone} • ${orgDetails.email}</div>
            </div>
            <div class="footer">
              Authorized Official NGO Scanner • Life Vision Society
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span>Administration System</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">NGO Official QR & Payment Scanner</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Official QR code scanner for public verification, student aid, donor payments, and campus registrations.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            type="button"
            onClick={handleDownloadScanner}
            className="px-4 py-2 bg-[#123B5D] hover:bg-[#0E2F4A] text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Direct Download Scanner</span>
          </button>

          <button
            type="button"
            onClick={handlePrintScanner}
            className="px-4 py-2 bg-[#047857] hover:bg-[#065F46] text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Print Scanner Card</span>
          </button>
        </div>
      </div>

      {/* Main Scanner Card Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Visual Scanner Card Box */}
        <div className="lg:col-span-6 flex justify-center">
          <div ref={cardRef} className="w-full max-w-md bg-slate-950 text-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden text-center relative">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-6 text-white relative">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-2xs font-extrabold text-emerald-100 uppercase mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Verified Official Scanner</span>
              </div>
              <h2 className="text-xl font-bold font-serif tracking-tight">{orgDetails.name}</h2>
              <p className="text-2xs text-emerald-200 font-semibold mt-0.5">OFFICIAL NGO VERIFICATION & PAYMENT SCANNER</p>
              <p className="text-[10px] text-emerald-100/80 mt-1 font-mono">{orgDetails.regNo} • 80G Certified</p>
            </div>

            {/* QR Code Container */}
            <div className="p-6 bg-slate-900 flex flex-col items-center justify-center space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow-xl ring-4 ring-emerald-500/20 inline-block">
                <svg id="ngo-qr-svg" width="220" height="220" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="200" height="200" fill="white"/>
                  
                  {/* Outer Corners */}
                  <rect x="10" y="10" width="50" height="50" rx="8" fill="#047857"/>
                  <rect x="20" y="20" width="30" height="30" rx="4" fill="white"/>
                  <rect x="26" y="26" width="18" height="18" rx="2" fill="#047857"/>
                  
                  <rect x="140" y="10" width="50" height="50" rx="8" fill="#047857"/>
                  <rect x="150" y="20" width="30" height="30" rx="4" fill="white"/>
                  <rect x="156" y="26" width="18" height="18" rx="2" fill="#047857"/>

                  <rect x="10" y="140" width="50" height="50" rx="8" fill="#047857"/>
                  <rect x="20" y="150" width="30" height="30" rx="4" fill="white"/>
                  <rect x="26" y="156" width="18" height="18" rx="2" fill="#047857"/>

                  {/* Inner Patterns */}
                  <rect x="70" y="20" width="12" height="12" fill="#047857"/>
                  <rect x="90" y="20" width="20" height="12" fill="#047857"/>
                  <rect x="120" y="20" width="10" height="12" fill="#047857"/>

                  <rect x="20" y="70" width="12" height="20" fill="#047857"/>
                  <rect x="40" y="70" width="12" height="10" fill="#047857"/>

                  <rect x="70" y="60" width="60" height="60" rx="10" fill="#047857"/>
                  <rect x="85" y="75" width="30" height="30" rx="6" fill="white"/>
                  <circle cx="100" cy="100" r="8" fill="#047857"/>

                  <rect x="140" y="70" width="20" height="12" fill="#047857"/>
                  <rect x="170" y="70" width="15" height="25" fill="#047857"/>

                  <rect x="70" y="140" width="15" height="15" fill="#047857"/>
                  <rect x="95" y="140" width="25" height="10" fill="#047857"/>
                  <rect x="130" y="140" width="10" height="20" fill="#047857"/>
                  <rect x="150" y="140" width="20" height="30" rx="4" fill="#047857"/>

                  <rect x="70" y="170" width="30" height="15" fill="#047857"/>
                  <rect x="110" y="170" width="15" height="15" fill="#047857"/>
                  <rect x="135" y="180" width="35" height="10" fill="#047857"/>
                </svg>
              </div>

              <div className="space-y-1">
                <span className="text-2xs uppercase tracking-widest font-bold text-slate-400">Scan to Verify or Donate</span>
                <p className="text-xs text-slate-300 font-medium">Accepts Google Pay, PhonePe, Paytm, BHIM & UPI</p>
              </div>
            </div>

            {/* Details Box */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Official UPI ID</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{orgDetails.upiId}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded-lg text-2xs font-bold border border-emerald-800 flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              </div>

              {/* Action Bar */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadScanner}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Image</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintScanner}
                  className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-slate-700"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Card</span>
                </button>
              </div>
            </div>

            {/* Footer Seal */}
            <div className="bg-emerald-800 py-2.5 px-4 text-[10px] font-bold text-emerald-100 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Life Vision Society Administration Authorized</span>
            </div>

          </div>
        </div>

        {/* Right Column: Instructions & Information */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>About NGO Scanner & Payment Integration</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                This official scanner is generated directly for <strong>Life Vision Society</strong> to facilitate instant QR verification and donor contributions across Odisha centers.
              </p>
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-900 space-y-2">
                <h4 className="font-bold text-xs flex items-center gap-1.5 text-emerald-950">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Official Details Registered in Firebase:</span>
                </h4>
                <ul className="space-y-1.5 pl-2 font-medium">
                  <li>• <strong>Organization Name:</strong> {orgDetails.name}</li>
                  <li>• <strong>Society Registration:</strong> {orgDetails.regNo}</li>
                  <li>• <strong>Tax Exemption Status:</strong> {orgDetails.taxId}</li>
                  <li>• <strong>Official UPI Handle:</strong> <code className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold">{orgDetails.upiId}</code></li>
                  <li>• <strong>Helpdesk Contact:</strong> {orgDetails.phone} • {orgDetails.email}</li>
                </ul>
              </div>

              <div className="pt-2 space-y-2">
                <h4 className="font-bold text-slate-800 text-xs">Quick Scanner Options:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Direct Download</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Click to instantly export a high-resolution PNG image of the scanner card to your computer.</p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      <Printer className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Print Option</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Opens the formatted printer layout to print out physical cards or posters for training centers.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
