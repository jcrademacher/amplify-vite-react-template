import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
    Schedule: a
        .model({
            name: a.string().required(),
            startDates: a.datetime().required().array().required(),
            endDates: a.datetime().required().array().required(),
            activityPrototypes: a.hasMany('ActivityPrototype', 'scheduleId'),
            globalActivities: a.hasMany('GlobalActivity', 'scheduleId')
        })
        .authorization((allow) => [
            allow.authenticated().to(['create', 'read']),
            allow.owner().to(['create', 'read', 'update'])
        ]),

    LegActivity: a
        .model({
            startTime: a.datetime().required(),
            shadow: a.boolean().required(), // 0 = no shadow, 1 = shadow
            leg: a.integer().required().array().required(),
            supportName: a.string(),
            activityPrototypeId: a.id().required(),
            activityPrototype: a.belongsTo('ActivityPrototype', 'activityPrototypeId')
        })
        .authorization((allow) => [allow.authenticated()]),
    
    GlobalActivity: a.
        model({
            startTime: a.datetime().required(),
            name: a.string().required(),
            duration: a.float().required(),
            scheduleId: a.id().required(),
            schedule: a.belongsTo('Schedule', 'scheduleId')
        })
        .authorization((allow) => [allow.authenticated()]),

    ActivityPrototype: a
        .model({
            activities: a.hasMany('LegActivity', 'activityPrototypeId'),
            scheduleId: a.id().required(),
            schedule: a.belongsTo('Schedule', 'scheduleId'),
            name: a.string().required(),
            duration: a.float().required(),
            type: a.string().required(),
            preferredDays: a.integer().required().array(),
            requiredDays: a.integer().required().array(),
            groupSize: a.integer().required(),
            zone: a.string().required(),
            isRequired: a.boolean().required()
        })
        .authorization((allow) => [allow.authenticated()])
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: "userPool",
        // API Key is used for a.allow.public() rules
        apiKeyAuthorizationMode: {
            expiresInDays: 30,
        },
    },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
