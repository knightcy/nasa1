import { useState } from 'react';
import { Lesson } from '../data/courseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Import interactives
import NewtonInteractive from './interactives/NewtonInteractive';
import CgCpInteractive from './interactives/CgCpInteractive';
import FreeFallInteractive from './interactives/FreeFallInteractive';
import BoneDensityInteractive from './interactives/BoneDensityInteractive';
import HohmannInteractive from './interactives/HohmannInteractive';
import RoverInteractive from './interactives/RoverInteractive';
import FreeReturnInteractive from './interactives/FreeReturnInteractive';
import SpacesuitInteractive from './interactives/SpacesuitInteractive';
import RedshiftInteractive from './interactives/RedshiftInteractive';
import IcebergInteractive from './interactives/IcebergInteractive';

interface LessonViewProps {
  lesson: Lesson;
  key?: string | number;
}

export default function LessonView({ lesson }: LessonViewProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({});

  const renderInteractive = () => {
    switch (lesson.interactiveType) {
      case 'newton': return <NewtonInteractive />;
      case 'cgcp': return <CgCpInteractive />;
      case 'freefall': return <FreeFallInteractive />;
      case 'bonedensity': return <BoneDensityInteractive />;
      case 'hohmann': return <HohmannInteractive />;
      case 'rover': return <RoverInteractive />;
      case 'freereturn': return <FreeReturnInteractive />;
      case 'spacesuit': return <SpacesuitInteractive />;
      case 'redshift': return <RedshiftInteractive />;
      case 'iceberg': return <IcebergInteractive />;
      default: return null;
    }
  };

  const handleAnswer = (qIndex: number, oIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: oIndex }));
    setShowExplanations(prev => ({ ...prev, [qIndex]: true }));
  };

  // Simple markdown renderer for content
  const renderContent = (content: string) => {
    return content.split('\n\n').map((paragraph, i) => {
      if (paragraph.startsWith('### ')) {
        return <h3 key={i} className="text-xl font-bold mt-8 mb-4 text-[var(--nasa-text)] flex items-center gap-2">
          <span className="w-1 h-5 bg-[var(--nasa-accent)] inline-block rounded-sm"></span>
          {paragraph.replace('### ', '')}
        </h3>;
      }
      
      // Handle numbered lists
      if (paragraph.match(/^\d+\.\s/)) {
        const items = paragraph.split('\n').filter(item => item.trim() !== '');
        return (
          <div key={i} className="space-y-4 mb-6">
            {items.map((item, j) => {
              const text = item.replace(/^\d+\.\s/, '');
              const parts = text.split('**');
              return (
                <div key={j} className="flex gap-3 bg-[var(--nasa-bg-secondary)] p-4 rounded-lg border border-[var(--nasa-bg-hover)]">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--nasa-bg-hover)] text-[var(--nasa-accent)] flex items-center justify-center font-bold text-sm">
                    {j + 1}
                  </div>
                  <div className="text-[var(--nasa-text-secondary)] leading-relaxed">
                    {parts.map((part, k) => k % 2 === 1 ? <strong key={k} className="text-[var(--nasa-text)]">{part}</strong> : part)}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      // Handle bullet points
      if (paragraph.startsWith('* ')) {
        const items = paragraph.split('\n').filter(item => item.trim() !== '').map(item => item.replace('* ', ''));
        return (
          <ul key={i} className="list-disc pl-6 space-y-2 mb-6 text-[var(--nasa-text-secondary)] marker:text-[var(--nasa-accent)]">
            {items.map((item, j) => {
              const parts = item.split('**');
              return (
                <li key={j} className="pl-2">
                  {parts.map((part, k) => k % 2 === 1 ? <strong key={k} className="text-[var(--nasa-text)]">{part}</strong> : part)}
                </li>
              );
            })}
          </ul>
        );
      }
      
      // Handle bold text in paragraphs
      const parts = paragraph.split('**');
      return (
        <p key={i} className="mb-6 text-[var(--nasa-text-secondary)] leading-relaxed text-lg">
          {parts.map((part, k) => k % 2 === 1 ? <strong key={k} className="text-[var(--nasa-text)]">{part}</strong> : part)}
        </p>
      );
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--nasa-bg)] relative">
      {/* Hero Image Background */}
      {lesson.imageUrl && (
        <div className="absolute top-0 left-0 w-full h-96 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--nasa-bg)]/80 to-[var(--nasa-bg)] z-10" />
          <img src={lesson.imageUrl} alt={lesson.title} className="w-full h-full object-cover opacity-40" />
        </div>
      )}

      <div className="max-w-4xl mx-auto py-12 px-8 relative z-20">
        
        {/* Header */}
        <div className="mb-12 space-y-6 pt-16">
          <div className="flex items-center gap-3 text-sm text-[var(--nasa-text-secondary)] font-medium uppercase tracking-wider">
            <Badge variant="outline" className="bg-[var(--nasa-accent)]/10 text-[var(--nasa-accent)] border-[var(--nasa-accent)]/30 px-3 py-1">
              {lesson.module}
            </Badge>
            <span>{lesson.moduleTitle}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[var(--nasa-text)] leading-tight">
            {lesson.title}
          </h1>
          <div className="p-6 bg-[var(--nasa-bg-secondary)]/80 backdrop-blur-sm text-[var(--nasa-text-secondary)] rounded-xl border border-[var(--nasa-bg-hover)] shadow-2xl">
            <strong className="block mb-2 text-[var(--nasa-accent)] uppercase tracking-widest text-sm">Mission Objective</strong>
            <p className="text-lg leading-relaxed">{lesson.objective}</p>
          </div>
        </div>

        {/* Video Embed */}
        {lesson.videoId && (
          <div className="mb-12 rounded-xl overflow-hidden border border-[var(--nasa-bg-hover)] shadow-2xl aspect-video bg-black">
            <iframe 
              width="100%" 
              height="100%" 
              src={`https://www.youtube.com/embed/${lesson.videoId}?rel=0`} 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        )}

        <Separator className="my-12 border-[var(--nasa-bg-hover)]" />

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          {renderContent(lesson.content)}
        </div>

        {/* Interactive Component */}
        <div className="my-16 p-1 bg-gradient-to-b from-[var(--nasa-bg-hover)] to-[var(--nasa-bg-secondary)] rounded-2xl shadow-2xl">
          <div className="bg-[var(--nasa-bg-secondary)] rounded-xl overflow-hidden">
            <div className="bg-[var(--nasa-bg-tertiary)] px-6 py-3 border-b border-[var(--nasa-bg-hover)] flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="ml-2 text-xs font-mono text-[var(--nasa-text-secondary)] uppercase tracking-widest">Interactive Simulator</span>
            </div>
            <div className="p-2">
              {renderInteractive()}
            </div>
          </div>
        </div>

        <Separator className="my-12 border-[var(--nasa-bg-hover)]" />

        {/* Quiz Section */}
        {lesson.quiz && lesson.quiz.length > 0 && (
          <div className="mt-16 mb-24">
            <h3 className="text-2xl font-black mb-8 text-[var(--nasa-text)] flex items-center gap-3 uppercase tracking-wide">
              <span className="bg-[var(--nasa-accent)] text-white p-2 rounded-lg shadow-lg shadow-[var(--nasa-accent)]/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </span>
              Knowledge Check
            </h3>
            
            {lesson.quiz.map((q, qIndex) => (
              <Card key={qIndex} className="border-[var(--nasa-bg-hover)] bg-[var(--nasa-bg-secondary)] shadow-xl overflow-hidden">
                <CardHeader className="bg-[var(--nasa-bg-tertiary)] border-b border-[var(--nasa-bg-hover)] py-6">
                  <CardTitle className="text-xl leading-relaxed text-[var(--nasa-text)] font-medium">{q.question}</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  <div className="grid gap-4">
                    {q.options.map((option, oIndex) => {
                      const selectedAnswer = selectedAnswers[qIndex];
                      const showExplanation = showExplanations[qIndex];
                      let variant: "outline" | "default" | "destructive" = "outline";
                      let className = "justify-start h-auto py-5 px-6 text-left whitespace-normal text-base transition-all duration-200 border-[var(--nasa-bg-hover)] text-[var(--nasa-text-secondary)] hover:bg-[var(--nasa-bg-hover)] hover:text-[var(--nasa-text)]";
                      
                      if (showExplanation) {
                        if (oIndex === q.correctAnswer) {
                          variant = "default";
                          className = "justify-start h-auto py-5 px-6 text-left whitespace-normal text-base bg-green-600 hover:bg-green-700 text-white border-green-600 shadow-lg shadow-green-900/20";
                        } else if (oIndex === selectedAnswer) {
                          variant = "destructive";
                          className = "justify-start h-auto py-5 px-6 text-left whitespace-normal text-base bg-red-900/50 text-red-200 border-red-800 hover:bg-red-900/50";
                        } else {
                          className += " opacity-30";
                        }
                      } else if (selectedAnswer === oIndex) {
                        variant = "default";
                        className = "justify-start h-auto py-5 px-6 text-left whitespace-normal text-base bg-[var(--nasa-accent)] hover:bg-[var(--nasa-accent)] text-white border-[var(--nasa-accent)]";
                      }

                      return (
                        <Button
                          key={oIndex}
                          variant={variant}
                          className={className}
                          onClick={() => handleAnswer(qIndex, oIndex)}
                          disabled={showExplanation}
                        >
                          <span className="mr-4 font-bold opacity-70 text-[var(--nasa-accent)]">{String.fromCharCode(65 + oIndex)}.</span>
                          {option}
                        </Button>
                      );
                    })}
                  </div>

                  {showExplanations[qIndex] && (
                    <div className={`mt-8 p-6 rounded-xl border ${selectedAnswers[qIndex] === q.correctAnswer ? 'bg-green-900/20 border-green-800 text-green-100' : 'bg-red-900/20 border-red-800 text-red-100'}`}>
                      <div className="font-bold mb-3 flex items-center gap-2 text-lg">
                        {selectedAnswers[qIndex] === q.correctAnswer ? '✅ Correct!' : '❌ Incorrect.'}
                      </div>
                      <p className="text-base leading-relaxed opacity-90">{q.explanation}</p>
                      
                      <Button 
                        variant="outline" 
                        className="mt-6 bg-transparent border-[var(--nasa-bg-hover)] text-[var(--nasa-text-secondary)] hover:bg-[var(--nasa-bg-hover)] hover:text-[var(--nasa-text)]"
                        onClick={() => {
                          setSelectedAnswers(prev => {
                            const newAnswers = { ...prev };
                            delete newAnswers[qIndex];
                            return newAnswers;
                          });
                          setShowExplanations(prev => {
                            const newExplanations = { ...prev };
                            delete newExplanations[qIndex];
                            return newExplanations;
                          });
                        }}
                      >
                        Retry Mission
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
