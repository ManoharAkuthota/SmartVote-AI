import React, { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';
import { ShieldCheck, Download, CheckCircle2, Copy, ExternalLink, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function VoteReceiptModal({ receipt, onClose }) {
  const { t } = useLanguage();

  useEffect(() => {
    // Launch celebratory confetti
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#ffffff', '#3b82f6'],
    });
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const downloadPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Dark sleek official theme
    doc.setFillColor(10, 15, 29);
    doc.rect(0, 0, 210, 297, 'F');

    // Outer border
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(1);
    doc.rect(12, 12, 186, 273);

    // Inner subtle border
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.3);
    doc.rect(15, 15, 180, 267);

    // Header Title
    doc.setTextColor(245, 158, 11);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('ELECTION COMMISSION OF INDIA', 105, 30, { align: 'center' });

    doc.setTextColor(226, 232, 240);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('SMARTVOTE BHARAT • NATIONAL DIGITAL VOTING SYSTEM', 105, 37, { align: 'center' });

    doc.setDrawColor(51, 65, 85);
    doc.line(25, 43, 185, 43);

    // Certificate Badge
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('OFFICIAL DEMOCRATIC VOTING CERTIFICATE (ARTICLE 324)', 105, 54, { align: 'center' });

    // Details Grid
    doc.setFontSize(11);
    doc.setTextColor(226, 232, 240);

    const startY = 68;
    const lineSpacing = 11;

    doc.setFont('helvetica', 'bold');
    doc.text('Receipt ID:', 30, startY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(245, 158, 11);
    doc.text(receipt.receiptId || '', 75, startY);

    doc.setTextColor(226, 232, 240);
    doc.setFont('helvetica', 'bold');
    doc.text('Election:', 30, startY + lineSpacing);
    doc.setFont('helvetica', 'normal');
    doc.text(doc.splitTextToSize(receipt.electionTitle || '', 100), 75, startY + lineSpacing);

    doc.setFont('helvetica', 'bold');
    doc.text('Candidate Voted:', 30, startY + lineSpacing * 2.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${receipt.candidateName || ''} (${receipt.partyName || ''})`, 75, startY + lineSpacing * 2.5);

    doc.setFont('helvetica', 'bold');
    doc.text('Timestamp:', 30, startY + lineSpacing * 3.5);
    doc.setFont('helvetica', 'normal');
    const istTime = new Date(receipt.votedAt || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
    doc.text(istTime, 75, startY + lineSpacing * 3.5);

    // Hash Seal Box
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(25, 122, 160, 32, 3, 3, 'F');
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(25, 122, 160, 32, 3, 3, 'D');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(245, 158, 11);
    doc.text('SHA-256 DIGITAL SEAL HASH (CRYPTOGRAPHIC IMMUTABILITY):', 30, 131);

    doc.setFont('courier', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(245, 245, 245);
    doc.text(receipt.receiptHash || '', 30, 139);

    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`SIG: ${receipt.digitalSignature || ''}`.substring(0, 70), 30, 147);

    // Verification Notice
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(148, 163, 184);
    doc.text('This ballot is permanently sealed in the public election ledger under Article 324 secret ballot protection.', 105, 172, { align: 'center' });

    doc.setTextColor(245, 158, 11);
    doc.setFontSize(9);
    doc.text(`Ledger Verification URL: ${receipt.verificationUrl || 'https://smartvote.ai/verify'}`, 105, 180, { align: 'center' });

    // Footer
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text('Election Commission of India • National Digital Voting Standard — Article 324 Constitution of India', 105, 268, { align: 'center' });

    doc.save(`ECI_Voting_Certificate_${receipt.receiptId}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-900/95 border-2 border-amber-500/40 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border-2 border-emerald-400 flex items-center justify-center mb-3 shadow-[0_0_25px_#10b981]">
            <CheckCircle2 className="w-9 h-9 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-wide">Ballot Successfully Sealed!</h2>
          <p className="text-xs text-slate-400 mt-1">
            Your vote has been cryptographically signed and committed to the National Election Ledger.
          </p>
        </div>

        {/* Holographic Receipt Card */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <span className="text-slate-400">OFFICIAL RECEIPT ID</span>
            <div className="flex items-center space-x-2">
              <span className="text-amber-400 font-bold">{receipt.receiptId}</span>
              <button
                onClick={() => copyToClipboard(receipt.receiptId)}
                className="text-slate-400 hover:text-amber-400"
                title="Copy ID"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-2 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Election:</span>
              <span className="text-right font-sans font-medium text-white max-w-[240px] truncate">{receipt.electionTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Selection:</span>
              <span className="text-amber-400 font-bold">{receipt.candidateName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Party & Symbol:</span>
              <span className="text-slate-300">{receipt.partyName} {receipt.partySymbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Timestamp (IST):</span>
              <span className="text-slate-400">{new Date(receipt.votedAt || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</span>
            </div>
          </div>

          {/* QR Code & Digital Hash */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-4">
            <div className="p-2 bg-white rounded-xl shrink-0 shadow-md">
              <QRCodeSVG value={receipt.verificationUrl || receipt.receiptId} size={74} level="M" />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">SHA-256 Digital Seal</div>
              <div className="text-[10px] font-mono text-amber-300 break-all bg-slate-900 p-2 rounded-lg border border-amber-500/20">
                {receipt.receiptHash}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={downloadPdf}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:opacity-95 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{t('btn_download_pdf')}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition cursor-pointer"
          >
            {t('btn_return_dashboard')}
          </button>
        </div>
      </div>
    </div>
  );
}
