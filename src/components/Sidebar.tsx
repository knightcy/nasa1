import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { courseData } from '../data/courseData';
import { cn } from '@/lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface SidebarProps {
  currentLessonId: string;
  onSelectLesson: (id: string) => void;
}

export default function Sidebar({ currentLessonId, onSelectLesson }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  
  const modules = courseData.reduce((acc, lesson) => {
    if (!acc[lesson.module]) {
      acc[lesson.module] = {
        title: lesson.moduleTitle,
        lessons: []
      };
    }
    acc[lesson.module].lessons.push(lesson);
    return acc;
  }, {} as Record<string, { title: string; lessons: typeof courseData }>);

  return (
    <div className="w-96 h-screen border-r border-[var(--nasa-bg-hover)] bg-[var(--nasa-bg-secondary)] flex flex-col">
      <div className="p-6 border-b border-[var(--nasa-bg-hover)] bg-[var(--nasa-bg)]">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black tracking-tighter text-[var(--nasa-text)] flex items-center gap-2">
            <span className="text-[var(--nasa-accent)]">NASA</span> 课程
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-10 w-10 text-[var(--nasa-text-secondary)] hover:text-[var(--nasa-text)] hover:bg-[var(--nasa-bg-hover)]"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
        <p className="text-base text-[var(--nasa-text-secondary)] mt-2 tracking-wider font-semibold">基于前沿任务的青少年航天课程</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {Object.entries(modules).map(([moduleName, moduleData]: [string, any]) => (
            <div key={moduleName} className="space-y-3">
              <div className="px-2">
                <h3 className="text-sm font-bold text-[var(--nasa-text-secondary)] uppercase tracking-widest">{moduleName}</h3>
                <p className="text-lg text-[var(--nasa-text)] mt-1 font-medium" title={moduleData.title}>
                  {moduleData.title}
                </p>
              </div>
              <div className="space-y-2">
                {moduleData.lessons.map(lesson => (
                  <Button
                    key={lesson.id}
                    variant={currentLessonId === lesson.id ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start text-left h-auto py-4 px-4 relative transition-all duration-200 rounded-xl",
                      currentLessonId === lesson.id 
                        ? "bg-[var(--nasa-bg-hover)] text-[var(--nasa-text)] font-medium hover:bg-[var(--nasa-bg-hover)]" 
                        : "font-normal text-[var(--nasa-text-secondary)] hover:bg-[var(--nasa-bg-tertiary)] hover:text-[var(--nasa-text)]"
                    )}
                    onClick={() => onSelectLesson(lesson.id)}
                  >
                    <div className="flex flex-col items-start gap-2 w-full pl-3">
                      <span className="text-lg leading-snug break-words whitespace-normal w-full font-bold">
                        {lesson.title.split('：')[0]}
                      </span>
                      <span className={cn(
                        "text-base leading-snug break-words whitespace-normal w-full font-normal",
                        currentLessonId === lesson.id ? "text-[var(--nasa-text)]" : "text-[var(--nasa-text-secondary)]"
                      )}>
                        {lesson.title.split('：')[1]}
                      </span>
                    </div>
                    {currentLessonId === lesson.id && (
                      <div className="absolute left-0 top-2 bottom-2 w-2 bg-[var(--nasa-accent)] rounded-r-full" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
