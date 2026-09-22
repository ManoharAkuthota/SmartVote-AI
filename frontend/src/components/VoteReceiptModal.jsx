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
      colors: ['#00f0ff', '#8a2be2', '#00ffa3', '#ffd600'],
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

    // Dark sleek theme for official certificate
    doc.setFillColor(7, 10, 19);
    doc.rect(0, 0, 210, 297, 'F');

    // Header border
    doc.setDrawColor(0, 240, 255);
    doc.setLineWidth(1);
    doc.rect(12, 12, 186, 273);

    // Inner subtle border
    doc.setDrawColor(138, 43, 226);
    doc.setLineWidth(0.3);
    doc.rect(15, 15, 180, 267);

    // Title
    doc.setTextColor(0, 240, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('SMARTVOTE AI', 105, 32, { align: 'center' });

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('CRYPTOGRAPHIC ZERO-KNOWLEDGE ELECTION LEDGER', 105, 39, { align: 'center' });

    doc.setDrawColor(30, 41, 59);
    doc.line(25, 45, 185, 45);

    // Receipt Badge
    doc.setTextColor(0, 255, 163);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('OFFICIAL VOTING RECEIPT & CERTIFICATE', 105, 56, { align: 'center' });

    // Details Grid
    doc.setFontSize(11);
    doc.setTextColor(226, 232, 240);

    const startY = 72;
    const lineSpacing = 11;

    doc.setFont('helvetica', 'bold');
    doc.text('Receipt ID:', 30, startY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 240, 255);
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
    doc.text(new Date(receipt.votedAt || Date.now()).toUTCString(), 75, startY + lineSpacing * 3.5);

    // Hash Seal Box
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(25, 125, 160, 32, 3, 3, 'F');
    doc.setDrawColor(0, 240, 255);
    doc.roundedRect(25, 125, 160, 32, 3, 3, 'D');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 240, 255);
    doc.text('SHA-256 DIGITAL SEAL HASH:', 30, 134);

    doc.setFont('courier', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(192, 132, 252);
    doc.text(receipt.receiptHash || '', 30, 142);

    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`SIG: ${receipt.digitalSignature || ''}`.substring(0, 70), 30, 150);

    // Verification Notice
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text('You may verify this ballot inclusion on the public ledger using the verification URL below:', 105, 175, { align: 'center' });

    doc.setTextColor(0, 240, 255);
    doc.setFontSize(9);
    doc.text(receipt.verificationUrl || 'https://smartvote.ai/verify', 105, 183, { align: 'center' });

    // Footer
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text('SmartVote AI Cryptographic Voting Protocol — Immutable Record Guaranteed', 105, 265, { align: 'center' });

    doc.save(`SmartVote_Receipt_${receipt.receiptId}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-900/95 border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/20">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border-2 border-emerald-400 flex items-center justify-center mb-3 shadow-[0_0_25px_#00ffa3]">
            <CheckCircle2 className="w-9 h-9 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-wide">Ballot Successfully Sealed!</h2>
          <p className="text-xs text-slate-400 mt-1">
            Your vote has been cryptographically signed and permanently committed to the election ledger.
          </p>
        </div>

        {/* Holographic Receipt Card */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <span className="text-slate-400">RECEIPT IDENTIFIER</span>
            <div className="flex items-center space-x-2">
              <span className="text-emerald-400 font-bold">{receipt.receiptId}</span>
              <button
                onClick={() => copyToClipboard(receipt.receiptId)}
                className="text-slate-400 hover:text-cyan-400"
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
              <span className="text-cyan-400 font-bold">{receipt.candidateName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Affiliation:</span>
              <span className="text-slate-300">{receipt.partyName} {receipt.partySymbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Timestamp:</span>
              <span className="text-slate-400">{new Date(receipt.votedAt || Date.now()).toLocaleString()}</span>
            </div>
          </div>

          {/* QR Code & Digital Hash */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-4">
            <div className="p-2 bg-white rounded-xl shrink-0 shadow-md">
              <QRCodeSVG value={receipt.verificationUrl || receipt.receiptId} size={74} level="M" />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">SHA-256 Digital Seal</div>
              <div className="text-[10px] font-mono text-cyan-300 break-all bg-slate-900 p-2 rounded-lg border border-cyan-500/20">
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
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-400 text-slate-950 font-bold text-xs shadow-neon-cyan hover:opacity-95 flex items-center justify-center space-x-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>{t('btn_download_pdf')}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
