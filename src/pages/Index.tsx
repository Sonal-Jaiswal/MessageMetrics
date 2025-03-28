
import React, { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { useToast } from '@/hooks/use-toast';
import { ChatAnalytics, analyzeChat, emptyAnalytics } from '@/utils/analyzeChat';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analytics, setAnalytics] = useState<ChatAnalytics | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelected = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      // Show toast indicating analysis has started
      toast({
        title: "Analysis Started",
        description: `Analyzing ${selectedFile.name}...`,
      });
      
      console.log("Starting analysis of file:", selectedFile.name);
      
      // Begin analysis of the file
      const results = await analyzeChat(selectedFile);
      
      console.log("Analysis completed successfully:", results);
      
      if (results.totalMessages === 0) {
        throw new Error("No messages were found in the chat export. Please check the file format.");
      }
      
      setAnalytics(results);
      
      toast({
        title: "Analysis Complete",
        description: `Found ${results.totalMessages} messages in your chat!`,
      });
    } catch (error) {
      console.error('Error analyzing file:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to analyze chat data";
      setAnalysisError(errorMessage);
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setAnalytics(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/30">
      <header className="w-full glass card-shadow inner-border px-6 py-4 mb-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <MessageSquare size={20} />
            </div>
            <h1 className="text-xl font-medium">Chat Analyzer</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 pb-20">
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
          <h1 className="mb-3">Analyze Your Chat Data</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Upload your WhatsApp or Telegram chat export and get detailed insights about your conversation patterns, media sharing, and more.
          </p>
        </div>
        
        {!analytics && (
          <>
            <FileUploader 
              onFileSelected={handleFileSelected} 
              isLoading={isAnalyzing} 
            />
            
            {analysisError && (
              <div className="mt-6 p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive flex items-start gap-3">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium mb-1">Error Analyzing Chat</h3>
                  <p>{analysisError}</p>
                  <p className="mt-2 text-sm">
                    Please ensure you're uploading a valid WhatsApp (.zip) or Telegram (.html) chat export file.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
        
        {analytics && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-medium">Analysis Results</h2>
              <button
                onClick={() => {
                  setAnalytics(null);
                  setAnalysisError(null);
                }}
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Analyze Another Chat
              </button>
            </div>
            
            <AnalyticsDashboard analytics={analytics} />
          </div>
        )}
      </main>
      
      <footer className="glass card-shadow inner-border w-full py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Upload your WhatsApp (.zip) or Telegram (.html) chat export file for analysis.</p>
          <p className="mt-1">Your data is processed locally and never leaves your browser.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
