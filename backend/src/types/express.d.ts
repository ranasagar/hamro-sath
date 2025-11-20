// Extend Express Request type to include user property
declare namespace Express {
  export interface Request {
    user?: {
      userId: number;
      id: number; // Alias for userId for compatibility
      email: string;
      role: string;
    };
  }
}
