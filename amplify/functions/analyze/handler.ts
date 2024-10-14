import type { Schema } from '../../data/resource';

export const handler: Schema["analyze"]["functionHandler"] = async (event) => {
    // your function code goes here
    const { name } = event.arguments;
    
    return 'Hello, World!';
};