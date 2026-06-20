import mongodb from "../database/index.mts";
import type { Newsletter } from "./types.mts";
import type { Collection } from "mongodb";

async function getNewsletterEmail(email: string): Promise<Newsletter | null> {
    const data = (await mongodb.getDb().collection<Newsletter>("newsletter").findOne({email: email}));
    return data;
}

async function signupNewsletter(newSignup:{email: string, name: string}) {
    const result = await mongodb.getDb().collection("newsletter").insertOne(newSignup)
    return result;
}

export default {
    getNewsletterEmail, signupNewsletter
}