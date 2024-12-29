import { defineFunction } from '@aws-amplify/backend';

export const analyze = defineFunction({
  // optionally specify a name for the Function (defaults to directory name)
  name: 'analyze',
  // optionally specify a path to your handler (defaults to "./handler.ts")
  entry: './handler.ts',
  
});