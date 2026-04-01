/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import LessonView from './components/LessonView';
import { courseData } from './data/courseData';

export default function App() {
  const [currentLessonId, setCurrentLessonId] = useState(courseData[0].id);

  const currentLesson = courseData.find(l => l.id === currentLessonId) || courseData[0];

  return (
    <div className="dark flex h-screen bg-[#040b14] text-slate-200 font-sans">
      <Sidebar 
        currentLessonId={currentLessonId} 
        onSelectLesson={setCurrentLessonId} 
      />
      <LessonView 
        key={currentLessonId} // Force re-render on lesson change
        lesson={currentLesson} 
      />
    </div>
  );
}
