import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';

// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Store original console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

// Helper function to get current hour-based log file
const getHourlyLogFile = () => {
  const now = new Date();
  const hourlyTimestamp = format(now, 'yyyy-MM-dd-HH');
  return path.join(logDir, `app-${hourlyTimestamp}.log`);
};

// Helper function to format log message
const formatLogMessage = (level: string, args: any[]) => {
  const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS');
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  
  return `[${timestamp}] [${level}] ${message}\n`;
};

// Override console methods
console.log = (...args: any[]) => {
  // Call original method
  originalConsoleLog(...args);
  
  // Write to hourly log file
  const logFile = getHourlyLogFile();
  const logMessage = formatLogMessage('INFO', args);
  
  fs.appendFile(logFile, logMessage, (err) => {
    if (err) originalConsoleError('Error writing to log file:', err);
  });
};

console.error = (...args: any[]) => {
  // Call original method
  originalConsoleError(...args);
  
  // Write to hourly log file
  const logFile = getHourlyLogFile();
  const logMessage = formatLogMessage('ERROR', args);
  
  fs.appendFile(logFile, logMessage, (err) => {
    if (err) originalConsoleError('Error writing to log file:', err);
  });
};

console.warn = (...args: any[]) => {
  // Call original method
  originalConsoleWarn(...args);
  
  // Write to hourly log file
  const logFile = getHourlyLogFile();
  const logMessage = formatLogMessage('WARN', args);
  
  fs.appendFile(logFile, logMessage, (err) => {
    if (err) originalConsoleError('Error writing to log file:', err);
  });
};

console.info = (...args: any[]) => {
  // Call original method
  originalConsoleInfo(...args);
  
  // Write to hourly log file
  const logFile = getHourlyLogFile();
  const logMessage = formatLogMessage('INFO', args);
  
  fs.appendFile(logFile, logMessage, (err) => {
    if (err) originalConsoleError('Error writing to log file:', err);
  });
};

// Helper function to clean up old log files (keep last 7 days)
export const cleanupOldLogs = () => {
  fs.readdir(logDir, (err, files) => {
    if (err) {
      originalConsoleError('Error reading log directory:', err);
      return;
    }
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    files.forEach(file => {
      if (!file.startsWith('app-')) return;
      
      // Extract date from filename (app-yyyy-MM-dd-HH.log)
      const dateStr = file.substring(4, 14);
      const fileDate = new Date(dateStr);
      
      if (fileDate < sevenDaysAgo) {
        fs.unlink(path.join(logDir, file), (err) => {
          if (err) originalConsoleError('Error deleting old log file:', err);
        });
      }
    });
  });
};

// Run cleanup once a day
setInterval(cleanupOldLogs, 24 * 60 * 60 * 1000);

// Logger module interface
interface LoggerModule {
  init: () => void;
}

// Logger module implementation
const loggerModule: LoggerModule = {
  init: () => {
    // This function is just a placeholder to allow importing this file
    // The overrides happen when the file is imported
  }
};

export default loggerModule;
