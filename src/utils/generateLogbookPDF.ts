import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface WorkoutExercise {
  type: string;
  progression: string;
  muscle: string;
  exercise: string;
  stimolo?: string;
  technicalNote?: string;
  technique: string;
  weeks: Array<{ set: string; reps: string; info: string }>;
  rest: string;
  note: string;
  groupType?: string;
  isGroupHead?: boolean;
  isGroupChild?: boolean;
  groupId?: string;
  childIndex?: number;
}

interface ClientInfo {
  lastname: string;
  firstname: string;
  startDate: string;
  endDate: string;
  block: string;
  notes?: string;
}

export function generateLogbookPDF(
  clientInfo: ClientInfo,
  workouts: WorkoutExercise[][],
  duration: number
) {
  void duration;

  const doc = new jsPDF('l', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const tableMargin = margin + 2;

  const getExerciseLetter = (exercise: WorkoutExercise): string => {
    if (exercise.isGroupHead) return 'A';
    if (exercise.isGroupChild && exercise.childIndex !== undefined) {
      return String.fromCharCode(66 + exercise.childIndex);
    }
    return '';
  };

  const formatDateToItalian = (dateStr: string): string => {
    if (!dateStr || dateStr === '-') return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const sanitizeText = (value?: string): string => {
    if (!value) return '';
    return String(value)
      .replace(/<[^>]*>/g, ' ')
      .replace(/&[#a-z0-9]+;/gi, ' ')
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  interface LayoutConfig {
    workoutTitleFont: number;
    exerciseTitleFont: number;
    tableHeaderFont: number;
    tableFont: number;
    tableCellPadding: number;
    minCellHeight: number;
    noteFont: number;
  }

  const layoutOptions: LayoutConfig[] = [
    {
      workoutTitleFont: 14,
      exerciseTitleFont: 12,
      tableHeaderFont: 7,
      tableFont: 7,
      tableCellPadding: 1.6,
      minCellHeight: 8,
      noteFont: 7,
    },
    {
      workoutTitleFont: 13,
      exerciseTitleFont: 11,
      tableHeaderFont: 6.5,
      tableFont: 6.5,
      tableCellPadding: 1.2,
      minCellHeight: 7,
      noteFont: 6.5,
    },
    {
      workoutTitleFont: 12,
      exerciseTitleFont: 10,
      tableHeaderFont: 6,
      tableFont: 6,
      tableCellPadding: 1,
      minCellHeight: 6.5,
      noteFont: 6,
    },
    {
      workoutTitleFont: 11,
      exerciseTitleFont: 9,
      tableHeaderFont: 5.5,
      tableFont: 5.5,
      tableCellPadding: 0.8,
      minCellHeight: 6,
      noteFont: 5.5,
    },
  ];

  const clearPage = (pageNumber: number) => {
    doc.setPage(pageNumber);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setDrawColor(0, 0, 0);
    doc.setTextColor(0, 0, 0);
  };

  const calculateMaxSets = (exercise: WorkoutExercise): number => {
    let maxSets = 0;
    exercise.weeks.forEach((week) => {
      const match = sanitizeText(week.set).match(/\d+/g);
      if (match) {
        const weekMax = Math.max(...match.map((value) => parseInt(value, 10)));
        maxSets = Math.max(maxSets, weekMax);
      }
    });
    if (maxSets === 0) {
      return 6;
    }
    return Math.min(maxSets, 12);
  };

  const drawExercisePage = (
    exercise: WorkoutExercise,
    workoutLetter: string,
    exerciseIndex: number,
    layout: LayoutConfig,
    includeMainHeader: boolean
  ): number => {
    let yPos = margin;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);

    if (includeMainHeader) {
      doc.setFontSize(16);
      const nomeCompleto = sanitizeText(`${clientInfo.firstname} ${clientInfo.lastname}`.toUpperCase());
      const dataInizio = formatDateToItalian(clientInfo.startDate || '-');
      const dataFine = formatDateToItalian(clientInfo.endDate || '-');
      const titolo = `LOGBOOK DI: ${nomeCompleto} - DAL ${dataInizio} AL ${dataFine}`;
      doc.text(titolo, pageWidth / 2, yPos, { align: 'center' });
      yPos += 12;
    }

    doc.setFillColor(255, 217, 102);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 9, 'F');
    doc.setFontSize(layout.workoutTitleFont);
    doc.setFont('helvetica', 'bold');
    doc.text(`WORKOUT ${workoutLetter}`, pageWidth / 2, yPos + 6.5, { align: 'center' });
    yPos += 12;

    const exerciseLetter = getExerciseLetter(exercise);
    const exerciseLabel = `${exerciseIndex + 1}. ${exercise.exercise || `Esercizio ${exerciseIndex + 1}`}${exerciseLetter ? ` (${exerciseLetter})` : ''}`;
    doc.setFontSize(layout.exerciseTitleFont);
    doc.text(sanitizeText(exerciseLabel), margin + 2, yPos);
    yPos += layout.exerciseTitleFont * 0.6 + 4;

    yPos += 2;

    const maxSets = calculateMaxSets(exercise);

    const headerRow1: any[] = [
      { content: 'WEEK', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: 'SET', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: 'REPS', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: 'INFO', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
    ];

    const headerRow2: any[] = [];
    const columnStyles: Record<number, any> = {
      0: { halign: 'center' },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'left', overflow: 'linebreak' },
    };

    let colIndex = 4;
    for (let i = 1; i <= maxSets; i++) {
      headerRow1.push({
        content: `SET ${i}`,
        colSpan: 3,
        styles: {
          halign: 'center',
          valign: 'middle',
          fillColor: [255, 165, 0],
          textColor: [255, 255, 255],
        },
      });
      headerRow2.push({ content: 'REPS', styles: { halign: 'center' } });
      headerRow2.push({ content: 'KG', styles: { halign: 'center' } });
      headerRow2.push({ content: 'FEEDBACK', styles: { halign: 'center' } });
      columnStyles[colIndex] = { halign: 'center' };
      columnStyles[colIndex + 1] = { halign: 'center' };
      columnStyles[colIndex + 2] = { halign: 'left', overflow: 'linebreak' };
      colIndex += 3;
    }

    headerRow1.push({ content: 'REST', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } });
    columnStyles[colIndex] = { halign: 'center' };

    const tableData: any[] = [];
    exercise.weeks.forEach((week, weekIdx) => {
      const row: any[] = [
        `W${weekIdx + 1}`,
        sanitizeText(week.set) || '-',
        sanitizeText(week.reps) || '-',
        sanitizeText(week.info) || '-',
      ];
      for (let i = 0; i < maxSets; i++) {
        row.push('');
        row.push('');
        row.push('');
      }
      row.push(sanitizeText(exercise.rest) || '-');
      tableData.push(row);
    });

    autoTable(doc, {
      startY: yPos,
      head: [headerRow1, headerRow2],
      body: tableData,
      margin: { left: tableMargin, right: tableMargin },
      theme: 'grid',
      tableWidth: pageWidth - 2 * tableMargin,
      pageBreak: 'avoid',
      styles: {
        font: 'helvetica',
        lineWidth: 0.2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontSize: layout.tableHeaderFont,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        cellPadding: layout.tableCellPadding,
      },
      bodyStyles: {
        fontSize: layout.tableFont,
        cellPadding: layout.tableCellPadding,
        minCellHeight: layout.minCellHeight,
        valign: 'middle',
        halign: 'center',
      },
      columnStyles,
    });

    const lastTable = (doc as any).lastAutoTable;
    let yAfterTable = lastTable ? lastTable.finalY + 3 : yPos + 3;

    const technicalNote = sanitizeText(exercise.technicalNote);
    const logbookNote = sanitizeText(exercise.note);
    const noteBlocks: string[] = [];
    if (technicalNote) {
      noteBlocks.push(`Note tecniche: ${technicalNote}`);
    }
    if (logbookNote && logbookNote !== '-') {
      noteBlocks.push(`Note: ${logbookNote}`);
    }

    if (noteBlocks.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(layout.noteFont);
      const noteWidth = pageWidth - 2 * tableMargin;
      const noteLines = noteBlocks
        .map((block) => doc.splitTextToSize(block, noteWidth))
        .flat();
      doc.text(noteLines, tableMargin, yAfterTable);
      const noteLineHeight = layout.noteFont * 0.45 + 1;
      yAfterTable += noteLines.length * noteLineHeight + 2;
    }

    return yAfterTable + 4;
  };

  let isFirstExercise = true;

  workouts.forEach((workout, workoutIndex) => {
    const workoutLetter = String.fromCharCode(65 + workoutIndex);
    workout.forEach((exercise, exerciseIndex) => {
      const includeMainHeader = isFirstExercise;
      const pageNumber = isFirstExercise
        ? 1
        : (() => {
            doc.addPage();
            return doc.getNumberOfPages();
          })();

      let fitted = false;
      let finalY = 0;
      let attemptIndex = 0;

      while (attemptIndex < layoutOptions.length && !fitted) {
        const layout = layoutOptions[attemptIndex];
        clearPage(pageNumber);
        doc.setPage(pageNumber);
        finalY = drawExercisePage(exercise, workoutLetter, exerciseIndex, layout, includeMainHeader);
        const extraPages = doc.getNumberOfPages() - pageNumber;
        if (extraPages > 0) {
          for (let p = doc.getNumberOfPages(); p > pageNumber; p--) {
            doc.deletePage(p);
          }
          doc.setPage(pageNumber);
        }
        fitted = extraPages === 0 && finalY <= pageHeight - margin;
        if (!fitted) {
          attemptIndex += 1;
        }
      }

      if (!fitted) {
        const fallbackLayout: LayoutConfig = {
          workoutTitleFont: 10.5,
          exerciseTitleFont: 9,
          tableHeaderFont: 5.2,
          tableFont: 5.2,
          tableCellPadding: 0.6,
          minCellHeight: 5.5,
          noteFont: 5.2,
        };
        clearPage(pageNumber);
        doc.setPage(pageNumber);
        finalY = drawExercisePage(exercise, workoutLetter, exerciseIndex, fallbackLayout, includeMainHeader);
        const extraPages = doc.getNumberOfPages() - pageNumber;
        if (extraPages > 0) {
          for (let p = doc.getNumberOfPages(); p > pageNumber; p--) {
            doc.deletePage(p);
          }
          doc.setPage(pageNumber);
        }
      }

      isFirstExercise = false;
    });
  });

  const filename = `Logbook_${clientInfo.lastname}_${clientInfo.firstname}_${clientInfo.block || 'Scheda'}.pdf`
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_.-]/g, '');
  doc.save(filename);
}
