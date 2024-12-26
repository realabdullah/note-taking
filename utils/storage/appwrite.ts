import { Client, Databases, Account } from "appwrite";

const url: string = import.meta.env.VITE_APPWRITE_ENDPOINT;
const project: string = import.meta.env.VITE_APPWRITE_PROJECT_ID;

const client: Client = new Client();
client.setEndpoint(url).setProject(project);

const awDBconfig = {
    DATABASE_ID: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    COLLECTION_ID: import.meta.env.VITE_APPWRITE_COLLECTION_ID,
}

export const awAccount: Account = new Account(client);
export const awDatabase: Databases = new Databases(client);
export { ID as awID, Query as awQuery } from "appwrite";
export { awDBconfig }
