export class Logger {
  constructor() {
    console.log("Logger initialized");
  }

  log(...data: any[]) {
    console.log(...data);
  }
}
