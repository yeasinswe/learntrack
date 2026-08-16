const PDFDocument = require('pdfkit');

function generateCertificatePdf(res, { studentName, courseTitle, date }) {
  const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 50 });
  doc.pipe(res);

  const blue = '#0056D2';
  const gold = '#F5B400';

  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#FFFFFF');
  doc.lineWidth(4).strokeColor(blue).rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
  doc.lineWidth(1).strokeColor(gold).rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke();

  doc.fillColor(blue).fontSize(34).font('Helvetica-Bold')
    .text('LearnTrack', 0, 80, { align: 'center' });

  doc.fillColor('#333333').fontSize(16).font('Helvetica')
    .text('Certificate of Completion', 0, 130, { align: 'center' });

  doc.moveDown(2);
  doc.fillColor('#111111').fontSize(14).text('This certifies that', 0, 175, { align: 'center' });

  doc.fillColor(blue).fontSize(28).font('Helvetica-Bold')
    .text(studentName, 0, 200, { align: 'center' });

  doc.fillColor('#111111').fontSize(14).font('Helvetica')
    .text('has successfully completed the course', 0, 245, { align: 'center' });

  doc.fillColor('#111111').fontSize(20).font('Helvetica-Bold')
    .text(courseTitle, 0, 270, { align: 'center' });

  doc.fontSize(11).font('Helvetica').fillColor('#555555')
    .text(`Issued on ${new Date(date).toLocaleDateString()}`, 0, 330, { align: 'center' });

  doc.end();
}

module.exports = { generateCertificatePdf };
