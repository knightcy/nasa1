/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import LessonView from './components/LessonView';
import { courseData } from './data/courseData';
import { ThemeProvider } from './contexts/ThemeContext';

function AppContent() {
  const [currentLessonId, setCurrentLessonId] = useState(courseData[0].id);

  const currentLesson = courseData.find(l => l.id === currentLessonId) || courseData[0];

  return (
    <div className="light flex h-screen bg-[var(--nasa-bg)] text-[var(--nasa-text)] font-sans">
      <Sidebar 
        currentLessonId={currentLessonId} 
        onSelectLesson={setCurrentLessonId} 
      />
      <LessonView 
        key={currentLessonId}
        lesson={currentLesson} 
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
