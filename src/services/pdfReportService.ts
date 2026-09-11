import { jsPDF } from 'jspdf';
import type { PatientProfile, GameResult, PatientReminder, AdaptiveEvaluation } from '../types';

interface PDFReportInput {
  patient: PatientProfile;
  gameResults: GameResult[];
  reminders: PatientReminder[];
  evaluations: AdaptiveEvaluation[];
}

export const pdfReportService = {
  downloadPdfReport(input: PDFReportInput): void {
    this.generatePatientReport(input);
  },

  generatePatientReport(input: PDFReportInput): void {
    const { patient, gameResults, reminders, evaluations } = input;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header Title
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('SMRITISETU (स्मृतिसेतु) - Patient Cognitive Progress Report', 14, 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text('SIH 2026 Problem Statement 26003 | MDoNER HealthTech Assist', 14, 22);

    y = 40;

    // Patient Information Block
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, pageWidth - 28, 45, 3, 3, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Patient Overview & Demographics', 20, y + 10);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);

    doc.text(`Patient Name: ${patient.name}`, 20, y + 20);
    doc.text(`Patient ID: ${patient.patientId}`, 20, y + 27);
    doc.text(`Age / Gender: ${patient.age} Yrs / ${patient.gender || 'N/A'}`, 20, y + 34);

    doc.text(`State (NER): ${patient.state}`, 110, y + 20);
    doc.text(`Preferred Language: ${patient.preferredLanguage.toUpperCase()}`, 110, y + 27);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 110, y + 34);

    y += 55;

    // Cognitive Domain Scores Summary
    const getDomainScore = (category: string) => {
      const filtered = gameResults.filter(r => r.gameCategory === category);
      if (filtered.length === 0) return '80% (Baseline)';
      const avg = Math.round(filtered.reduce((acc, curr) => acc + curr.score, 0) / filtered.length);
      return `${avg}%`;
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text('1. Cognitive Domain Performance', 14, y);

    y += 8;

    const domains = [
      { title: 'Memory Recall Domain', score: getDomainScore('memory') },
      { title: 'Attention & Spotting Domain', score: getDomainScore('attention') },
      { title: 'Pattern Recognition Domain', score: getDomainScore('pattern') },
      { title: 'Daily Routine Recall Domain', score: getDomainScore('routine') }
    ];

    let x = 14;
    domains.forEach((d) => {
      doc.setFillColor(236, 253, 245); // emerald-50
      doc.setDrawColor(167, 243, 208);
      doc.roundedRect(x, y, 42, 22, 2, 2, 'FD');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(6, 78, 59);
      doc.text(d.title, x + 3, y + 7, { maxWidth: 36 });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 150, 105);
      doc.text(d.score, x + 3, y + 17);

      x += 45;
    });

    y += 32;

    // Reminder Adherence Summary
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text('2. Daily Reminder Adherence', 14, y);

    y += 8;

    const completedCount = reminders.filter(r => r.completed).length;
    const totalCount = reminders.length;
    const rate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, y, pageWidth - 28, 24, 2, 2, 'FD');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`Completed Reminders: ${completedCount} / ${totalCount} (${rate}% Adherence Rate)`, 20, y + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('Monitored daily habits: Medicine intake, Hydration, Daily activity, Medical appointments.', 20, y + 17);

    y += 34;

    // Adaptive AI Logs Trail
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text('3. AI Adaptive Difficulty Audit Logs', 14, y);

    y += 8;

    if (evaluations.length === 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 116, 139);
      doc.text('No AI difficulty adaptations logged yet.', 14, y);
      y += 10;
    } else {
      evaluations.slice(0, 3).forEach(ev => {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(14, y, pageWidth - 28, 16, 2, 2, 'FD');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`${ev.gameCategory.toUpperCase()} • Level ${ev.previousLevel} -> Level ${ev.newLevel}`, 18, y + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text(`AI Reason: ${ev.reason}`, 18, y + 12, { maxWidth: pageWidth - 40 });

        y += 20;
      });
    }

    y += 10;

    // Non-Diagnostic Clinical Disclaimer
    doc.setFillColor(254, 242, 242); // red-50
    doc.setDrawColor(252, 165, 165);
    doc.roundedRect(14, y, pageWidth - 28, 22, 2, 2, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(153, 27, 27);
    doc.text('HEALTHCARE MONITORING DISCLAIMER', 18, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(185, 28, 28);
    doc.text(
      'SmritiSetu (स्मृतिसेतु) is a digital cognitive engagement, routine assistance, and monitoring platform for dementia care. It is intended for cognitive engagement and caregiver monitoring, and is NOT a standalone medical diagnostic tool.',
      18,
      y + 12,
      { maxWidth: pageWidth - 40 }
    );

    // Save PDF file
    doc.save(`SmritiSetu_Report_${patient.patientId}.pdf`);
  }
};
