import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { courseData } from '../data/courseData';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentLessonId: string;
  onSelectLesson: (id: string) => void;
}

export default function Sidebar({ currentLessonId, onSelectLesson }: SidebarProps) {
  // Group lessons by module
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
    <div className="w-80 h-screen border-r border-slate-800 bg-[#0b101a] flex flex-col">
      <div className="p-6 border-b border-slate-800 bg-[#06090f]">
        <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-2">
          <span className="text-[#fc3d21]">NASA</span> STEM
        </h1>
        <p className="text-xs text-slate-400 mt-2 uppercase tracking-wider font-semibold">基于前沿任务的青少年航天课程</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {Object.entries(modules).map(([moduleName, moduleData]: [string, any]) => (
            <div key={moduleName} className="space-y-3">
              <div className="px-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{moduleName}</h3>
                <p className="text-sm text-slate-200 mt-1" title={moduleData.title}>
                  {moduleData.title}
                </p>
              </div>
              <div className="space-y-1">
                {moduleData.lessons.map(lesson => (
                  <Button
                    key={lesson.id}
                    variant={currentLessonId === lesson.id ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start text-left h-auto py-3 px-3 relative transition-all duration-200",
                      currentLessonId === lesson.id 
                        ? "bg-[#1a2333] text-white font-medium hover:bg-[#1a2333]" 
                        : "font-normal text-slate-400 hover:bg-[#131b27] hover:text-slate-200"
                    )}
                    onClick={() => onSelectLesson(lesson.id)}
                  >
                    <div className="flex flex-col items-start gap-1 w-full pl-2">
                      <span className="text-sm leading-snug break-words whitespace-normal w-full font-semibold">
                        {lesson.title.split('：')[0]}
                      </span>
                      <span className={cn(
                        "text-xs leading-snug break-words whitespace-normal w-full",
                        currentLessonId === lesson.id ? "text-slate-300" : "text-slate-500"
                      )}>
                        {lesson.title.split('：')[1]}
                      </span>
                    </div>
                    {currentLessonId === lesson.id && (
                      <div className="absolute left-0 top-1 bottom-1 w-1 bg-[#fc3d21] rounded-r-full" />
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
