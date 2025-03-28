
import JSZip from 'jszip';

// Interface for parsed chat data
export interface ParsedChat {
  success: boolean;
  content: string;
  type: 'whatsapp' | 'telegram';
  currentUser?: string;
}

// Parse to determine the current user from WhatsApp chat
const extractCurrentUser = (content: string): string | undefined => {
  // Try to find lines with "You:" or similar patterns
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.includes('You:')) {
      return 'You';
    }
    
    // Look for message patterns to extract sender
    const matches = line.match(/\[\d{1,2}\/\d{1,2}\/\d{2,4},\s\d{1,2}:\d{2}:\d{2}\s[AP]M\]\s([^:]+):/);
    if (matches && matches[1]) {
      // If we find a sender that isn't a system message, we might guess this is the current user
      const potentialUser = matches[1].trim();
      if (!potentialUser.includes('added') && 
          !potentialUser.includes('removed') && 
          !potentialUser.includes('left') && 
          !potentialUser.toLowerCase().includes('group')) {
        return potentialUser;
      }
    }
  }
  
  return undefined;
};

// WhatsApp chat parsing
export const parseWhatsAppZip = async (file: File): Promise<ParsedChat> => {
  try {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);
    
    // WhatsApp exports typically contain a _chat.txt file
    let chatFile = zipContent.file("_chat.txt");
    
    if (!chatFile) {
      // Try to find any text file that might contain chat data
      const textFiles = Object.keys(zipContent.files).filter(
        name => name.endsWith('.txt')
      );
      
      if (textFiles.length === 0) {
        throw new Error("Invalid WhatsApp export: No chat file found");
      }
      
      // Use the first text file found
      chatFile = zipContent.file(textFiles[0]);
      if (!chatFile) {
        throw new Error("Invalid WhatsApp export: No chat file found");
      }
    }
    
    const chatContent = await chatFile.async("string");
    const currentUser = extractCurrentUser(chatContent);
    
    return {
      success: true,
      content: chatContent,
      type: 'whatsapp',
      currentUser
    };
  } catch (error) {
    console.error("Error parsing WhatsApp zip:", error);
    throw new Error("Failed to parse WhatsApp export");
  }
};

// Extract current user from Telegram HTML
const extractTelegramUser = (content: string): string | undefined => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Look for messages with the "from_me" class
    const myMessages = doc.querySelectorAll('.from_me, .outgoing');
    if (myMessages.length > 0) {
      // Try to find the username from these messages
      for (let i = 0; i < myMessages.length; i++) {
        const nameElement = myMessages[i].querySelector('.from_name');
        if (nameElement && nameElement.textContent) {
          return nameElement.textContent.trim();
        }
      }
    }
    
    return undefined;
  } catch (error) {
    console.error("Error extracting Telegram user:", error);
    return undefined;
  }
};

// Telegram HTML parsing
export const parseTelegramHTML = async (file: File): Promise<ParsedChat> => {
  try {
    const content = await file.text();
    
    // Basic validation to check if it's likely a Telegram export
    if (!content.includes('<!DOCTYPE html>') || !content.includes('Telegram')) {
      throw new Error("Invalid Telegram export: File doesn't appear to be a Telegram chat export");
    }
    
    const currentUser = extractTelegramUser(content);
    
    return {
      success: true,
      content: content,
      type: 'telegram',
      currentUser
    };
  } catch (error) {
    console.error("Error parsing Telegram HTML:", error);
    throw new Error("Failed to parse Telegram export");
  }
};

// Main function to detect and parse the appropriate format
export const parseChat = async (file: File): Promise<ParsedChat> => {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.zip')) {
    return parseWhatsAppZip(file);
  } else if (fileName.endsWith('.html')) {
    return parseTelegramHTML(file);
  } else {
    throw new Error("Unsupported file format. Please upload a WhatsApp (.zip) or Telegram (.html) export.");
  }
};
