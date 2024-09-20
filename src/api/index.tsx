import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource.ts";

export const client = generateClient<Schema>();
