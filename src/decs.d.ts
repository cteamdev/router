declare interface Process {
  env: ProcessEnv;
}

declare interface ProcessEnv {
  NODE_ENV: 'production' | 'development';

  [key: string]: string | undefined;
}

declare const process: Process;
