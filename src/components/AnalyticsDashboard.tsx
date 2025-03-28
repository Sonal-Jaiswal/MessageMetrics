import React, { useState } from 'react';
import { 
  MessageSquare, Image, Clock, Sticker, FileText,
  ArrowDown, ArrowUp, Phone, PhoneOutgoing, PhoneIncoming,
  Search, X
} from 'lucide-react';
import StatCard from './StatCard';
import { formatDuration } from '@/utils/formatters';
import { ChatAnalytics } from '@/utils/analyzeChat';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { SearchResult } from '@/utils/searchUtils';

interface AnalyticsDashboardProps {
  analytics: ChatAnalytics;
  className?: string;
  searchFunction?: (term: string) => SearchResult[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  analytics, 
  className,
  searchFunction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const handleSearch = () => {
    if (!searchFunction || !searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = searchFunction(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching chat:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
  };
  
  return (
    <div className={`space-y-8 animate-fade-in ${className}`}>
      {searchFunction && (
        <div className="glass rounded-xl card-shadow inner-border p-6">
          <h2 className="text-xl font-medium mb-4">Search Chat</h2>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search for specific words or phrases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pr-8"
              />
              {searchTerm && (
                <button 
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isSearching || !searchTerm.trim()}
              className="flex items-center gap-2"
            >
              <Search size={16} />
              Search
            </Button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="mt-4 border rounded-md overflow-hidden">
              <div className="bg-muted/50 p-3 border-b">
                <span className="font-medium">Found {searchResults.length} matches for "{searchTerm}"</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {searchResults.map((result, idx) => (
                  <div 
                    key={idx} 
                    className="p-3 border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      {result.timestamp && (
                        <span className="font-medium">{result.timestamp}</span>
                      )}
                      {result.sender && (
                        <span className="font-medium text-primary">{result.sender}</span>
                      )}
                    </div>
                    <p className="text-sm">
                      {result.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {searchTerm && searchResults.length === 0 && !isSearching && (
            <div className="text-center p-4 text-muted-foreground">
              No matches found for "{searchTerm}"
            </div>
          )}
        </div>
      )}
      
      <div className="glass rounded-xl card-shadow inner-border p-8">
        <h2 className="text-2xl font-medium mb-6">Chat Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Messages"
            value={analytics.totalMessages}
            icon={MessageSquare}
            variant="primary"
          />
          <StatCard
            title="Messages Sent"
            value={analytics.messagesSent}
            icon={ArrowUp}
          />
          <StatCard
            title="Messages Received"
            value={analytics.messagesReceived}
            icon={ArrowDown}
          />
          <StatCard
            title="Short Replies"
            value={analytics.shortReplies}
            icon={MessageSquare}
            description="Messages with 5 or fewer words"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-xl card-shadow inner-border p-8">
          <h3 className="text-xl font-medium mb-4">Calls</h3>
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="Outgoing Calls"
              value={analytics.outgoingCalls}
              icon={PhoneOutgoing}
            />
            <StatCard
              title="Incoming Calls"
              value={analytics.incomingCalls}
              icon={PhoneIncoming}
            />
            <StatCard
              title="Total Call Time"
              value={formatDuration(analytics.totalCallDuration)}
              icon={Clock}
              variant="primary"
            />
            <StatCard
              title="Average Call"
              value={formatDuration(analytics.averageCallDuration)}
              icon={Phone}
            />
          </div>
        </div>
        
        <div className="glass rounded-xl card-shadow inner-border p-8">
          <h3 className="text-xl font-medium mb-4">Media</h3>
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="Images Sent"
              value={analytics.imagesSent}
              icon={ArrowUp}
            />
            <StatCard
              title="Images Received"
              value={analytics.imagesReceived}
              icon={ArrowDown}
            />
            <StatCard
              title="Stickers Sent"
              value={analytics.stickersSent}
              icon={Sticker}
            />
            <StatCard
              title="Stickers Received"
              value={analytics.stickersReceived}
              icon={Sticker}
            />
          </div>
        </div>
      </div>

      <div className="glass rounded-xl card-shadow inner-border p-8">
        <h3 className="text-xl font-medium mb-4">Text Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Long Messages Sent"
            value={analytics.longMessagesSent}
            icon={FileText}
            description="Messages with 50+ words"
          />
          <StatCard
            title="Long Messages Received"
            value={analytics.longMessagesReceived}
            icon={FileText}
            description="Messages with 50+ words"
          />
          <StatCard
            title="Average Message Length"
            value={`${Math.round(analytics.avgMessageLength)} words`}
            icon={MessageSquare}
            variant="primary"
          />
          <StatCard
            title="Reply Rate"
            value={`${Math.round(analytics.replyRate * 100)}%`}
            icon={MessageSquare}
            description="Messages that received a reply"
          />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;