import { useEffect } from 'react';

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
}

interface PrintableSchedaProps {
  clientInfo: ClientInfo;
  workouts: WorkoutExercise[][];
  duration: number;
  onClose: () => void;
}

export default function PrintableScheda({ clientInfo, workouts, duration, onClose }: PrintableSchedaProps) {

  useEffect(() => {
    // Trigger print dialog after a short delay to ensure rendering is complete
    const timer = setTimeout(() => {
      window.print();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Helper to get exercise letter in group (A, B, C, etc.)
  const getExerciseLetter = (exercise: WorkoutExercise): string => {
    if (exercise.isGroupHead) return "A";
    if (exercise.isGroupChild && exercise.childIndex !== undefined) {
      return String.fromCharCode(66 + exercise.childIndex);
    }
    return "";
  };

  return (
    <>
      <style>
        {`
          @media print {
            @page {
              size: landscape;
              margin: 8mm;
            }

            body {
              margin: 0;
              padding: 0;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }

            .print-container {
              width: 100%;
              font-family: Arial, sans-serif;
              font-size: 10px;
            }

            .no-print {
              display: none !important;
            }

            .workout-page {
              page-break-after: always;
              margin-bottom: 20px;
            }

            .workout-page:last-child {
              page-break-after: auto;
            }

            .workout-header {
              background-color: #FFD966;
              padding: 6px 10px;
              font-weight: bold;
              font-size: 14px;
              margin-bottom: 2px;
              border: 1px solid #000;
            }

            .client-header {
              background-color: #FFD966;
              padding: 5px 10px;
              font-size: 11px;
              margin-bottom: 8px;
              border: 1px solid #000;
              display: flex;
              justify-content: space-between;
            }

            .schedule-table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
            }

            .schedule-table th,
            .schedule-table td {
              border: 1px solid #000;
              padding: 4px 6px;
              vertical-align: top;
              font-size: 9px;
              overflow: hidden;
              color: #000;
            }

            .schedule-table thead th {
              background-color: #000;
              color: #FFF;
              font-weight: bold;
              text-align: center;
              font-size: 10px;
              padding: 5px 3px;
            }

            .exercise-name-cell {
              width: 12%;
              font-weight: bold;
              font-size: 9px;
              color: #000;
            }

            .technique-cell {
              width: 10%;
              font-size: 8.5px;
              color: #000;
            }

            .set-col {
              width: 2%;
              text-align: center;
              background-color: #F5F5F5;
            }

            .week-group {
              background-color: #FFF;
            }

            .week-header {
              text-align: center;
              font-weight: bold;
              font-size: 9px;
            }

            .week-subheader {
              background-color: #E0E0E0;
              text-align: center;
              font-size: 8px;
              font-weight: bold;
              padding: 3px 2px;
            }

            .week-cell {
              text-align: center;
              font-size: 8.5px;
              width: 3.5%;
              color: #000;
            }

            .rest-cell {
              width: 4%;
              text-align: center;
              font-size: 8.5px;
              color: #000;
            }

            .note-cell {
              width: 15%;
              font-size: 8px;
              line-height: 1.4;
              color: #000;
            }

            .grouped-exercise {
              background-color: #FFFACD;
            }

            .group-letter {
              color: #D9534F;
              font-weight: bold;
              font-size: 9px;
            }
          }

          @media screen {
            .print-container {
              max-width: 100%;
              padding: 20px;
              background: white;
              overflow-x: auto;
            }

            .workout-page {
              margin-bottom: 40px;
            }

            .workout-header {
              background-color: #FFD966;
              padding: 8px 12px;
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 4px;
              border: 1px solid #000;
            }

            .client-header {
              background-color: #FFD966;
              padding: 6px 12px;
              font-size: 12px;
              margin-bottom: 12px;
              border: 1px solid #000;
              display: flex;
              justify-content: space-between;
            }

            .schedule-table {
              width: 100%;
              border-collapse: collapse;
            }

            .schedule-table th,
            .schedule-table td {
              border: 1px solid #000;
              padding: 6px 8px;
              vertical-align: top;
              font-size: 11px;
            }

            .schedule-table thead th {
              background-color: #000;
              color: #FFF;
              font-weight: bold;
              text-align: center;
              font-size: 12px;
            }

            .close-button {
              position: fixed;
              top: 20px;
              right: 20px;
              padding: 12px 24px;
              background-color: #333;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
              z-index: 1000;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            }

            .close-button:hover {
              background-color: #555;
            }
          }
        `}
      </style>

      <button className="close-button no-print" onClick={onClose}>
        Chiudi Anteprima
      </button>

      <div className="print-container">
        {workouts.map((workout, workoutIndex) => (
          <div key={workoutIndex} className="workout-page">
            {/* Client Header - only on first page */}
            {workoutIndex === 0 && (
              <div className="client-header">
                <span>
                  <strong>COGNOME:</strong> {clientInfo.lastname?.toUpperCase() || '-'} |
                  <strong> NOME:</strong> {clientInfo.firstname?.toUpperCase() || '-'}
                </span>
                <span>
                  <strong>DATA INIZIO:</strong> {clientInfo.startDate || '-'} |
                  <strong> DATA FINE:</strong> {clientInfo.endDate || '-'}
                </span>
              </div>
            )}

            {/* Workout Title */}
            <div className="workout-header">
              WORKOUT - {String.fromCharCode(65 + workoutIndex)}
            </div>

            {/* Main Table */}
            <table className="schedule-table">
              <thead>
                <tr>
                  <th rowSpan={2} className="exercise-name-cell">ESERCIZIO</th>
                  <th rowSpan={2} className="technique-cell">TECNICA ESECUTIVA</th>
                  {Array.from({ length: duration }, (_, weekIdx) => (
                    <th key={weekIdx} colSpan={3} className="week-header">
                      WEEK {weekIdx + 1}
                    </th>
                  ))}
                  <th rowSpan={2} className="rest-cell">REST</th>
                  <th rowSpan={2} className="note-cell">NOTE</th>
                </tr>
                <tr>
                  {Array.from({ length: duration }, (_, weekIdx) => (
                    <>
                      <th key={`set-${weekIdx}`} className="week-subheader">SET</th>
                      <th key={`reps-${weekIdx}`} className="week-subheader">REPS</th>
                      <th key={`info-${weekIdx}`} className="week-subheader">INFO</th>
                    </>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workout.map((exercise, exerciseIndex) => {
                  const letter = getExerciseLetter(exercise);
                  const isGrouped = exercise.isGroupHead || exercise.isGroupChild;

                  return (
                    <tr key={exerciseIndex} className={isGrouped ? 'grouped-exercise' : ''}>
                      {/* Exercise Name */}
                      <td className="exercise-name-cell">
                        {exerciseIndex + 1}. {exercise.exercise || '-'}
                        {letter && <span className="group-letter"> ({letter})</span>}
                        {exercise.muscle && (
                          <div style={{ fontSize: '7.5px', color: '#666', marginTop: '2px' }}>
                            {exercise.muscle}
                          </div>
                        )}
                        {exercise.stimolo && (
                          <div style={{ fontSize: '7.5px', color: '#666', fontStyle: 'italic' }}>
                            {exercise.stimolo}
                          </div>
                        )}
                      </td>

                      {/* Technique */}
                      <td className="technique-cell">
                        {exercise.technicalNote || '-'}
                      </td>

                      {/* Week columns */}
                      {Array.from({ length: duration }, (_, weekIdx) => {
                        const week = exercise.weeks[weekIdx] || { set: '', reps: '', info: '' };
                        return (
                          <>
                            <td key={`set-${weekIdx}`} className="week-cell">
                              {week.set || '-'}
                            </td>
                            <td key={`reps-${weekIdx}`} className="week-cell">
                              {week.reps || '-'}
                            </td>
                            <td key={`info-${weekIdx}`} className="week-cell">
                              {week.info || '-'}
                            </td>
                          </>
                        );
                      })}

                      {/* Rest */}
                      <td className="rest-cell">
                        {exercise.rest || '-'}
                      </td>

                      {/* Notes */}
                      <td className="note-cell">
                        {exercise.note || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </>
  );
}
