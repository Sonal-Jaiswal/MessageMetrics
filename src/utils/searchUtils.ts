
import { ParsedChat } from './chatParser';

export interface SearchResult {
  lineNumber: number;
  message: string;
  timestamp: string;
  sender: string;
}

/**
 * Searches through chat content for specific words or phrases
 */
export const searchChatContent = (
  chatContent: string,
  searchTerm: string
): SearchResult[] => {
  if (!searchTerm.trim()) return [];
  
  const lines = chatContent.split('\n');
  const results: SearchResult[] = [];
  const searchTermLower = searchTerm.toLowerCase();
  
  // Go through each line in the chat
  lines.forEach((line, index) => {
    if (line.toLowerCase().includes(searchTermLower)) {
      // Parse the line to extract timestamp and sender
      let timestamp = '';
      let sender = '';
      let message = line;
      
      // Try to match WhatsApp timestamp format [DD/MM/YY, HH:MM:SS]
      const timestampMatch = line.match(/\[([^\]]+)\]/);
      if (timestampMatch && timestampMatch[1]) {
        timestamp = timestampMatch[1];
        
        // Extract sender if available
        const senderMatch = line.match(/]\s([^:]+):/);
        if (senderMatch && senderMatch[1]) {
          sender = senderMatch[1].trim();
          
          // Extract the actual message content
          const contentMatch = line.match(/]\s[^:]+:\s(.+)$/);
          if (contentMatch && contentMatch[1]) {
            message = contentMatch[1].trim();
          }
        }
      }
      
      results.push({
        lineNumber: index + 1,
        message,
        timestamp,
        sender
      });
    }
  });
  
  return results;
};