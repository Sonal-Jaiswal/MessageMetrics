
import { parseChat, ParsedChat } from './chatParser';

export interface ChatAnalytics {
  totalMessages: number;
  messagesSent: number;
  messagesReceived: number;
  shortReplies: number;
  outgoingCalls: number;
  incomingCalls: number;
  totalCallDuration: number;
  averageCallDuration: number;
  imagesSent: number;
  imagesReceived: number;
  stickersSent: number;
  stickersReceived: number;
  longMessagesSent: number;
  longMessagesReceived: number;
  avgMessageLength: number;
  replyRate: number;
}

// Default empty analytics object
export const emptyAnalytics: ChatAnalytics = {
  totalMessages: 0,
  messagesSent: 0,
  messagesReceived: 0,
  shortReplies: 0,
  outgoingCalls: 0,
  incomingCalls: 0,
  totalCallDuration: 0,
  averageCallDuration: 0,
  imagesSent: 0,
  imagesReceived: 0,
  stickersSent: 0,
  stickersReceived: 0,
  longMessagesSent: 0,
  longMessagesReceived: 0,
  avgMessageLength: 0,
  replyRate: 0,
};

// Helper to identify if a line contains an image
const isImageMessage = (line: string): boolean => {
  return line.includes('image omitted') || 
         line.includes('<image>') ||
         line.includes('IMG-') ||
         line.includes('.jpg') || 
         line.includes('.jpeg') || 
         line.includes('.png') || 
         line.includes('.gif');
};

// Helper to identify if a line contains a sticker
const isStickerMessage = (line: string): boolean => {
  return line.includes('sticker omitted') || 
         line.includes('<sticker>') || 
         line.includes('sticker.webp');
};

// Helper to identify if a line contains a call
const isCallMessage = (line: string): boolean => {
  return line.includes('Missed voice call') || 
         line.includes('voice call') || 
         line.includes('video call') || 
         line.includes('call ended') || 
         line.includes('call time');
};

// Extract call duration in seconds from a call message
const extractCallDuration = (line: string): number => {
  // Try to find patterns like "call time 5:23" or "call ended (Duration: 10:45)"
  const durationMatch = line.match(/(\d+):(\d+)/);
  
  if (durationMatch) {
    const minutes = parseInt(durationMatch[1], 10);
    const seconds = parseInt(durationMatch[2], 10);
    return (minutes * 60) + seconds;
  }
  
  return 0;
};

// Identify if a message is from the current user or not
const isFromCurrentUser = (line: string, currentUser?: string): boolean => {
  if (!currentUser) {
    // If no current user specified, we'll try to detect patterns
    // In WhatsApp exports, messages from the user often begin with "You:"
    return line.includes("You:") || line.includes("You ");
  }
  
  return line.includes(`${currentUser}:`);
};

// Count words in a message
const countWords = (text: string): number => {
  const cleanText = text.replace(/[^\w\s]/g, '').trim();
  return cleanText.split(/\s+/).filter(Boolean).length;
};

// Extract message content from a WhatsApp message line
const extractWhatsAppMessageContent = (line: string): string => {
  // Try to match the content after the timestamp and sender
  const contentMatch = line.match(/]:\s(.+)$/);
  if (contentMatch) {
    return contentMatch[1].trim();
  }
  return '';
};

// Process WhatsApp chat data
const processWhatsAppChat = (content: string, currentUser?: string): ChatAnalytics => {
  const analytics: ChatAnalytics = { ...emptyAnalytics };
  let totalWordCount = 0;
  let messagesWithResponses = 0;
  let previousMessageFromUser = false;
  
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines
    if (!line.trim()) continue;
    
    // Check if it's a message line (has a timestamp)
    // This regex matches various date/time formats used in WhatsApp exports
    const isMessageLine = /\[\d{1,2}\/\d{1,2}\/(\d{2,4}|\d{2}),\s\d{1,2}:\d{2}(:\d{2})?\s?([AP]M)?\]/.test(line);
    
    if (isMessageLine) {
      // This is a new message
      analytics.totalMessages++;
      
      // Check if from current user
      const fromCurrentUser = isFromCurrentUser(line, currentUser);
      
      if (fromCurrentUser) {
        analytics.messagesSent++;
        
        // Check if current message got a response
        if (i < lines.length - 1 && !isFromCurrentUser(lines[i + 1], currentUser)) {
          messagesWithResponses++;
        }
        
        previousMessageFromUser = true;
      } else {
        analytics.messagesReceived++;
        previousMessageFromUser = false;
      }
      
      // Check for media
      if (isImageMessage(line)) {
        fromCurrentUser ? analytics.imagesSent++ : analytics.imagesReceived++;
      }
      
      if (isStickerMessage(line)) {
        fromCurrentUser ? analytics.stickersSent++ : analytics.stickersReceived++;
      }
      
      // Check for calls
      if (isCallMessage(line)) {
        if (line.includes('Missed')) {
          // Skip missed calls in duration calculation
          continue;
        }
        
        if (fromCurrentUser || line.includes('outgoing')) {
          analytics.outgoingCalls++;
        } else {
          analytics.incomingCalls++;
        }
        
        const callDuration = extractCallDuration(line);
        analytics.totalCallDuration += callDuration;
      }
      
      // Extract actual message content
      const messageContent = extractWhatsAppMessageContent(line);
      const wordCount = countWords(messageContent);
      totalWordCount += wordCount;
      
      // Check for short replies (5 or fewer words)
      if (wordCount <= 5 && wordCount > 0) {
        analytics.shortReplies++;
      }
      
      // Check for long messages (50+ words)
      if (wordCount >= 50) {
        fromCurrentUser ? analytics.longMessagesSent++ : analytics.longMessagesReceived++;
      }
    }
  }
  
  // Calculate averages and rates
  if (analytics.totalMessages > 0) {
    analytics.avgMessageLength = totalWordCount / analytics.totalMessages;
  }
  
  if (analytics.outgoingCalls + analytics.incomingCalls > 0) {
    analytics.averageCallDuration = 
      analytics.totalCallDuration / (analytics.outgoingCalls + analytics.incomingCalls);
  }
  
  if (analytics.messagesSent > 0) {
    analytics.replyRate = messagesWithResponses / analytics.messagesSent;
  }
  
  return analytics;
};

// Process Telegram chat data
const processTelegramChat = (content: string, currentUser?: string): ChatAnalytics => {
  const analytics: ChatAnalytics = { ...emptyAnalytics };
  let totalWordCount = 0;
  let messagesWithResponses = 0;
  let previousMessageFromUser = false;
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Find message elements
    const messageElements = doc.querySelectorAll('.message');
    
    messageElements.forEach((element, index) => {
      analytics.totalMessages++;
      
      // Check if from current user
      const fromClass = element.classList.contains('from_me') || 
                        element.classList.contains('outgoing');
      
      if (fromClass) {
        analytics.messagesSent++;
        
        // Check if current message got a response
        if (index < messageElements.length - 1 && 
            !messageElements[index + 1].classList.contains('from_me') && 
            !messageElements[index + 1].classList.contains('outgoing')) {
          messagesWithResponses++;
        }
        
        previousMessageFromUser = true;
      } else {
        analytics.messagesReceived++;
        previousMessageFromUser = false;
      }
      
      // Check for media
      if (element.querySelector('img') || element.innerHTML.includes('photo')) {
        fromClass ? analytics.imagesSent++ : analytics.imagesReceived++;
      }
      
      if (element.innerHTML.includes('sticker')) {
        fromClass ? analytics.stickersSent++ : analytics.stickersReceived++;
      }
      
      // Check for calls
      if (element.innerHTML.includes('call')) {
        if (element.innerHTML.includes('outgoing')) {
          analytics.outgoingCalls++;
        } else {
          analytics.incomingCalls++;
        }
        
        // Try to extract call duration
        const durationMatch = element.innerHTML.match(/(\d+):(\d+)/);
        if (durationMatch) {
          const minutes = parseInt(durationMatch[1], 10);
          const seconds = parseInt(durationMatch[2], 10);
          analytics.totalCallDuration += (minutes * 60) + seconds;
        }
      }
      
      // Extract message text
      const textElement = element.querySelector('.text');
      if (textElement) {
        const messageContent = textElement.textContent || '';
        const wordCount = countWords(messageContent);
        totalWordCount += wordCount;
        
        // Check for short replies
        if (wordCount <= 5 && wordCount > 0) {
          analytics.shortReplies++;
        }
        
        // Check for long messages
        if (wordCount >= 50) {
          fromClass ? analytics.longMessagesSent++ : analytics.longMessagesReceived++;
        }
      }
    });
    
    // Calculate averages and rates
    if (analytics.totalMessages > 0) {
      analytics.avgMessageLength = totalWordCount / analytics.totalMessages;
    }
    
    if (analytics.outgoingCalls + analytics.incomingCalls > 0) {
      analytics.averageCallDuration = 
        analytics.totalCallDuration / (analytics.outgoingCalls + analytics.incomingCalls);
    }
    
    if (analytics.messagesSent > 0) {
      analytics.replyRate = messagesWithResponses / analytics.messagesSent;
    }
    
  } catch (error) {
    console.error("Error processing Telegram chat:", error);
  }
  
  return analytics;
};

export const analyzeChat = async (
  file: File,
  currentUser?: string
): Promise<ChatAnalytics> => {
  try {
    // Parse the chat file (WhatsApp or Telegram)
    const parsedChat = await parseChat(file);
    console.log("Chat parsed successfully:", parsedChat.type);
    
    // Use the detected current user if none was provided
    const userToUse = currentUser || parsedChat.currentUser;
    console.log("Using current user:", userToUse);
    
    let analytics: ChatAnalytics;
    
    if (parsedChat.type === 'whatsapp') {
      analytics = processWhatsAppChat(parsedChat.content, userToUse);
    } else {
      analytics = processTelegramChat(parsedChat.content, userToUse);
    }
    
    console.log("Analysis results:", analytics);
    return analytics;
    
  } catch (error) {
    console.error("Error analyzing chat:", error);
    throw new Error("Failed to analyze chat data: " + (error instanceof Error ? error.message : String(error)));
  }
};
