import type { Schema } from '../../data/resource';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from '$amplify/env/analyze'; 

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: Schema["analyze"]["functionHandler"] = async (event, context) => {
    // your function code goes here
    const { scheduleId } = event.arguments;

    let retval = await client.models.Schedule.get({ id: scheduleId });
    if(retval.data) {
        let sch = retval.data;
        
    }
    else {
        console.log(retval.errors);
        throw new Error(retval.errors?.map((el) => el.message).join(','));
    }

    

    return 'Hello, World!';
};