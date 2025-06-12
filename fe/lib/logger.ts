// Simple utility to make sure logs are visible in development
const logger = {
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('\x1b[36m[DEBUG]\x1b[0m', ...args);
    }
  },
  info: (...args: any[]) => {
    console.log('\x1b[32m[INFO]\x1b[0m', ...args);
  },
  warn: (...args: any[]) => {
    console.warn('\x1b[33m[WARN]\x1b[0m', ...args);
  },
  error: (...args: any[]) => {
    console.error('\x1b[31m[ERROR]\x1b[0m', ...args);
  },
  data: (label: string, data: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`\x1b[35m[DATA:${label}]\x1b[0m`, JSON.stringify(data, null, 2));
    }
  }
};

export default logger; 