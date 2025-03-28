
import React from 'react';
import { 
  MessageSquare, Image, Clock, Sticker, FileText,
  ArrowDown, ArrowUp, Phone, PhoneOutgoing, PhoneIncoming
} from 'lucide-react';
import StatCard from './StatCard';
import { formatDuration } from '@/utils/formatters';
import { ChatAnalytics } from '@/utils/analyzeChat';

interface AnalyticsDashboardProps {
  analytics: ChatAnalytics;
  className?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ analytics, className }) => {
  return (
    <div className={`space-y-8 animate-fade-in ${className}`}>
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