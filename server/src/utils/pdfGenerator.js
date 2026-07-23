const PDFDocument = require('pdfkit');

/**
 * Generate a PDF report buffer.
 * @param {object} stats - Dashboard statistics object
 * @returns {Promise<Buffer>} PDF buffer
 */
const generateReportPDF = (stats) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // ─── Header ─────────────────────────────────────────────────────────────
    doc
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('Insurance Management Platform', { align: 'center' });

    doc
      .fontSize(14)
      .font('Helvetica')
      .text('Business Report', { align: 'center' });

    doc
      .fontSize(10)
      .text(`Generated on: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}`, { align: 'center' });

    doc.moveDown(2);

    // ─── Summary Statistics ──────────────────────────────────────────────────
    doc.fontSize(14).font('Helvetica-Bold').text('Summary Statistics');
    doc.moveDown(0.5);

    const rows = [
      ['Active Policies',    stats.activePolicies    ?? 0],
      ['Expired Policies',   stats.expiredPolicies   ?? 0],
      ['Pending Claims',     stats.pendingClaims     ?? 0],
      ['Monthly Revenue',    `₹${(stats.monthlyRevenue ?? 0).toLocaleString('en-IN')}`],
      ['Total Customers',    stats.totalCustomers    ?? 0],
    ];

    rows.forEach(([label, value]) => {
      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`${label}:`, { continued: true, width: 200 })
        .font('Helvetica-Bold')
        .text(String(value));
    });

    doc.moveDown(2);

    // ─── Footer ──────────────────────────────────────────────────────────────
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('grey')
      .text('This is a system-generated report. For queries, contact the administrator.', {
        align: 'center',
      });

    doc.end();
  });
};

module.exports = { generateReportPDF };
